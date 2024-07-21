import type { Session } from "@shopify/shopify-api";
import { createShopifyApp } from "../../shopify";
import sessions from "../../prisma/db/sessions";
// import shopify from "../../shopify";

let GET_SHOPIFY_PRODUCT_VARIANTS_QUERY = (
  paginationParams: any,
  search: any
) => {
  console.log({ ...paginationParams }, search);
  let variables = "first: 20";
  if (paginationParams.hasNextPage) {
    variables = `first: 20, after: "${paginationParams.endCursor}"`;
  } else if (paginationParams.hasPreviousPage) {
    variables = `last: 20, before: "${paginationParams.startCursor}"`;
  }
  if (search.length > 0) {
    variables = variables + `, query: "title:*${search}*" `;
  }
  let query = `{
    products( 
      ${variables}, sortKey: TITLE
    ) {
      edges {
        node {
          id
          title
          handle
          variants(first: 100, sortKey: FULL_TITLE){
            edges{
              node{
                id
                title
                displayName
                price
                compareAtPrice
                image{
                  id
                  url
                }
                metafield(namespace: "splash", key: "settings"){
                  id
                  value
                }
              }
            }
          }
          featuredImage {
            id
            url
          }
          images(first: 1) {
            edges {
              node {
                id
                url
              }
            }
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
}`;
  console.log(query);

  return query;
};

let GET_SHOPIFY_PRODUCTS_QUERY = (paginationParams: any) => {
  console.log({ ...paginationParams });
  let variables = "first: 5, sortKey: TITLE";
  let query = `{
    products( 
      ${variables}
    ) {
      edges {
        node {
          id
          title
          handle
          metafield(namespace: "splash", key: "settings"){
            id
            value
          }
          featuredImage {
            id
            url
          }
          images(first: 1) {
            edges {
              node {
                id
                url
              }
            }
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
    }
}`;
  console.log(query);

  return query;
};

export const getAllVariants = async (session: Session, settings: any) => {
  let params = { ...settings.data.pageInfo };
  let search = settings?.data?.search;
  let shopify = createShopifyApp(session.shop);
  const client = new shopify.api.clients.Graphql({ session });
  const response: any = client.query({
    data: {
      query: GET_SHOPIFY_PRODUCT_VARIANTS_QUERY(params, search),
      variables: {},
    },
  });
  return response;
};

export const getAllProducts = async (session: Session, settings: any) => {
  let params = { ...settings.data.pageInfo };
  let shopify = createShopifyApp(session.shop);
  const client = new shopify.api.clients.Graphql({ session });
  const response: any = client.query({
    data: {
      query: GET_SHOPIFY_PRODUCTS_QUERY(params),
      variables: {},
    },
  });
  return response;
};
