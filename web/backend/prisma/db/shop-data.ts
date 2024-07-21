import prisma, { tryCatch } from "./client";

export async function getShopData(shop: string) {
  const { data, error } = await tryCatch(async () => {      
    return await prisma.shopData.findFirst({
      where: {
        shop,
      }
    });
  });
  if (!error) return data;
  return undefined;
}

export async function deleteShopData(shop: string) {
  const { error } = await tryCatch(async () => {
    return await prisma.shopData.delete({
      where: {
        shop,
      },
    });
  });
  if (error) return false;
  return true;
}
