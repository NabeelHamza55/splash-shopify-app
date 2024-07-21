FROM node:18-alpine

ARG SHOPIFY_API_KEY
ENV SHOPIFY_API_KEY=1779449fc1d3b1ecd992423371e13d89
ARG SHOPIFY_API_KEY_ROBUST_CHECKOUT
ENV SHOPIFY_API_KEY_ROBUST_CHECKOUT=7f5e5583518a33168c6ddcc50034c63e
ARG SHOPIFY_API_KEY_DEVELOPERS_SANDBOX
ENV SHOPIFY_API_KEY_DEVELOPERS_SANDBOX=1b26877bb7665b2150303d6d20de2268
ARG SHOPIFY_API_KEY_WP_INTERNATIONAL_SHIPPING
ENV SHOPIFY_API_KEY_WP_INTERNATIONAL_SHIPPING=bae11292e53738a1d1e1ab9938648b21
ARG SHOPIFY_API_KEY_LE_SNATCH_FRANCAIS
ENV SHOPIFY_API_KEY_LE_SNATCH_FRANCAIS=1506d27f8afabbc3e8fedb8c23df7f06
ARG SHOPIFY_API_KEY_SPLASH_6041_2
ENV SHOPIFY_API_KEY_SPLASH_6041_2=9d3b3d35d3dea04ea4a13b3cbdb4d6fa
EXPOSE 8081
WORKDIR /app
COPY web/backend backend
COPY web/frontend/package.json frontend/package.json
COPY web/backend/package.json backend/package.json
RUN npm --prefix ./frontend install
RUN npm --prefix ./backend install
COPY web/@types @types
COPY web/@enums @enums
COPY web/frontend frontend
RUN npm --prefix ./frontend run build
RUN npm --prefix ./backend run prepare
RUN npm --prefix ./backend run build
CMD cd backend && npm start