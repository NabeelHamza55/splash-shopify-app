import { useMutation } from "@tanstack/react-query";
import { useAuthenticatedFetch } from "../useAuthenticatedFetch";

export function useFetchUpdateVariant(data: {}) {
  const fetch = useAuthenticatedFetch();
  return useMutation(["api", "products", "updateVariant"], async () => {
    console.log("useMutation", data);
    const updateVariant = await fetch(`/api/products/updateVariant`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((res) => res.json());
    return updateVariant;
  });
}
