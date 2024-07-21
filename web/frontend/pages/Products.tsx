import {
  Badge,
  Banner,
  Card,
  Icon,
  IndexFilters,
  IndexTable,
  Page,
  TextField,
  Text,
  useSetIndexFiltersMode,
  Select,
} from "@shopify/polaris";
import { DiscountFilledIcon, MoneyFilledIcon } from "@shopify/polaris-icons";
import { TitleBar, useToast } from "@shopify/app-bridge-react";
import { useFetchAllVariants } from "../hooks/products";
import { useCallback, useEffect, useState } from "react";
import Switch from "../components/Switch";
import { useFetchThemeData } from "../hooks/theme";
import { useFetchUpdateVariant } from "../hooks/products/useFetchUpdateVariant";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { SetupGuide } from "../components/SetupGuide";
import { useUpdateOnBoarding } from "../hooks/theme/useUpdateOnBoarding";
import { SplashIntegration } from "../components/SplashIntegration";
import { useNavigate } from "react-router-dom";

export default function Home() {
  let navigate = useNavigate();
  const { show: showToast } = useToast();

  /**
   * Hooks
   */

  const { data: themeData, isLoading: themeLoading } = useFetchThemeData({});

  /**
   * States Here
   */

  const discountOptions = [
    { label: "Discount Type", value: "", disabled: true },
    {
      label: "Percentage",
      value: "percentage",
      prefix: <Icon source={DiscountFilledIcon} />,
    },
    {
      label: "Currency",
      value: "amount",
      prefix: <Icon source={MoneyFilledIcon} />,
    },
  ];

  const [selectedDiscountType, setSelectedDiscountType] =
    useState("percentage");
  const [variants, setVariants] = useState([]);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [pageInfo, setPageInfo] = useState<any>({});
  const [paginationLabel, setPaginationLabel] = useState("");
  const [currentVariant, setCurrentVariant] = useState<any>({});
  const [showGuide, setShowGuide] = useState(
    themeData?.shopData?.settings?.setupGuide
  );
  const [items, setItems] = useState([]);
  const [merchantID, setMerchantID] = useState("");
  const [searchString, setSearchString] = useState("");

  const {
    data: theVariants,
    isLoading,
    isError,
    isFetched,
    refetch,
  } = useFetchAllVariants({ pageInfo, search: searchString });

  const { data: updatedTheVariant, mutateAsync: mutateVariantAsync } =
    useFetchUpdateVariant({ ...currentVariant });

  useEffect(() => {
    if (theVariants?.data?.length > 0 && theVariants?.status == 200) {
      setVariants(theVariants?.data);
      console.log(
        "PAGE==>>",
        themeData?.shopData?.shopifyShopData?.currencyCode
      );
      setPageInfo(theVariants?.pageInfo);
      setHasNext(theVariants?.pageInfo?.hasNextPage);
      setHasPrevious(theVariants?.pageInfo?.hasPreviousPage);
    } else {
      setVariants([]);
      setPageInfo({});
    }
  }, [
    theVariants,
    setVariants,
    setPageInfo,
    setHasNext,
    setHasPrevious,
    searchString,
  ]);

  const snippetCode = `
  <div id="splash-widget">
    {% if shop.metafields.splash.splash_widget != blank %}
      {{ shop.metafields.splash.splash_widget }}
    {% endif %}
  </div>`;
  const [isCopied, setIsCopied] = useState(false);

  /**
   * Hanlders
   */

  const handleQueryChange = useCallback((value: any) => {
    setSearchString(value);
    refetch();
  }, []);
  const handleQueryClear = useCallback(() => {
    setSearchString("");
    refetch();
  }, []);

  const tabs: any = ["All"].map((item, index) => ({
    content: item,
    index,
    onAction: () => {},
    id: `${item}-${index}`,
    isLocked: index === 0,
    actions: index === 0 ? [] : [],
  }));

  const { mode, setMode } = useSetIndexFiltersMode();

  const resourceName = {
    singular: "product",
    plural: "products",
  };

  let theCurrencyCode =
    themeData?.shopData?.shopifyShopData?.currencyFormats?.moneyFormat?.split(
      "{{"
    )[0] || "";

  const handleVariantChange = (id: any, type: any, value: any) => {
    console.log(id, type, value);
    setVariants((prevState: any) => {
      let updatedVariants = [...prevState];
      const variantToUpdate = updatedVariants?.find(
        (variant) => variant.variantId == id
      );
      variantToUpdate[type] = value;
      if (type == "groupDiscountPercentage" && value) {
        const originalPrice = parseFloat(variantToUpdate["price"]);
        const discountPercentage = parseFloat(
          variantToUpdate["groupDiscountPercentage"]
        );
        const discountAmount = (discountPercentage * originalPrice) / 100;
        const discountedPrice = originalPrice - discountAmount;
        variantToUpdate["groupDiscountedPrice"] = discountedPrice.toFixed(2);
        variantToUpdate["groupDiscountAmount"] = discountAmount.toFixed(2);
      } else if (type == "groupDiscountAmount" && value) {
        const originalPrice = parseFloat(variantToUpdate["price"]);
        const discountAmount = parseFloat(
          variantToUpdate["groupDiscountAmount"]
        );
        const discountedPrice = originalPrice - discountAmount;
        variantToUpdate["groupDiscountedPrice"] = discountedPrice?.toFixed(2);

        const percentageChange = (
          (discountAmount / originalPrice) *
          100
        ).toFixed(2);
        variantToUpdate["groupDiscountPercentage"] = `${percentageChange}`;
      }
      return updatedVariants;
    });
    let theCurrentVariant = variants?.find(
      (variant) => variant.variantId == id
    );
    setCurrentVariant({
      id,
      data: {
        ...theCurrentVariant,
        [type]: value,
      },
    });
    // Mutate and Display Toast
    mutateVariantAsync()
      .then((resp) => {
        console.log(resp);
        showToast("Group buy activated successfully!");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const rowMarkup =
    variants?.length > 0 &&
    variants?.map((product: any, index: any) => {
      return (
        <IndexTable.Row
          id={product.variantId}
          key={product.variantId}
          position={index}
          disabled={!product.state}
        >
          <IndexTable.Cell>
            <img
              style={{ borderRadius: "10px" }}
              src={product.image + String(index)}
              width={64}
              height={64}
              alt={product.title}
            />
          </IndexTable.Cell>
          <IndexTable.Cell>{product.title}</IndexTable.Cell>
          <IndexTable.Cell>
            <Badge tone={product.state ? "success" : "info"}>
              {product.state ? "Group buy active" : "Group buy inactive"}
            </Badge>
          </IndexTable.Cell>
          <IndexTable.Cell>{theCurrencyCode + product.price}</IndexTable.Cell>
          <IndexTable.Cell>
            <div className="w-2/3">
              <TextField
                type="currency"
                inputMode="decimal"
                value={product.groupDiscountPercentage}
                label="groupDiscountPercentage"
                labelHidden
                // autoSize
                disabled={!product.state || selectedDiscountType === "amount"}
                onChange={(value: any) => {
                  if (value <= 100) {
                    handleVariantChange(
                      product.variantId,
                      "groupDiscountPercentage",
                      value
                    );
                  }
                }}
                autoComplete=""
                error={
                  product.groupDiscountPercentage == 0 &&
                  "Invalid discount percentage"
                }
                min={0}
                placeholder="20"
              />
            </div>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <div className="w-2/3">
              <TextField
                type="currency"
                inputMode="decimal"
                value={product.groupDiscountAmount}
                label="groupDiscountAmount"
                labelHidden
                autoComplete=""
                // autoSize
                disabled={
                  !product.state || selectedDiscountType === "percentage"
                }
                onChange={(value: any) => {
                  if (value < parseFloat(product.price)) {
                    handleVariantChange(
                      product.variantId,
                      "groupDiscountAmount",
                      value
                    );
                  }
                }}
                min={0}
                error={
                  parseFloat(product.groupDiscountAmount) == 0 &&
                  "Invalid discount amount"
                }
                placeholder="20"
              />
            </div>
          </IndexTable.Cell>
          <IndexTable.Cell>
            {theCurrencyCode + product.groupDiscountedPrice}
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Switch
              id={product.variantId}
              value={product.state}
              handleVariantChange={handleVariantChange}
            />
          </IndexTable.Cell>
        </IndexTable.Row>
      );
    });

  useEffect(() => {
    if (themeData?.shopData.settings?.merchantID) {
      setMerchantID(themeData?.shopData.settings?.merchantID);
    }
    setShowGuide(themeData?.shopData?.settings?.setupGuide);
    console.log({ ...themeData?.shopData?.settings });
    if (
      themeData?.shopData?.settings?.setupGuide &&
      themeData?.shopData?.settings?.setupSteps.length > 0
    ) {
      const setupStepsIds = new Set(
        themeData?.shopData?.settings?.setupSteps.map((step: any) => {
          if (step.complete === false) {
            return step.id;
          }
        })
      );
      // Get all Items for the specific theme setup...
      const filteredItems = ITEMS(themeData?.data?.isNotVintageTheme).filter(
        (item: any) => {
          if (setupStepsIds.has(item.id)) {
            return { ...item, complete: false };
          } else {
            return { ...item, complete: true };
          }
        }
      );
      // console.log("Filtered ITEMS: ", filteredItems);
      setItems([...filteredItems]);
    }
  }, [themeData]);

  const { mutateAsync: mutateShop } = useUpdateOnBoarding({
    ...themeData?.shopData?.settings,
    setupGuide: showGuide,
    setupSteps: items?.map((item) => ({
      id: item.id,
      complete: item.complete,
    })),
  });

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(snippetCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  let BannerForSectionThemes = (props: any) => {
    const { themeLink } = props;
    return (
      <div className="py-2">
        {/* <Banner
          title="Activate Group Buy button"
          onDismiss={() => {}}
          action={{ content: "Activate", url: themeLink, external: true }}
          secondaryAction={{ content: "Learn More", url: "/", external: true }}
        >
          <p>
            Your current theme supports 2.0 app blocks. Kindly press the
            Activate button to enable the widget on your theme.
          </p>
        </Banner> */}
        {showGuide && (
          <SetupGuide
            onDismiss={() => {
              setShowGuide(false);
              mutateShop()
                .then((resp: any) => {
                  console.log(resp);
                })
                .catch((err: any) => {
                  console.log("Error While Updating Shop Data =>", err);
                });
            }}
            onStepComplete={onStepComplete}
            items={items}
          />
        )}
      </div>
    );
  };
  let BannerForVintageThemes = () => {
    return (
      <div className="py-2">
        <Banner
          title="Activate Group Buy button"
          onDismiss={() => {}}
          action={{ content: "Contact us", url: "", external: true }}
        >
          <p>
            Copy & Paste the given code in your product template to enable the
            widget on product page.
          </p>
          <div className="bg-grey-300 group relative rounded-md border-2 border-neutral-300 p-2">
            {/* Clickable container for copying */}
            <div
              onClick={handleCopyClick}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              title="Click to copy"
            >
              <Text
                as={"p"}
                variant={"bodyMd"}
                fontWeight={"regular"}
                tone="subdued"
              >
                {`${snippetCode}`}
              </Text>
            </div>
            {/* Tooltip */}
            {isCopied && (
              <div
                className="border-gray-300 w-18 absolute -bottom-1 left-1/2 mb-2 -translate-x-1/2 transform rounded border bg-gray-100 px-2 py-1 text-sm text-gray-500 shadow-md"
                role="status"
              >
                Copied!
              </div>
            )}
          </div>
        </Banner>
      </div>
    );
  };

  const handleDiscountSelectChange = useCallback(
    (value: string) => setSelectedDiscountType(value),
    []
  );

  const handleMerchantIDChange = async (value: any) => {
    setMerchantID(value);
  };

  const ITEMS = (isSectionTheme: any) => {
    if (themeData?.data?.isNotVintageTheme) {
      return [
        {
          id: 0,
          title: "Splash Integration",
          description:
            "Unique merchant ID and Splash API key provided by Splash for each merchant.",
          content: "",
          image: {
            url: "",
            alt: "Splash integration",
          },
          complete:
            (themeData?.shopData?.settings?.setupGuide &&
              themeData?.shopData?.settings?.setupSteps[0].complete) ||
            (!!themeData?.shopData?.settings?.merchantID &&
              !!themeData?.shopData?.settings?.splashAPIKey),
          primaryButton: {
            content: "Enable",
            props: {
              onClick: () => {
                navigate("/");
              },
            },
          },
          secondaryButton: {
            content: "Learn More",
            props: {
              url: "",
              external: true,
            },
          },
        },
        {
          id: 1,
          title: "Activate Splash Widget.",
          description:
            "Enable the Splash app using App Blocks and Save the theme settings.",
          content: "",
          image: {
            url: "",
            alt: "Splash widget Activation",
          },
          complete:
            (themeData?.shopData?.data?.settings?.setupGuide &&
              themeData?.shopData?.settings?.setupSteps[1].complete) ||
            themeData?.data?.isGroupBuyActivated,
          primaryButton: {
            content: "Activate",
            props: {
              url: `https:///${themeData?.shopData?.shop}/admin/themes/current/editor?template=product&addAppBlockId=a25a751a-5b27-4898-92d5-0bb79db19dd0/splash-block&target=mainSection`,
              external: true,
            },
          },
          secondaryButton: {
            content: "Learn More",
            props: {
              url: "",
              external: true,
            },
          },
        },
      ];
    } else {
      return [
        {
          id: 0,
          title: "Splash Integration",
          description:
            "Unique merchant id provided by the Splash for each merchant.",
          content: "",
          image: {
            url: "",
            alt: "Splash integration",
          },
          complete:
            (themeData?.shopData?.settings?.setupGuide &&
              themeData?.shopData?.settings?.setupSteps[0].complete) ||
            !!themeData?.shopData?.settings?.merchantID,
          primaryButton: {
            content: "Enable",
            props: {
              // url: `https:///${themeData?.shopData?.shop}/admin/themes/current/editor?context=apps&template=product&activateAppId=6321a21c-6f88-4bc6-b7c5-fa95dad8e471/splash-embedded-block`,
              // external: true,
              onClick: () => {
                navigate("/");
              },
            },
          },
          secondaryButton: {
            content: "Learn More",
            props: {
              url: "",
              external: true,
            },
          },
        },
        {
          id: 1,
          title: "Splash Widget",
          description: "Enable the Splash app using App Embeds theme settings.",
          content: "",
          image: {
            url: "",
            alt: "Splash integration",
          },
          complete:
            themeData?.shopData?.settings?.setupGuide &&
            themeData?.shopData?.settings?.setupSteps[1].complete,
          primaryButton: {
            content: "Activate",
            props: {
              url: `https:///${themeData?.shopData?.shop}/admin/themes/current/editor?context=apps&template=product&activateAppId=a25a751a-5b27-4898-92d5-0bb79db19dd0/splash-embedded-block`,
              external: true,
            },
          },
          secondaryButton: {
            content: "Learn More",
            props: {
              url: "",
              external: true,
            },
          },
        },
        {
          id: 3,
          title: "Activate Splash for Non-2.0 themes",
          description: "Copy and Paste the code snippet in the Product file:",
          content: (
            <div className="bg-grey-300 group relative rounded-md border-2 border-neutral-300 p-2">
              <div
                onClick={handleCopyClick}
                className="cursor-pointer"
                role="button"
                tabIndex={0}
                title="Click to copy"
              >
                <Text
                  as={"p"}
                  variant={"bodyMd"}
                  fontWeight={"regular"}
                  tone="subdued"
                >
                  {`${snippetCode}`}
                </Text>
              </div>
              {/* Tooltip */}
              {isCopied && (
                <div
                  className="border-gray-300 w-18 absolute -bottom-1 left-1/2 mb-2 -translate-x-1/2 transform rounded border bg-gray-100 px-2 py-1 text-sm text-gray-500 shadow-md"
                  role="status"
                >
                  Copied!
                </div>
              )}
            </div>
          ),
          image: {
            url: "",
            alt: "Splash integration",
          },
          complete:
            themeData?.shopData?.settings?.setupGuide &&
            themeData?.shopData?.settings?.setupSteps[3]?.complete,
        },
      ];
    }
  };

  const onStepComplete = async (id: any) => {
    try {
      setItems((prev) =>
        prev.map((item) =>
          item.id == id ? { ...item, complete: !item.complete } : item
        )
      );
      mutateShop()
        .then((resp: any) => {
          console.log(resp.data);
        })
        .catch((err: any) => {
          console.log("Error While Updating Shop Data =>", err);
        });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {isLoading && <LoadingSkeleton />}
      {!isLoading && theVariants && (
        <Page fullWidth>
          <TitleBar title={"Products"} />
          {themeData?.shopData?.showOnboarding &&
            themeData?.data?.isNotVintageTheme && (
              <BannerForSectionThemes themeLink={themeData?.data?.deepLink} />
            )}
          {themeData?.shopData?.showOnboarding &&
            !themeData?.data?.isNotVintageTheme && <BannerForVintageThemes />}
          <div className="pb-2 flex justify-end">
            <div style={{ width: "calc(15% - 10px)" }}>
              <Select
                label="Discount Type"
                labelHidden
                options={discountOptions}
                onChange={handleDiscountSelectChange}
                value={selectedDiscountType}
              />
            </div>
          </div>
          <Card padding="0">
            <IndexFilters
              isFlushWhenSticky
              queryValue={searchString}
              queryPlaceholder="Searching in all"
              onQueryChange={handleQueryChange}
              onQueryClear={handleQueryClear}
              selected={0}
              filters={[]}
              onClearAll={handleQueryClear}
              tabs={tabs}
              mode={mode}
              setMode={setMode}
              hideFilters
              // hideQueryField
              canCreateNewView={false}
              cancelAction={{
                onAction: handleQueryClear,
                disabled: false,
                loading: false,
              }}
            />
            <IndexTable
              resourceName={resourceName}
              itemCount={variants.length}
              selectedItemsCount={"All"}
              headings={[
                { title: "" },
                { title: "Products" },
                { title: "Status" },
                { title: "Price" },
                { title: "Group Discount (%)" },
                {
                  title: `Group Discount (${theCurrencyCode})`,
                },
                { title: "Group Price" },
                { title: "State" },
              ]}
              selectable={false}
              pagination={{
                label: paginationLabel,
                hasPrevious: hasPrevious,
                onPrevious: () => {
                  refetch();
                },
                previousTooltip: "Previous",
                previousKeys: [37],
                hasNext: hasNext,
                onNext: () => {
                  refetch();
                },
                nextTooltip: "Next",
                nextKeys: [39],
              }}
              loading={isLoading}
            >
              {rowMarkup}
            </IndexTable>
          </Card>
        </Page>
      )}
    </>
  );
}
