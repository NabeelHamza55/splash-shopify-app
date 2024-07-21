import { useMutation } from "@tanstack/react-query";
import { useAuthenticatedFetch } from "../useAuthenticatedFetch";

export function useFetchUpdateMerchantSettings(data: {}) {
  const fetch = useAuthenticatedFetch();
  return useMutation(["api", "merchant", "updateSettings"], async () => {
    console.log("useMutation", data);
    const updateVariant = await fetch(`/api/merchant/updateSettings`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((res) => res.json());
    return updateVariant;
  });
}
