import { type ReactNode } from 'react'
import { getAuth } from '../context/authContext'
import { Navigate } from 'react-router-dom'

type childrenPropsType = {
    children : ReactNode
}

function PrivateRoute({children} : childrenPropsType) {

    const {user, Loading} = getAuth()

    if(Loading) return null;

    if(!user) return <Navigate to='/'/>;

    return children;

}

export default PrivateRoute
