import { type RouteConfig } from "@react-router/dev/routes";

export default [
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
    path: "/member",
    file: "member/memberHome.tsx"
  }
] satisfies RouteConfig;
