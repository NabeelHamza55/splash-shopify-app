import { useQuery } from "@tanstack/react-query";
import { useAuthenticatedFetch } from "../useAuthenticatedFetch";

export function useFetchThemeData(data: any) {
  const fetch = useAuthenticatedFetch();
  return useQuery(["api", "theme", "getDetails"], async () => {
    const themeData = await fetch("/api/theme/getDetails").then((res) =>
      res.json()
    );
    return themeData;
  });
}
