import { BrowserRouter } from "react-router-dom";
import { NavigationMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";

import { AppBridgeProvider, QueryProvider, PolarisProvider } from "./providers";
import { LoadingIndicator } from "./components/LoadingIndicator";
import { Frame } from "@shopify/polaris";

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages: any = import.meta.glob("./pages/**/!(*.test.[jt]sx)*.([jt]sx)", {
    eager: true,
  });

  return (
    <PolarisProvider>
      <BrowserRouter>
        <AppBridgeProvider>
          <QueryProvider>
            <Frame>
              <LoadingIndicator />
              <NavigationMenu
                navigationLinks={[
                  {
                    label: "Products",
                    destination: "/products",
                  },
                ]}
              />
              <Routes pages={pages} />
            </Frame>
          </QueryProvider>
        </AppBridgeProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
