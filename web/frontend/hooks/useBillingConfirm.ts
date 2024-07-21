import { useQuery } from "@tanstack/react-query";
import { useAuthenticatedFetch } from "./useAuthenticatedFetch";

export default function useBillingConfirm() {
  const fetch = useAuthenticatedFetch();
  return useQuery(["api", "billing","confirm"], async () => {
    const billing = await fetch("/api/billing/confirm").then((res) =>
      res.json()
    );
    return billing;
  });
}