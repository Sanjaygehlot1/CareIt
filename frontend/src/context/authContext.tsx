import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { AxiosInstance } from "../axios/axiosInstance";
import axios from "axios";

type AuthContextType = {
    user: any;
    Loading: boolean;
    isOffline: boolean;
    logOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
    children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);

    const getUserSession = async () => {
        try {
            const response = await AxiosInstance.get('/auth/profile');
            setUser(response.data.data);
            setIsOffline(false);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {

                    setUser(null);
                    setIsOffline(false);
                } else {

                    setIsOffline(true);
                    console.warn('[Auth] Network error — staying logged in with cached state');
                }
            } else {

                setIsOffline(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const logOut = async () => {
        try {
            sessionStorage.removeItem('careit_ai_coach_summary');
            await AxiosInstance.get('/auth/logout');
        } catch (error) {
            console.log("Logout error:", error);
        }
        setUser(null);
    };


    useEffect(() => {
        const goOnline = () => {
            setIsOffline(false);
            getUserSession();
        };
        const goOffline = () => setIsOffline(true);

        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);
        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
        };
    }, []);

    useEffect(() => {
        getUserSession();
    }, []);

    const values = {
        user,
        Loading: loading,
        isOffline,
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
