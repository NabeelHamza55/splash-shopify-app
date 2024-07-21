import { useQuery } from "@tanstack/react-query";
import { useAuthenticatedFetch } from "./useAuthenticatedFetch";

export default function useBillingPlans() {
  const fetch = useAuthenticatedFetch();
  return useQuery(["api", "billing", "plans"], async () => {
    const plans = await fetch("/api/billing/plans").then((res) =>
      res.json()
    );
    return plans;
  });
}