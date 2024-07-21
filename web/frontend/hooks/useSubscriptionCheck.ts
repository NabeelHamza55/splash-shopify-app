import { useQuery } from "@tanstack/react-query";
import { useAuthenticatedFetch } from "./useAuthenticatedFetch";

export function useSubscriptionCheck() {
  const fetch = useAuthenticatedFetch();
  return useQuery(["api", "billing", "subscription"], async () => {
    const subscription = await fetch("/api/billing/subscription").then((res) =>
      res.json()
    );
    return subscription;
  });
}
