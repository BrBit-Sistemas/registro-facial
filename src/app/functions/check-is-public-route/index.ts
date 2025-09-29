import { APP_ROUTES } from "@/constants/app-routes";

export const checkIsPublicRoute = (path: string) => {
    const appPublicRoutes = Object.values(APP_ROUTES.public);

    return appPublicRoutes.map(route => route.path).includes(path);
}