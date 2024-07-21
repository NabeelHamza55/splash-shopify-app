class SplashProductWidget extends HTMLElement {
  static currentGroupBuy = "first-person"; // first-person, second-person
  static SplashAppURL = "https://splash-shopify-bcb0a691c83b.herokuapp.com";
  static SplashApiURL = "https://splash-nextjs-app.vercel.app";
  constructor() {
    super();
    this.handleUrlChange = this.handleUrlChange.bind(this);
    this.init();
  }
  init() {
    console.log("Init the button");
    document.addEventListener("variantChange", (event) => {
      const { variantId } = event.detail;
      console.log("Change the Variant ID", variantId);
      this.currentVariant = variantId;
      this.selectedVariant = this.productJSON?.variants?.find(
        (v) => v.id == variantId
      );
      this.selectedVariantMeta = this.metaDataJSON?.find(
        (v) => v.id == variantId
      );
      if (this.selectedVariant && this.selectedVariantMeta) {
        console.log(this.selectedVariant, this.selectedVariantMeta);
        if (
          this.selectedVariantMeta?.meta?.state &&
          this.selectedVariant.available
        ) {
          this.splashWidget.style.display = "block";
          this.splashButton.disabled = false;
          this.splashMessage.style.display = "none";
          this.splashMessage.innerText = "";
          this.splashButton.style.cursor = "pointer";
        } else if (!this.selectedVariantMeta?.meta?.state) {
          this.splashWidget.style.display = "none";
        } else {
          this.splashButton.disabled = true;
          this.splashMessage.style.display = "flex";
          this.splashMessage.innerText =
            "Group buy not possible: out of stock!";
          this.splashButton.style.cursor = "not-allowed";
        }
        let orignalPrice =
          this.selectedVariant?.compare_at_price || this.selectedVariant?.price;
        this.splashOrignalPrice.textContent = `${
          this.splashOrignalPrice.dataset.currencyCode
        } ${(parseInt(orignalPrice) * this.quantity) / 100}`;
        this.splashDiscountedPrice.textContent = `${
          this.splashOrignalPrice.dataset.currencyCode
        } ${
          this.selectedVariantMeta?.meta?.groupDiscountedPrice * this.quantity
        }`;
        this.splashDiscountedPercentage.textContent = `-${this.selectedVariantMeta.meta.groupDiscountPercentage}%`;
      }
    });
    window.addEventListener("popstate", this.handleUrlChange);
    window.addEventListener("hashchange", this.handleUrlChange);
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.handleUrlChange();
    };

    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      this.handleUrlChange();
    };

    const observer = new MutationObserver(() => {
      this.handleUrlChange;
    });
    observer.observe(document.querySelector("body"), {
      childList: true,
    });
    this.urlObserver = observer;

    // WIDGET INITIALIZATION
    this.widgetId = this.getAttribute("data-widget-id");
    this.splashWidget = document.querySelector("#splash-widget");
    let discountScriptTag = document.querySelector(
      '#splash-discount-json[type="application/json"]'
    );
    let productScriptTag = document.querySelector(
      '#splash-product-json[type="application/json"]'
    );
    let productMetaScript = document.querySelector(
      '#splash-meta-json[type="application/json"]'
    );
    this.input = document.querySelector(
      'input[type="number"], input[name="quantity"]'
    );
    this.splashOrignalPrice = document.querySelector(".splash-ct-price-cs");
    this.splashDiscountedPrice = document.querySelector(".splash-nr-price-cs");
    this.splashDiscountedPercentage = document.querySelector(
      ".splash-nr-price-cs-off"
    );
    this.splashButton = document.querySelector(`#splash-group-buy-button`);
    this.splashMessage = document.getElementById("splash-group-buy-message");

    this.discountJSON = JSON.parse(discountScriptTag?.textContent || "{}");
    this.productJSON = JSON.parse(productScriptTag?.textContent || "{}");
    this.metaDataJSON = JSON.parse(productMetaScript?.textContent || "{}");

    this.currentVariant = this.productJSON.variants[0]?.id || "47119948349729";
    this.quantity = this?.input?.value || 1;
    this.currentMerchantID = "";
    let defaultVariant = this.productJSON?.variants?.find(
      (v) => v.id == this.splashWidget?.dataset?.selectedVariant
    );
    if (this.discountJSON.state && defaultVariant?.available) {
      this.splashWidget.style.display = "block";
      this.currentGroupBuy =
        localStorage.getItem("SplashCurrentGroupBuy") ||
        SplashProductWidget.currentGroupBuy;
      this.SplashAppURL = SplashProductWidget.SplashAppURL;
      this.iframeFlag = false;
      this.splashMessage.style.display = "none";
      this.splashMessage.innerText = "";
      this.splashButton.disabled = false;
      this.splashButton.style.cursor = "pointer";
    } else if (!this.discountJSON?.state) {
      this.splashWidget.style.display = "none";
    } else {
      // Disable the button...
      this.splashMessage.style.display = "flex";
      this.splashMessage.innerText = "Group buy not possible: out of stock!";
      this.splashButton.disabled = true;
      this.splashButton.style.cursor = "not-allowed";
    }
    this.popupBackdrop = document.getElementById("splash-popup-backdrop");
    this.splashCheckoutButton = document.getElementById(
      "splash-checkout-button"
    );
  }
  disconnectedCallback() {}
  connectedCallback() {
    // On connect, call the app settings and then re-render the button
    // console.log(typeof this.productJSON, this.productJSON);
    this.fetchAppSettings();
    // if (!this.currentMerchantID) {
    //   console.log("NO MerchantID Found, Hide the Splash Widget");
    //   this.splashWidget.style.display = "none";
    // }
    this.splashButton.addEventListener("click", (event) => {
      this.quantity = this?.input?.value || 1;
      // this.showPopup();
      if (this.iframeFlag) {
        this.showPopup();
      } else if (!this.iframeFlag) {
        const myIframe = document.createElement("iframe");
        myIframe.src = `https://splash-nextjs-app.vercel.app/checkout?store=${this.currentMerchantID}&product=${this.currentVariant}&quantity=${this.quantity}`; // Replace with your iframe URL
        myIframe.title = "Splash Checkout";
        myIframe.id = "splash-iframe";
        myIframe.setAttribute("allow", "web-share");
        document.body.appendChild(myIframe);
        this.splashIframe = document.querySelector("#splash-iframe");
        this.splashIframe.style.display = "block";
        this.iframeFlag = true;
        const body = document.body;
        body.classList.add("no-scroll");
        this.popupBackdrop.style.display = "block";
      }
    });
    this.popupBackdrop.addEventListener("click", (event) => {
      // console.log("HIDE the IFRAME POPUP");
      this.hidePopup();
    });
    // Add the message event listener
    window.addEventListener(
      "message",
      (event) => {
        console.log("Event TRIGGERE to CLose Iframe...");
        // Verify the origin of the event
        if (event.origin !== "https://splash-nextjs-app.vercel.app") {
          return;
        }
        if (event.data === "splash-close") {
          this.splashIframe = document.querySelector("#splash-iframe");
          if (this.splashIframe) {
            this.splashIframe.remove();
            this.iframeFlag = false;
            const body = document.body;
            body.classList.remove("no-scroll");
            this.popupBackdrop.style.display = "none";
          }
        }
        console.log("EVENT HTML :", event.data);
      },
      false
    );
  }
  // Function to show the popup
  showPopup = () => {
    this.popupBackdrop.style.display = "block";
    this.splashIframe = document.querySelector("#splash-iframe");
    this.splashIframe.style.display = "block";
    const body = document.body;
    body.classList.add("no-scroll");
  };

  // Function to hide the popup
  hidePopup = () => {
    this.splashIframe = document.querySelector("#splash-iframe");
    if (this.splashIframe) {
      this.splashIframe.remove();
      this.iframeFlag = false;
      const body = document.body;
      body.classList.remove("no-scroll");
      this.popupBackdrop.style.display = "none";
    }
  };

  fetchAppSettings = () => {
    console.log("Splash fetchAppSettings");
    fetch(
      `${this.SplashAppURL}/ext/product/getSettings?shop=${window.Shopify.shop}&state=${this.discountJSON.state}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    )
      .then((response) => response.json())
      .then((resp) => {
        console.log("Response from the Shopify App", resp);
        this.currentMerchantID = resp?.data?.merchantID;
      })
      .catch((err) => {
        console.log("fetchAppSettings=>", err);
      });
  };

  handleUrlChange() {
    console.log("URL changed to:", window.location.href);
    const url = window.location.href;
    const match = url.match(/\?variant=(\d+)/);
    let variantId = null;
    if (match) {
      variantId = match[1];
      const event = new CustomEvent("variantChange", {
        detail: { variantId },
        bubbles: true,
      });
      document.dispatchEvent(event);
    } else {
      console.log("NO Need to call the Custom SPlash Variant Change event....");
    }
  }

  destroy() {
    window.removeEventListener("popstate", this.handleUrlChange);
    window.removeEventListener("hashchange", this.handleUrlChange);

    if (this.urlObserver) {
      this.urlObserver.disconnect();
    }
  }
}
customElements.define("splash-product-widget", SplashProductWidget);
