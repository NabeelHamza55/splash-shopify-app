import prisma, { tryCatch } from "./client";

export const createSettings = async (params: any) => {
  const { data, error } = await tryCatch(async () => {
    return await prisma.settings.create({
      data: {
        ...params,
      },
    });
  });
  if (!error) return data;
  return undefined;
};

export const getSettings = async (query: any) => {
  const { data, error } = await tryCatch(async () => {
    return await prisma.settings.findFirst({
      where: {
        ...query,
      },
    });
  });
  if (!error) return data;
  return undefined;
};

export const updateSettings = async (id: string, updatedObj: any) => {
  const { data, error } = await tryCatch(async () => {
    return await prisma.settings.update({
      where: {
        id,
      },
      data: {
        ...updatedObj,
      },
    });
  });
  if (!error) return data;
  return undefined;
};
