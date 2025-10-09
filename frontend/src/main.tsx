import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import SignIn from './pages/signin.tsx'
import Dashboard from './pages/dashboard.tsx'
import PrivateRoute from './components/privateRoute.tsx'
import HomePage from './pages/HomePage.tsx'
import PublicRoute from './components/dashboard/publicRoute.tsx'
import SettingsPage from './components/settings/SettingsPage.tsx'
import { AuthProvider } from './context/authContext.tsx'

const router = createBrowserRouter([
  {
    element: <App />,
    path: "/",
    children: [
      {
        element: <HomePage />,
        path: '/'
      },
      {
        element: (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        ),
        path: '/dashboard'
      },
      {
        element: (
          <PrivateRoute>
            <SettingsPage />
          </PrivateRoute>
        ),
        path: '/settings'
      }
    ]
  },
  {
    element: (
      <PublicRoute>
        <SignIn />
      </PublicRoute>
    ),
    path: '/sign-in'
  },
])

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
  <RouterProvider router={router} />
  </AuthProvider>
)
