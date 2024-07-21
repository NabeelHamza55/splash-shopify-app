import {
  BlockStack,
  Box,
  Card,
  Divider,
  InlineGrid,
  Layout,
  Page,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
  Text,
  TextContainer,
  TextField,
  useBreakpoints,
} from "@shopify/polaris";
import { TitleBar, useToast } from "@shopify/app-bridge-react";
import { useFetchUpdateMerchantSettings } from "../hooks/merchant";
import { useFetchThemeData } from "../hooks/theme";
import { useEffect, useState } from "react";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { log } from "console";
export default function Home() {
  const { smUp } = useBreakpoints();
  const { data: themeData, isLoading: themeLoading } = useFetchThemeData({});
  const { show: showToast } = useToast();

  /**
   * Hooks
   */

  /**
   * States Here
   */

  const [merchantID, setMerchantID] = useState("");
  const [splashAPIKey, setSplashAPIKey] = useState("");

  const {
    data: merchantData,
    isLoading,
    mutateAsync: mutateAsyncMerchant,
  } = useFetchUpdateMerchantSettings({ merchantID, splashAPIKey });

  /**
   * Hanlders
   */

  useEffect(() => {
    if (themeData?.shopData.settings?.merchantID) {
      setMerchantID(themeData?.shopData?.settings?.merchantID);
      setSplashAPIKey(themeData?.shopData?.settings?.splashAPIKey);
    }
  }, [themeData]);

  return (
    <>
      {themeLoading && <LoadingSkeleton />}
      {!themeLoading && (
        <Page
          primaryAction={{
            content: "Save",
            disabled: false,
            loading: isLoading,
            onAction: () => {
              mutateAsyncMerchant()
                .then((resp) => {
                  console.log(resp);
                  showToast("Settings saved successfully!");
                })
                .catch((err) => {
                  console.log(err);
                  showToast("Something went wrong, contact Splash!");
                });
            },
          }}
        >
          <TitleBar title={"Dashboard"} />
          <BlockStack gap={{ xs: "800", sm: "400" }}>
            <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
              <Box
                as="section"
                paddingInlineStart={{ xs: "400", sm: "0" }}
                paddingInlineEnd={{ xs: "400", sm: "0" }}
              >
                <BlockStack gap="400">
                  <Text as="h3" variant="headingMd">
                    Splash Integration
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Provide the unique merchant ID and Splash API Key.
                  </Text>
                </BlockStack>
              </Box>
              <Card roundedAbove="sm">
                <BlockStack gap="400">
                  <TextField
                    autoComplete="off"
                    label="Merchant ID"
                    value={merchantID}
                    onChange={(v: any) => {
                      setMerchantID(v);
                    }}
                    placeholder="XXXX-XXXXXX-XXXXXXX"
                  />
                  <TextField
                    autoComplete="off"
                    label="Splash API Key"
                    value={splashAPIKey}
                    onChange={(v: any) => {
                      console.log(v);
                      setSplashAPIKey(v);
                    }}
                    placeholder="Splash_XXXXXXXXXXXXXX"
                  />
                </BlockStack>
              </Card>
            </InlineGrid>
          </BlockStack>
        </Page>
      )}
    </>
  );
}
