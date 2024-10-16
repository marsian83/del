import DocTitle from "../../common/DocTitle";
import contractDefinitions from "../../contracts";

export default function () {
  return (
    <div>
      <DocTitle>Developer Documentation</DocTitle>

      <article>
        <div className="mx-auto mt-4 rounded-lg p-6 font-light leading-7 tracking-wide text-front shadow-md">
          <H1>Overview (JustInsure Mechanics)</H1>
          <p className="text-mute">
            A decentralized insurance platform for trustless coverage and claims
            management.
          </p>
          <H2>Summary</H2>
          JustInsure is a pioneering decentralized insurance platform designed
          to provide trustless coverage and efficient claims management. By
          utilizing smart contracts, JustInsure ensures transparency and
          security, allowing users to participate in a fair insurance ecosystem
          without intermediaries. <BR /> The platform aims to leverage
          blockchain technology to enhance the accessibility and efficiency of
          insurance products.
          <H3>Key Features:</H3>
          <div className="pl-4 opacity-80">
            <p className="mb-2">
              <B>Smart Contracts:</B> All insurance policies and claims are
              governed by automated smart contracts, ensuring transparency and
              reliability in operations.
            </p>
            <p className="mb-2">
              <B>Decentralized Claims Management:</B> Claims are processed
              through a community-driven approach, minimizing disputes and
              ensuring fair resolutions.
            </p>
            <p className="mb-2">
              <B>Tokenomics:</B> The platform utilizes its native token{" "}
              <SureCoin />
              for governance, allowing users to participate in decision-making
              and share in the platform's success. This
            </p>
            <p className="mb-2">
              <B>Interoperability:</B> Designed to integrate seamlessly with
              other blockchain projects and platforms, enabling users to
              leverage a wide range of services.
            </p>
          </div>
          <img
            src="/logo.png"
            className="mx-auto my-5 w-1/5 rounded border border-white/5 p-3"
          />
          <p className="-mb-3 -mt-6 text-center text-[10px] text-front/80">
            JustInsure
          </p>
          <H2>Ideal Use Cases for Integration with JustInsure</H2>
          <p className="pb-2 text-mute">
            By integrating with the JustInsure platform, developers, policy
            issuers, and other protocols can leverage a robust and flexible
            decentralized insurance ecosystem. Here are some of the key use
            cases and benefits:
          </p>
          <div className="pl-4 opacity-80">
            <p className="mb-2">
              <B>Policy Issuance and Management:</B> Developers can create
              custom insurance policies using our
              <PRE>createInsurancePolicy</PRE>
              function. This allows them to tailor coverage to specific user
              needs, ensuring flexibility and responsiveness to market demands.
            </p>
            <p className="mb-2">
              <B>Automated Premium Collection:</B> Using the
              <PRE>issuePolicyInstance</PRE>
              function, developers can automate premium collection when users
              purchase policies. This reduces administrative overhead and
              provides a seamless experience for policyholders.
            </p>
            <p className="mb-2">
              <B>Streamlined Claim Processing:</B> With access to the
              <PRE>issueClaimForPolicyInstance</PRE>
              function, developers can efficiently manage claims for
              policyholders. This simplifies the claims process, making it
              faster and more transparent for users.
            </p>
            <p className="mb-2">
              <B>Tokenized Staking Mechanism:</B> Developers can facilitate
              staking through the
              <PRE>registerStake</PRE>
              and
              <PRE>unregisterStake</PRE>
              functions. This enables users to earn rewards while providing
              liquidity to the insurance ecosystem, enhancing user engagement
              and retention.
            </p>
            <p className="mb-2">
              <B>Fee Structure and Revenue Sharing:</B> Integrating with
              JustInsure allows developers to benefit from a transparent fee
              structure, including revenue sharing with the native token,
              <SureCoin />. This incentivizes collaboration and participation in
              the insurance ecosystem.
            </p>
            <p className="mb-2">
              <B>Secure Payment Processing:</B> Through the receivePayment
              function, developers can ensure secure and compliant handling of
              premium payments in{" "}
              <span className="font-medium text-teal-300">USDJ</span>. This
              creates a trustless environment for transactions, fostering
              confidence among users.
            </p>
            <p className="mb-2">
              <B>Governance Participation:</B> By interacting with the
              JustInsure platform, developers and policy issuers can participate
              in the governance of the insurance ecosystem, influencing
              decisions that shape the future of decentralized insurance.
            </p>
            <p className="mb-2">
              <B>Enhanced User Experience:</B> With the ability to provide
              tailored insurance solutions and efficient management processes,
              developers can significantly enhance the user experience,
              attracting more users to their platforms.
            </p>
          </div>
          <div className="mt-8 pl-4">
            <H3>Why Integrate with JustInsure?</H3>
            Integrating with JustInsure provides a unique opportunity to tap
            into a decentralized insurance model that prioritizes transparency,
            efficiency, and user empowerment. By leveraging our smart contract
            capabilities, developers can create innovative insurance solutions
            that cater to the evolving needs of their users while participating
            in a thriving ecosystem that rewards collaboration and engagement.
          </div>
          <BR />
          <H1>Contracts</H1>
          <div className="mt-7">
            <H3>JustInsureInterface</H3>JustInsureInterface is the core contract
            managing insurance policies and integrating with the SureCoin token.
            It allows the creation of insurance policies, issuance of claims,
            and the collection of fees. The contract maintains a list of valid
            insurance controllers and provides functionalities for managing
            stakes in SureCoin.
            <div className="pl-3 text-sm leading-10">
              <p className="my-2 text-xl"> Key Functions:</p>
              <PRE>createInsurancePolicy:</PRE>
              Creates a new insurance policy controlled by an{" "}
              <span className="font-medium text-green-400">
                InsuranceController
              </span>
              .
              <br />
              <PRE>issuePolicyInstance:</PRE> Issues a policy instance to a user
              after collecting a fee.
              <br />
              <PRE>collectFee:</PRE>
              Collects fees on premium payments and allocates a fraction to
              SureCoin.
              <br />
              <p className="mt-4 w-max rounded-md border border-front/20 bg-black px-3">
                JustInsureInterface Contract Address:{" "}
                {contractDefinitions.justinsureInterface.address}
              </p>
            </div>
          </div>
          <div className="mt-14">
            <H3>SureCoin</H3>
            SureCoin is the native ERC20 token of the JustInsure platform,
            designed for staking and liquidity provision. It incentivizes users
            by distributing rewards based on their staked balances, ensuring
            that a portion of the token supply is always available for rewards.
            Users can buy and sell SureCoins, allowing them to participate
            actively in the ecosystem.
            <div className="pl-3 text-sm leading-10">
              <p className="my-2 text-xl"> Key Functions:</p>
              <PRE>buy:</PRE>
              Allows users to purchase SureCoins by transferring USDJ and
              receiving the corresponding amount of SureCoins.
              <br />
              <PRE>sell:</PRE> Enables users to sell SureCoins back to the
              contract for USDJ, ensuring liquidity.
              <br />
              <PRE>claimRewards:</PRE>
              Users can claim rewards earned from staking SureCoins.
              <br />
              <p className="mt-4 w-max rounded-md border border-front/20 bg-black px-3">
                SureCoin Contract Address:{" "}
                {contractDefinitions.surecoin.address}
              </p>
            </div>
          </div>
          <div className="mt-14">
            <H3>InsuranceController</H3>
            The InsuranceController contract enables the issuance and management
            of insurance policies within the JustInsure platform. It allows
            policyholders to buy policies, stake funds, and claim rewards. The
            contract ensures that the liquidity required to cover claims is
            always maintained and offers a staking mechanism for policy creators
            to enhance the policy's financial stability.
            <div className="pl-3 text-sm leading-10">
              <p className="my-2 text-xl"> Key Functions:</p>
              <PRE>stakeToPolicy:</PRE>
              Enables the policy creator and users to stake tokens, ensuring
              sufficient liquidity for claims. In exchange of which they are
              issued a StakeToken for the same policy in their wallet.
              <br />
              <PRE>revokeStakeFromPolicy:</PRE> Enables users to revoke their
              USDJ stake from a policy.
              <br />
              <PRE>withdrawProfits:</PRE>
              For creator to withdraw their hard earned profits from their
              policy, creatorOnly.
            </div>
          </div>
          <div className="mt-14">
            <H3>Vault</H3>
            Vault is a contract for managing locked tokens associated with
            insurance policies. It allows insurance controllers to lock tokens
            for a specified duration and provides functionality for users to
            unlock their tokens after the lock period.
            <div className="pl-3 text-sm leading-10">
              <p className="my-2 text-xl"> Key Functions:</p>
              <PRE>getLockedTokens:</PRE>
              Retrieves the list of locked tokens for a specific user.
              <br />
              <PRE>LOCK_DURATION:</PRE> Defines the lock duration.{" "}
              <span className="text-xs italic opacity-80">
                Currently 30 days
              </span>
              <br />
              <PRE>unlockTokens:</PRE>
              Unlocks tokens once the lock period has expired.
              <br />
              <p className="mt-4 w-max rounded-md border border-front/20 bg-black px-3">
                Vault Contract Address: {contractDefinitions.vault.address}
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

const H1 = ({ children }: any) => (
  <h1 className="my-2 text-4xl font-bold">{children}</h1>
);
const H2 = ({ children }: any) => (
  <h2 className="mb-4 mt-8 text-3xl font-bold">{children}</h2>
);
const H3 = ({ children }: any) => (
  <h3 className="my-4 text-xl font-medium">{children}</h3>
);
const BR = ({ children }: any) => (
  <>
    <br />
    <br />
  </>
);
const B = ({ children }: any) => <b className="font-bold">{children}</b>;
const PRE = ({ children }: any) => (
  <span className="mx-2 rounded-md border border-front/10 bg-foreground px-2 font-medium text-orange-300">
    {children}
  </span>
);
const SureCoin = () => (
  <span className="font-medium text-cyan-300"> SureCoin </span>
);
