import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { AxiosInstance } from "../axios/axiosInstance";

type AuthContextType = {
    user: any;
    Loading: boolean;
    logOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
    children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const getUserSession = async () => {
        try {
            const response = await AxiosInstance.get('/auth/profile');
            setUser(response.data.data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const logOut = async () => {
        try {
            sessionStorage.removeItem('careit_ai_coach_summary');
            await AxiosInstance.get('/auth/logout');
            setUser(null);
        } catch (error) {
            console.log("Logout error:", error);
        }
    };

    useEffect(() => {
        getUserSession();
    }, []);

    const values = {
        user,
        Loading: loading,
        logOut
    };

    return (
        <AuthContext.Provider value={values}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const getAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('getAuth must be used within an AuthProvider');
    }
    return context;
};
