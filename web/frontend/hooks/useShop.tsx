/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { PropsWithChildren } from "react";
import { useAuthenticatedFetch } from "../hooks";

type ShopObj = { shop: string };
type Action = {
  type: "GET_SHOP" | "UPDATE_SHOP";
  payload?: ShopObj;
};

const initialState = {
  state: {},
  getShop: () => {
    /* */
  },
  updateShop: (payload: ShopObj) => {
    /* */
  },
};
const shopContext = createContext<{
  state: any;
  getShop: () => void;
  updateShop: (payload: ShopObj) => void;
}>(initialState);

function reducer(state: any, action: Action) {
  switch (action.type) {
    case "GET_SHOP": {
      return {
        ...state,
      };
    }

    case "UPDATE_SHOP": {
      return {
        ...action.payload,
      };
    }

    default:
      return null;
  }
}

export const ShopProvider = (props: PropsWithChildren) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const fetch = useAuthenticatedFetch();

  useEffect(() => {
    (async () => {
      const shop: ShopObj = await fetch("/api/shop/name").then((res) =>
        res.json()
      );
      updateShop(shop);
    })();
  }, []);

  const getShop = () => {
    dispatch({ type: "GET_SHOP" });
  };

  const updateShop = (payload: ShopObj) => {
    dispatch({ type: "UPDATE_SHOP", payload });
  };

  const value = useMemo(
    () => ({
      state,
      getShop,
      updateShop,
    }),
    [state]
  );

  return <shopContext.Provider value={value} {...props} />;
};

export const useShop = () => {
  const context = useContext(shopContext);

  if (context === undefined) {
    throw new Error(`useShop must be used within ShopProvider`);
  }

  return context;
};

export const ShopContextProvider = ({ children }: PropsWithChildren) => {
  return <ShopProvider>{children}</ShopProvider>;
};