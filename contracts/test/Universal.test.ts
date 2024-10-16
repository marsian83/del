import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";
import { describe } from "mocha";
import { maxInt256 } from "viem";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";

const minimumInitialStake = 100_000_000n;
const MINUTE = 60 * 1000;

describe("Universal", function () {
  async function deployFixture() {
    const [owner, acc1, acc2] = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();

    const usdj = await hre.viem.deployContract("USDJ");
    const usdjDecimals = BigInt(Math.pow(10, await usdj.read.decimals()));

    usdj.write.transfer([acc1.account.address, 100_000n * usdjDecimals]);
    usdj.write.transfer([acc2.account.address, 100_000n * usdjDecimals]);

    const periphery = await hre.viem.deployContract("JustInsureInterface", [
      usdj.address,
    ]);

    usdj.write.approve([periphery.address, maxInt256], {
      account: acc1.account,
    });

    await periphery.write.setMinimumInitialStake([minimumInitialStake]);
    // await periphery.write.updateStakingRewardRate([100_000_000n]);

    await periphery.write.createInsurancePolicy([
      acc1.account.address,
      "",
      "test policy",
      "TEST",
      2000000n,
      20000000n,
      200000000n,
      20000000000n,
    ]);

    const logs = await publicClient.getContractEvents({
      abi: periphery.abi,
      address: periphery.address,
      eventName: "policyCreated",
    });

    if (!logs[0].args.controller) throw "Deploy hi nahi ho paya controller";

    const controllerIntermediate = await hre.viem.getContractAt(
      "InsuranceController",
      logs[0].args.controller,
    );

    const surecoin = await hre.viem.getContractAt(
      "SureCoin",
      await periphery.read.surecoin(),
    );

    const controller: typeof controllerIntermediate & {
      completeInitialStake: () => Promise<void>;
    } = {
      ...controllerIntermediate,
      completeInitialStake: async () => {
        await controllerIntermediate.write.stakeToPolicy(
          [minimumInitialStake],
          {
            account: acc1.account,
          },
        );
      },
    };

    return {
      owner,
      acc1,
      acc2,
      publicClient,
      usdj,
      usdjDecimals,
      periphery,
      controller,
      surecoin,
    };
  }

  describe("JustInsureInterface", () => {
    it("can create new policy", async () => {
      const { controller } = await loadFixture(deployFixture);
      expect(controller.address).to.contain("0x");
    });

    it("can issue policy instance", async () => {
      const { periphery, controller, acc2 } = await loadFixture(deployFixture);

      await controller.completeInitialStake();

      const ownerBefore = await controller.read.isPolicyOwner([
        acc2.account.address,
      ]);
      expect(ownerBefore).to.be.false;

      await periphery.write.issuePolicyInstance([
        controller.address,
        acc2.account.address,
        0n,
        0n,
        100n,
      ]);

      const ownerAfter = await controller.read.isPolicyOwner([
        acc2.account.address,
      ]);
      expect(ownerAfter).to.be.true;
    });
  });

  describe("InsuranceController", () => {
    it("is initially paused", async () => {
      const { controller } = await loadFixture(deployFixture);
      const paused = await controller.read.paused();
      expect(paused).to.equal(true);
    });

    it("unpauses when initial stake is received", async () => {
      const { controller } = await loadFixture(deployFixture);
      await controller.completeInitialStake();

      const paused = await controller.read.paused();
      expect(paused).to.equal(false);
    });

    it("only allows creator to initiate initial stake", async () => {
      const { controller, acc2 } = await loadFixture(deployFixture);
      const result = controller.write.stakeToPolicy([minimumInitialStake], {
        account: acc2.account,
      });

      expect(result).to.be.rejected;
    });

    it("registers the initial stake", async () => {
      const { controller, acc1 } = await loadFixture(deployFixture);
      const stakedAmount = minimumInitialStake;

      await controller.completeInitialStake();

      const totalStake = await controller.read.totalStake();
      expect(totalStake).to.equal(stakedAmount);

      const acc1Share = await controller.read.stakedAmountOfAddress([
        acc1.account.address,
      ]);
      expect(acc1Share).to.equal(stakedAmount);
    });
  });

  describe("SureCoin", () => {
    it("registers any stake", async () => {
      const { controller, surecoin } = await loadFixture(deployFixture);

      await controller.completeInitialStake();

      const totalStake = await surecoin.read.totalStake();
      expect(totalStake).to.equal(minimumInitialStake);
    });

    it("registers earnings for stakers", async () => {
      const { controller, acc1, surecoin } = await loadFixture(deployFixture);

      await controller.completeInitialStake();
      time.increase(60 * MINUTE);

      const earned = await surecoin.read.earned([acc1.account.address]);

      expect(earned > 0n).to.be.true;
    });

    it("allows withdrawing to wallet", async () => {
      const { controller, acc1, surecoin } = await loadFixture(deployFixture);

      await controller.completeInitialStake();

      const balanceBefore = await surecoin.read.balanceOf([
        acc1.account.address,
      ]);

      time.increase(60 * MINUTE);

      const earned = await surecoin.read.earned([acc1.account.address]);

      await surecoin.write.claimRewards({ account: acc1.account });

      const balanceAfter = await surecoin.read.balanceOf([
        acc1.account.address,
      ]);

      expect(earned > 0n).to.be.true;
      expect(Number(balanceAfter - balanceBefore)).to.be.approximately(
        Number(earned),
        100,
      );
    });
  });

  describe("USDJ", () => {
    it("can be minted using native token (1 every 100 nt)", async () => {
      const { owner, usdj, usdjDecimals } = await loadFixture(deployFixture);

      const balanceBefore = await usdj.read.balanceOf([owner.account.address]);

      await usdj.write.mint({ value: 100n * BigInt(Math.pow(10, 18)) });

      const balanceAfter = await usdj.read.balanceOf([owner.account.address]);

      const usdjReceived =
        Number(balanceAfter - balanceBefore) / Number(usdjDecimals);

      expect(usdjReceived).to.equal(1);
    });
  });
});
