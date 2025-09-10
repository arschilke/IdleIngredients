import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("features/dashboard/Dashboard.tsx"),
  route("resources", "features/resources/ResourceManager.tsx"),
  route("trains", "features/trains/TrainManager.tsx"),
] satisfies RouteConfig;
