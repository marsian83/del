import DocTitle from "../../common/DocTitle";
import YourPolicies from "./components/YourPolicies";
import YourStakes from "./components/YourStakes";

export default function AccountPage() {
  return (
    <article className="p-page relative">
      <DocTitle title="My Account" />
      <YourPolicies />
      <YourStakes />
    </article>
  );
}
