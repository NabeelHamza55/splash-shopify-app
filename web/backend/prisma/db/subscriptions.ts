import prisma, { tryCatch } from "./client";

export const getSubscription = async (query: any) => {
  const { data, error } = await tryCatch(async () => {
    return await prisma.subscription.findFirst({
      where: {
        ...query,
      },
    });
  });
  if (!error) return data;
  return undefined;
};
