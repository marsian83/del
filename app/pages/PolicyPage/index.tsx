import { Navigate, useParams } from "react-router-dom";
import TotalStakes from "./components/TotalStakes";
import ClaimInfo from "./components/ClaimsInfo";
import Functions from "./components/Functions";
import api from "../../utils/api";
import useApiResponse from "../../hooks/useApiResponse";
import DocTitle from "../../common/DocTitle";
import StakeChart from "./components/StakeChart";
import Header from "./components/Header";

export default function PolicyPage() {
  const { address: policyAddress } = useParams();

  if (!policyAddress) return <Navigate to="/policies" />;
  const { data: policy } = useApiResponse(
    api.policy.getByAddress,
    policyAddress,
  );

  return (
    <article className="p-page flex w-full flex-col gap-y-4 py-8">
      <DocTitle title={"View Policy"} />

      {policy && (
        <>
          <Header policy={policy} />
          <ClaimInfo policy={policy} />
          <Functions policy={policy} />
          <TotalStakes policy={policy} />
          <StakeChart policy={policy} />
        </>
      )}
    </article>
  );
}
