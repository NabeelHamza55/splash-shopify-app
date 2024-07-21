import { TextField } from "@shopify/polaris";

export const SplashIntegration = (props: {
  merchantID: any;
  splashKey: any;
  handleSplashKey: any;
  handleMerchantID: any;
}) => {
  let { merchantID, handleMerchantID, splashKey, handleSplashKey } = props;

  return (
    <>
      <TextField
        autoComplete="off"
        label="Merchant ID"
        labelHidden={true}
        value={merchantID}
        onChange={(v: any) => {
          handleMerchantID(v);
        }}
        prefix={"Merchant ID:"}
        placeholder="1212121"
      />
    </>
  );
};
