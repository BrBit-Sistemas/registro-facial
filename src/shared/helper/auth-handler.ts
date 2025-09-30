import { companyType, userType } from "@/types/user";

export const tokenKey: string = "token";
export const userLg: string = "userLg";
export const company: string = "company";

export const setToken = (token: string) => {
    if (typeof window !== "undefined") {
        sessionStorage.setItem(tokenKey, token);
    }
};

export const getToken = () => {
    if (typeof window !== "undefined") {
        const token = sessionStorage.getItem(tokenKey);
        if (token) {
            try {
                // Se o token está armazenado como JSON string, fazemos o parse
                return JSON.parse(token);
            } catch {
                // Se não for JSON, retorna o token diretamente
                return token;
            }
        }
    }
    return '';
};

export const isAuthenticated = (): boolean => {
    if (typeof window === "undefined") {
        console.log("isAuthenticated: window undefined");
        return false;
    }
    
    const token = sessionStorage.getItem(tokenKey);
    console.log("isAuthenticated: token =", token);
    
    if (!token) {
        console.log("isAuthenticated: no token found");
        return false;
    }
    
    try {
        // Verificar se o token é válido (não está vazio ou null)
        const parsedToken = JSON.parse(token);
        const isValid = parsedToken && typeof parsedToken === 'string' && parsedToken.length > 0;
        console.log("isAuthenticated: parsed token =", parsedToken, "isValid =", isValid);
        return isValid;
    } catch {
        // Se não for JSON, verificar se é uma string válida
        const isValid = typeof token === 'string' && token.length > 0;
        console.log("isAuthenticated: token as string, isValid =", isValid);
        return isValid;
    }
};

export const signout = () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('cpma_unidade');
};

export const setUserAuth = (data: userType[]) => {
    if (typeof window !== "undefined") {
        sessionStorage.setItem(userLg, JSON.stringify(data));
    }
};

export const getUserLg = (): userType | null => {
    return typeof window !== "undefined" ? JSON.parse(sessionStorage.getItem(userLg) ?? '{}') : null;
};

export const setCompanyLg = (data: companyType | null) => {
    if (typeof window !== "undefined") {
        sessionStorage.setItem(company, JSON.stringify(data));
    }
};

export const getCompany = (): companyType | null => {
    return typeof window !== "undefined" ? JSON.parse(sessionStorage.getItem(company) ?? '{}') : null;
};