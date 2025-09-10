import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("dashboard/Dashboard.tsx"),
  route("resources", "ResourceManager.tsx"),
  route("trains", "TrainManager.tsx"),
] satisfies RouteConfig;
