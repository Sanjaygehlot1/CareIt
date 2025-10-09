import { createContext, useContext, useEffect } from "react";
import { useState } from "react";
import { type ReactNode } from "react";
import { AxiosInstance } from "../axios/axiosInstance";

type AuthContextType = {
    user: any;
    Loading: boolean,
    logOut: ()=>{}
};

export const AuthContext = createContext<AuthContextType | null>(null);

type AuthProviderProps = {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {

    const [user, setuser] = useState(null);
    const [Loading, setLoading] = useState(false);

    const getUserSession = async () => {
        try {
            setLoading(true)
            const response = await AxiosInstance.get('/auth/profile')
            console.log(response.data)
            setuser(response.data.data);
            console.log(user)

        } catch (error) {

            setuser(null)
            console.log(error);
        } finally {
            setLoading(false)
        }
    }

    const logOut = async () => {
        try {
            await AxiosInstance.get('/auth/logout');
            setuser(null);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (!user) {
            getUserSession();
        }
    }, [])

    const values = {
        user,
        Loading,
        logOut
    }


    return (
        <AuthContext.Provider value={values}>
            {!Loading && children}
        </AuthContext.Provider>
    )
}

export const getAuth = () => {
    const context = useContext(AuthContext);

    console.log(context)

    if (!context) {
        throw new Error('getAuth must be used within an AuthProvider')
    }

    return context;
}






