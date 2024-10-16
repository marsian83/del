import { useEffect, useState } from "react";
import Fuse from "fuse.js";

export default function useSearchHook(data: object[], keys: string[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const fuseOptions = { keys };
  const fuse = new Fuse(data, fuseOptions);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    debouncedSearchQuery,
    fuse,
  };
}
