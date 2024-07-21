import {
  BlockStack,
  Card,
  Layout,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
} from "@shopify/polaris";

export const LoadingSkeleton = () => {
  return (
    <SkeletonPage primaryAction>
      <Layout>
        <Layout.Section>
          <BlockStack gap={"200"}>
            <Card>
              <SkeletonBodyText />
            </Card>
            <Card>
              <SkeletonDisplayText size="small" />
              <br />
              <SkeletonBodyText />
            </Card>
            <Card>
              <SkeletonDisplayText size="small" />
              <br />
              <SkeletonBodyText />
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </SkeletonPage>
  );
};
