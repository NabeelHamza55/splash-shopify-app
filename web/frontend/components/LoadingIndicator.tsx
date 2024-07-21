import { useIsFetching } from "@tanstack/react-query";
import { Loading } from "@shopify/polaris";

export function LoadingIndicator() {
  const isFetching = useIsFetching();

  return isFetching ? (
    <div
      style={{
        margin: "auto",
        background: "none",
        display: "inline-block",
        shapeRendering: "auto",
        position: "absolute",
        top: "4px",
        right: "4px",
        zIndex: 9999,
      }}
    >
      {/* <Spinner accessibilityLabel="General loading indicator" size="small" /> */}
      <Loading />
    </div>
  ) : null;
}
