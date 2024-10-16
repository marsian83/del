import React, { useState } from "react";
import { closestTimeUnit } from "../../../utils";
import Icon from "../../../common/Icon";
import { Holder, User } from "../../../types";
import useUsdjHook from "../../../hooks/useUsdj";
import moment from "moment";
import useSearchHook from "../../../hooks/useSearchHook";

export default function PolicyHolders({ holders }: { holders: Holder[] }) {
  const [showList, setShowFullList] = useState(2);
  const usdjHook = useUsdjHook();
  const searchHook = useSearchHook(holders || [], ["address"]);

  const searchResults = searchHook.fuse.search(searchHook.debouncedSearchQuery);
  const holdersToRender =
    searchResults.length === 0
      ? holders
      : searchResults.map((result: any) => result.item);

  return (
    <div className="mb-8">
      <div className="mb-4 mt-1 border-t border-front/20 pt-3">
        <h1 className="text-lg font-bold">Policy Holders</h1>
        <div className="mt-2 flex w-full gap-x-3">
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-md border border-primary/50 bg-background px-4 py-1 focus-within:outline-none"
            value={searchHook.searchQuery}
            onChange={(e) => searchHook.setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {holdersToRender &&
          holdersToRender.slice(0, showList).map((holder, key) => (
            <div
              key={key}
              className="gap-2 rounded-xl border border-border p-4 text-sm"
            >
              <p className="mb-2">
                <strong>Address:</strong> {holder.address}
              </p>
              <p className="mb-2">
                <strong>Premium:</strong> $
                {usdjHook.divideByDecimals(BigInt(holder.premium))}
              </p>
              <p className="">
                <strong>Expiry:</strong>{" "}
                {moment(holder.claimExpiry).format("DD/MM/YYYY")}
              </p>
            </div>
          ))}
      </div>

      {showList < holdersToRender.length && (
        <button
          className="mt-4 w-full self-end rounded-md bg-primary/50 px-4 py-2 text-white transition-all hover:bg-primary/60"
          onClick={() => setShowFullList((prev) => prev + 2)}
        >
          Load More
        </button>
      )}
    </div>
  );
}
