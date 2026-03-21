import { Navigate } from 'react-router-dom';
import { getAuth } from '../context/authContext';
import type { ReactNode } from 'react';

type childrenType = {
    children : ReactNode
}

const PublicRoute = ({ children }: childrenType) => {
    const { user, Loading } = getAuth();

    if (Loading) return null;

    if(user){
        return <Navigate to={'/dashboard'}/>
    }

    return children;
};

export default PublicRoute;
