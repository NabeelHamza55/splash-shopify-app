import { useQuery } from "@tanstack/react-query";
import { useAuthenticatedFetch } from "../useAuthenticatedFetch";
// import { filterOptions, filterOptionsMapping } from "../../constants";
export function useFetchAllVariants(data: any) {
  console.log("useFetchAllVariants", data);
  const fetch = useAuthenticatedFetch();
  return useQuery(
    ["api", "products", "getAllVariants"],
    async () => {
      const allVariants = await fetch("/api/products/getAllVariants", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data,
        }),
      }).then((res) => res.json());
      return allVariants;
    },
    {
      refetchOnWindowFocus: false,
      // keepPreviousData: true,
      cacheTime: 100,
      // staleTime: 1000
    }
  );
}
