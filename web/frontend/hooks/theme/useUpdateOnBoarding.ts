import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthenticatedFetch } from "../useAuthenticatedFetch";

export function useCheckOnBoarding(data: any) {
  const fetch = useAuthenticatedFetch();
  return useQuery(
    ["api", "dashboard", "onboarding"],
    async () => {
      const fetchedOnBoarding = await fetch(`/api/dashboard/onboarding`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());
      return fetchedOnBoarding;
    }
    // { cacheTime: 100 }
  );
}
export function useUpdateOnBoarding(data: any) {
  const fetch = useAuthenticatedFetch();
  return useMutation(
    ["api", "theme", "updateOnboarding"],
    async () => {
      const fetchedOnBoarding = await fetch(`/api/theme/updateOnboarding`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then((res) => res.json());
      return fetchedOnBoarding;
    }
    // { cacheTime: 100 }
  );
}
