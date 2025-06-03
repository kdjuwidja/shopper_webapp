export const ROUTE_VERSION = 'v2';

export const ROUTES = {
  MEMBER: `/member/${ROUTE_VERSION}`,
  SHOPLIST: (id: string | number) => `/member/${ROUTE_VERSION}/shoplist/${id}`,
  SEARCH_ITEM: (id: string | number) => `/member/${ROUTE_VERSION}/searchshopitem/${id}`,
} as const; 