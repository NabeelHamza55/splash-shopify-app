import addUninstallWebhookHandler from "./uninstall";

export const addWebhookHandlers = async function () {
  await addUninstallWebhookHandler();
};