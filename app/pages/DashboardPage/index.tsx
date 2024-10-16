import DocTitle from "../../common/DocTitle";
import { Link } from "react-router-dom";
import Icon from "../../common/Icon";
import PolicyCard from "./components/PolicyCard";
import useApiResponse from "../../hooks/useApiResponse";
import api from "../../utils/api";
import { useAccount } from "wagmi";
import useSearchHook from "../../hooks/useSearchHook";

export default function DashboardPage() {
  const { address } = useAccount();

  const { data: policies, loading } = useApiResponse(
    api.policy.fetchAllPoliciesByCreator,
    address?.toString() || "",
  );

  const searchHook = useSearchHook(policies || [], [
    "name",
    "address",
    "description",
    "category",
    "tags",
  ]);

  const searchResults = searchHook.fuse.search(searchHook.debouncedSearchQuery);
  const policiesToRender =
    searchResults.length === 0
      ? policies
      : searchResults.map((result: any) => result.item);

  return (
    <div className="p-page py-4">
      <DocTitle title="Marketer Dashboard" />

      <div className="flex justify-between gap-x-2">
        <div>
          <h1 className="text-2xl font-semibold">Policies Created</h1>
          <h2 className="font-semibold text-mute">
            Here are the policies created by you..
          </h2>
        </div>
        <Link
          to="/new-policy"
          className="h-max rounded-md bg-primary/70 px-6 py-2 font-medium text-front transition-all hover:bg-primary/100"
        >
          Create New Policy
        </Link>
      </div>
      <div className="mt-4 flex w-full gap-x-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchHook.searchQuery}
          onChange={(e) => searchHook.setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-primary/50 bg-background px-4 py-2 focus-within:outline-none"
        />
      </div>

      <div className="mt-4 flex flex-col gap-y-8">
        {searchHook.fuse.search(searchHook.debouncedSearchQuery).length == 0
          ? policies &&
            policies.map((policy: any) => (
              <PolicyCard key={policy.address} policy={policy} />
            ))
          : searchHook.fuse
              .search(searchHook.debouncedSearchQuery)
              .map((policy: any) => (
                <PolicyCard key={policy.item.address} policy={policy.item} />
              ))}
      </div>
    </div>
  );
}
