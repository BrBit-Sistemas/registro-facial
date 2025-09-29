import { companyType, userType } from "@/types/user";

export const tokenKey: string = "token";
export const userLg: string = "userLg";
export const company: string = "company";

export const setToken = (token: string) => {
    typeof window !== "undefined" ? sessionStorage.setItem(tokenKey, token) : undefined;
};

export const getToken = () => typeof window !== "undefined" ? sessionStorage.getItem(tokenKey) ?? '' : '';

export const isAuthenticated = (): boolean => typeof window !== "undefined" ? sessionStorage.getItem(tokenKey) !== null : false;

export const signout = () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('cpma_unidade');
};

export const setUserAuth = (data: userType[]) => {
    typeof window !== "undefined" ? sessionStorage.setItem(userLg, JSON.stringify(data)) : undefined;
};

export const getUserLg = (): userType | null => {
    return typeof window !== "undefined" ? JSON.parse(sessionStorage.getItem(userLg) ?? '{}') : null;
};

export const setCompanyLg = (data: companyType | null) => {
    typeof window !== "undefined" ? sessionStorage.setItem(company, JSON.stringify(data)) : undefined;
};

export const getCompany = (): companyType | null => {
    return typeof window !== "undefined" ? JSON.parse(sessionStorage.getItem(company) ?? '{}') : null;
};