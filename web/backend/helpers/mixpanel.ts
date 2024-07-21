import mixpanel from "mixpanel";

const mixpanelConfig = {
  debug: process.env.NODE_ENV === "development",
};
const mixpanelToken = process.env.MIXPANEL_TOKEN || '';

const mixpanelInstance = mixpanel.init(mixpanelToken, mixpanelConfig);

export default mixpanelInstance;
