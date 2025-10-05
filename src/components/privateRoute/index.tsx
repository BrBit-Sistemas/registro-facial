'use client'

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { APP_ROUTES } from "@/constants/app-routes";
import { isAuthenticated } from "@/shared/helper/auth-handler";
import type { Props } from "@/types/PropsType"



const PrivateRoute = ({ children }: Props) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const isUserAuthenticated = isAuthenticated();

    const routePublic: string = APP_ROUTES.public.login.path;

    
    useEffect(() => {
        setLoading(true);
        if (!isUserAuthenticated) {
           setLoading(false);
           return router.push(routePublic);
        }
        setLoading(false);
    }, [isUserAuthenticated, router, routePublic]);

    return (
        <>
        <div suppressHydrationWarning className="min-h-screen flex items-center justify-center" style={{display: loading ? 'flex' : 'none'}}>
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900"></div>
        </div>
        {isUserAuthenticated && children}
        </>
    )
};

export default PrivateRoute;