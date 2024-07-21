import { useQueryClient, useMutation, type QueryKey } from "@tanstack/react-query";
import { useAuthenticatedFetch } from "./useAuthenticatedFetch";

export default function useBillingPlanUpgrade(selectedPlanHandle: string, onSuccess: Function) {
  const queryClient = useQueryClient();
  const fetch = useAuthenticatedFetch();
  return useMutation(
    ["api", "billing"],
    async () => {
      const [plan_name, plan_type] = selectedPlanHandle.split('_');

      return await fetch("/api/billing", {
        method: "POST",
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_name,
          plan_type,
        })
      }).then(res => res.json());
    },
    {
      onSuccess: async ({ url }) => {
        onSuccess(url);
      },
    }
  );
}