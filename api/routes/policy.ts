import express from "express";
import crypto from "crypto";
import Policy from "../models/Policy";
import { isAddress, verifyMessage } from "viem";
import { generateRandomHex, generateTokenSymbol } from "../utils";
import { PinataSDK } from "pinata";
import { Policy as PolicyType } from "../types/custom";
import User from "../models/User";
import executor from "../executor";
import evm from "../evm";
import evmConfig from "../../evmConfig";
import justinsureInterface from "../contracts/justinsureInterface";

const router = express.Router();

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY_URL,
});

const nonceStore: Record<string, string> = {};
router.post("/request-nonce", async (req, res) => {
  nonceStore[req.body.address] = generateRandomHex(32);
  res.status(200).send({ nonce: nonceStore[req.body.address] });
});

router.post("/new", async (req, res) => {
  const { data, sign }: { data: PolicyType; sign: any } = req.body;

  try {
    // check if creator address is valid
    const creatorAddress = data.creator;

    if (!isAddress(creatorAddress)) {
      res.status(400).json({ message: "Invalid Creator Address / Signature" });
      return;
    }

    // check if user exists and is a marketer
    const user = await User.findOne({ address: creatorAddress });

    if (!user || !user.marketer) {
      res.status(401).json({
        message: "No Marketer Account Found",
      });
      return;
    }

    // check if policy with same form data already exists
    const policyExists = await Policy.findOne({
      ...data,
    });

    if (policyExists) {
      res.status(400).json({ message: "Policy already exists" });
      return;
    }

    // check if signature is valid
    const verified = await verifyMessage({
      address: creatorAddress,
      message: `${JSON.stringify(data)}${nonceStore[creatorAddress]}`,
      signature: sign,
    });

    if (!verified) {
      res.status(401).json({ message: "Signature verification failed" });
      return;
    }

    // Save data in IPFS without tags
    const tags = data.tags;
    const image = data.image;
    delete data.tags;
    delete data.image;

    const newBlob = new Blob([JSON.stringify(data)]);
    const newFile = new File([newBlob], `policy_${new Date().getTime()}.json`);

    const upload = await pinata.upload.file(newFile);
    const cid = upload.cid;

    // Save the cid to blockchain
    const tokenSymbol = generateTokenSymbol(data.name);
    const blockNumberBeforeTx = await evm.client.getBlockNumber();

    const txHash = await justinsureInterface.write.createInsurancePolicy([
      creatorAddress,
      `ipfs://${cid}`,
      data.name,
      tokenSymbol,
      BigInt(data.minimumDuration),
      BigInt(data.maximumDuration),
      BigInt(data.minimumClaim),
      BigInt(data.maximumClaim),
    ]);

    const receipt = await evm.client.waitForTransactionReceipt({
      hash: txHash,
    });

    if (receipt.status !== "success") {
      res.status(400).json({ message: "Staking failed" });
      return;
    }

    // Get the controller address from the logs
    const logs = await evm.client.getContractEvents({
      abi: justinsureInterface.abi,
      address: justinsureInterface.address,
      eventName: "policyCreated",
      fromBlock: blockNumberBeforeTx,
      toBlock: "latest",
    });

    logs.filter((log) => log.args.creator === creatorAddress);
    const controllerAddress = logs[0].args.controller;

    if (!controllerAddress) {
      res.status(500).json({ message: "Controller address not found" });
      return;
    }

    if (!isAddress(controllerAddress)) {
      res.status(500).json({ message: "Invalid Controller address" });
      return;
    }

    const stakeTokenAddress = await evm.client.readContract({
      address: controllerAddress,
      abi: evmConfig.insuranceController.abi,
      functionName: "stakeToken",
    });

    if (!stakeTokenAddress) {
      res.status(500).json({ message: "Stake Token address not found" });
      return;
    }

    const policy = new Policy({
      ...data,
      address: controllerAddress,
      blockNumber: Number(blockNumberBeforeTx),
      stakeToken: stakeTokenAddress,
      stakeTokenSymbol: tokenSymbol,
      cid,
      image,
      tags,
    });

    await policy.save();

    res.status(200).json({
      message: "Policy created successfully",
      policy,
    });

    return;
  } catch (error: any) {
    console.error(error);
    if (error?.message) {
      res.status(500).json({ message: error?.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
    return;
  }
});

router.get("/get/:address", async (req, res) => {
  const { address } = req.params;
  const policy = await Policy.findOne({ address: address });

  res.status(200).send({ policy });
  return;
});

router.get("/fetch/all", async (req, res) => {
  try {
    const policies = await Policy.find();
    res.status(200).send({ policies });
    return;
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error?.message });
    return;
  }
});

router.get("/fetch/:address", async (req, res) => {
  const creator = req.params.address;

  try {
    const policies = await Policy.find({ creator });
    res.status(200).send({ policies });
    return;
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error?.message });
    return;
  }
});

