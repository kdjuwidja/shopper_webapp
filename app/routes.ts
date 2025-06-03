import { type RouteConfig } from "@react-router/dev/routes";

export default [
  {
    path: "/health",
    file: "routes/health.tsx"
  },
  {
    path: "/",
    file: "routes/home.tsx"
  },
  {
    path: "/login",
    file: "login/login.tsx"
  },
  {
    path: "/callback",
    file: "callback/callback.tsx"
  },
  {
    path: "/error",
    file: "error/error.tsx"
  },
  {
    path: "/member/v2",
    file: "member/memberHome.tsx"
  },
  {
    path: "/member/v2/shoplist/:id",
    file: "member/editshoplist.tsx"
  },
  {
    path: "/member/v2/searchshopitem/:id",
    file: "member/searchShopItem.tsx"
  }
] satisfies RouteConfig;
