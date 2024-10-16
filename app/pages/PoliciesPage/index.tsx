import Icon from "../../common/Icon";
import DocTitle from "../../common/DocTitle";
import PolicyCard from "./components/PolicyCard";
import useWeb3 from "../../contexts/web3context";
import useSearchHook from "../../hooks/useSearchHook";

export default function PoliciesPage() {
  const { policies } = useWeb3();
  const searchHook = useSearchHook(policies || [], [
    "name",
    "address",
    "description",
    "category",
    "tags",
  ]);

  return (
    <>
      <DocTitle title="All Policies" />
      <article className="p-page w-full">
        <div className="flex items-center gap-x-4 py-6">
          <input
            className="w-full rounded-md border-2 border-primary border-opacity-0 bg-foreground px-4 py-2 duration-300 ease-in-out focus-within:border-opacity-80 focus-within:bg-background focus-within:outline-none"
            placeholder="Search..."
            value={searchHook.searchQuery}
            onChange={(e) => searchHook.setSearchQuery(e.target.value)}
          />
          <div className="flex items-center gap-x-2 rounded-md border-2 border-foreground px-4 py-2">
            <Icon icon="filter" className="text-2xl text-mute" />
            <span className="text-mute">Filter</span>
          </div>
        </div>
        <div className="mb-8 grid w-full gap-6 widescreen:grid-cols-2">
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
      </article>
    </>
  );
}