router.get("/premium/:address/", async (req, res) => {
  try {
    if (typeof req.query.args != "string") throw "Invalid args";
    const args = JSON.parse(req.query.args) as Array<{
      arg: string;
      value: string;
    }>;

    const policy = await Policy.findOne({ address: req.params.address });
    if (!policy) {
      res.status(400).json({ message: "Policy not found.." });
      return;
    }

    const functionNameMatch = policy.premiumFunc.match(
      /def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/,
    );
    const funcName = functionNameMatch ? functionNameMatch[1] : null;

    const pyFile = `
try:

  ${policy.premiumFunc}
  
  try:
    print(${funcName}(${args.map((a) => a.value).join(",")}))
  except:
    print(-1)

except:
    print(-1)
    `;

    const key = crypto.createHash("sha256").update(pyFile).digest("hex");

    executor.outputStore[key] = {
      pycode: pyFile,
      output: null,
    };

    executor.executionQueue.push(key);

    res.send({ key: key });
    return;
  } catch (error: any) {
    console.error(error);
    if (error?.message) {
      res.status(500).json({ message: error?.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
    return;
  }
});

router.get("/stake-history/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const policy = await Policy.findOne({ address: address });

    if (!policy) {
      res.sendStatus(404);
      return;
    }
    if (!isAddress(policy.address)) {
      res.sendStatus(404);
      return;
    }

    const response = await evm.client.getContractEvents({
      abi: evmConfig.insuranceController.abi,
      address: policy.address,
      eventName: "TotalStakeChanged",
      fromBlock: BigInt(policy.blockNumber),
    });

    res.send({
      feed: response.map((e) => ({
        timestamp: Number(e.args.timestamp),
        amount: Number(e.args.amount),
      })),
    });
    return;
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
    return;
  }
});

router.post("/buy/:address", async (req, res) => {
  const { address } = req.params;
  const { user, data, sign, premium } = req.body;

  if (
    !user ||
    !data.claimValue ||
    !data.claimDuration ||
    !sign ||
    !premium ||
    !address
  ) {
    res.status(400).json({ message: "Invalid Request" });
    return;
  }

  try {
    // verify the signature
    const nonce = nonceStore[user];

    const verified = await verifyMessage({
      address: user,
      message: JSON.stringify(data) + nonce,
      signature: sign,
    });

    if (!verified) {
      res.status(401).json({ message: "Signature verification failed" });
      return;
    }

    if (!isAddress(address) || !isAddress(user)) {
      res.status(400).json({ message: "Invalid Policy Address" });
      return;
    }

    // fetch policy doc
    const policy = await Policy.findOne({ address });
    const isHolder = policy?.holders.some((h) => h.address === user);

    if (!policy) {
      res.status(400).json({ message: "Policy not found.." });
      return;
    } else if (isHolder) {
      res.status(400).json({ message: "Already owns the policy" });
      return;
    }

    const txHash = await justinsureInterface.write.issuePolicyInstance([
      address,
      user,
      BigInt(premium),
      BigInt(data.claimValue),
      BigInt(data.claimDuration),
    ]);

    const receipt = await evm.client.waitForTransactionReceipt({
      hash: txHash,
    });

    if (receipt.status !== "success") {
      res.status(400).json({ message: "Staking failed" });
      return;
    }

    // update policy doc
    const duration = data.claimDuration;
    const currentDate = Date.now();
    const claimExpiry = new Date(currentDate + Number(duration));

    policy.holders.push({
      address: user,
      premium,
      claimExpiry,
      args: data,
      status: "ongoing",
    });
    policy.markModified("holders");
    await policy.save();

    res.status(200).json({ message: "Policy bought successfully" });
    return;
  } catch (error: any) {
    console.error(error);
    if (error?.message) {
      res.status(500).json({ message: error?.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
    return;
  }
});

router.post("/update/stakers/:address", async (req, res) => {
  const { staker } = req.body;
  const address = req.params.address;

  try {
    const policy = await Policy.findOne({
      address,
    });

    if (!policy) {
      res.status(400).json({ message: "Policy not found.." });
      return;
    }

    if (!policy.stakers.includes(staker)) {
      policy.stakers.push(staker);
      await policy.save();
    }

    res.status(200).json({ message: "Stakers updated successfully.." });
    return;
  } catch (error: any) {
    console.error(error);
    if (error?.message) {
      res.status(500).json({ message: error?.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
    return;
  }
});

router.post("/claim/validate/:address", async (req, res) => {
  const { args, globalVars } = req.body;

  try {
    const argsFormatted = Object.entries(args).map(([key, value]) => {
      return { arg: key, value };
    });

    const globalVarsPython = Object.entries(globalVars)
      .map(([key, value]) => `${key} = ${value}`)
      .join("\n  ");

    const policy = await Policy.findOne({ address: req.params.address });

    if (!policy) {
      res.status(400).json({ message: "Policy not found.." });
      return;
    }

    const functionNameMatch = policy.claimFunc.match(
      /def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/,
    );

    const funcName = functionNameMatch ? functionNameMatch[1] : null;

    const pyFile = `
try:
  ${globalVarsPython}

  ${policy.claimFunc}
  
  try:
    print(${funcName}(${argsFormatted.map((a) => a.value).join(",")}))
  except:
    print(-1)

except:
    print(-1)
    `;

    const key = crypto.createHash("sha256").update(pyFile).digest("hex");

    executor.outputStore[key] = {
      pycode: pyFile,
      output: null,
    };

    executor.executionQueue.push(key);
    res.send({ key: key });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
});

router.post("/claim/issue/:address", async (req, res) => {
  const { userAddress, signedData, sign } = req.body;

  console.log({
    signedData,
  });

  try {
    const policy = await Policy.findOne({ address: req.params.address });
    if (!policy) throw "Invalid Policy Address";

    const verified = await verifyMessage({
      address: userAddress,
      message: JSON.stringify(signedData) + nonceStore[userAddress],
      signature: sign,
    });

    if (!verified) {
      res.status(401).json({ message: "Signature verification failed" });
      return;
    }

    if (!isAddress(userAddress) || !isAddress(policy.address)) {
      res.status(400).json({ message: "Invalid Address" });
      return;
    }

    const txHash = await justinsureInterface.write.issueClaimForPolicyInstance([
      policy.address,
      userAddress,
    ]);

    const receipt = await evm.client.waitForTransactionReceipt({
      hash: txHash,
    });

    if (receipt.status !== "success") {
      res.status(400).json({ message: "Claim failed" });
      return;
    }

    // update policy doc
    policy.claims.push({
      address: userAddress,
      status: "approved",
      amount: signedData.premiumArgs.claimValue || 0,
      requestedAt: new Date(),
      approvedAt: new Date(),
    });

    // remove the holder
    policy.holders = policy.holders.filter(
      (holder) => holder.address !== userAddress,
    );

    policy.markModified("holders", "claims");
    await policy.save();

    res.status(200).json({ message: "Claim requested successfully.." });
    return;
  } catch (error: any) {
    console.error(error);
    if (error?.message) {
      res.status(500).json({ message: error?.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
    return;
  }
});

router.post("/rate/:address", async (req, res) => {
  const { user, rating } = req.body;

  try {
    const policy = await Policy.findOne({ address: req.params.address });
    if (!policy) {
      res.send(400).json({ message: "Policy not found.." });
      return;
    }

    if (policy.ratings.some((r) => r.address === user)) {
      // Update rating
      policy.ratings = policy.ratings.map((r) => {
        if (r.address === user) {
          r.rating = rating;
        }
        return r;
      });
      policy.markModified("ratings");
      await policy.save();

      res.status(200).json({ message: "Rated successfully.." });
      return;
    }

    policy.ratings.push({ address: user, rating });
    policy.markModified("ratings");
    await policy.save();

    res.status(200).json({ message: "Rated successfully.." });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
});

export default router;
