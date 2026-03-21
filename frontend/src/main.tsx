import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Dashboard from './pages/dashboard.tsx'
import PrivateRoute from './components/privateRoute.tsx'
import HomePage from './pages/HomePage.tsx'
import SettingsPage from './pages/SettingsPage.tsx'
import { AuthProvider } from './context/authContext.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'
import ReportsPage from './pages/ReportsPage.tsx'
import GoalsPage from './pages/GoalsPage.tsx'

const router = createBrowserRouter([

  {
    element: <HomePage />,
    path: "/"
  },
  {
    element: <App />,
    path: "/",
    children: [
      {
        element: (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        ),
        path: 'dashboard'
      },
      {
        element: (
          <PrivateRoute>
            <ReportsPage />
          </PrivateRoute>
        ),
        path: 'reports'
      },
      {
        element: (
          <PrivateRoute>
            <GoalsPage />
          </PrivateRoute>
        ),
        path: 'goals'
      },
      {
        element: (
          <PrivateRoute>
            <SettingsPage />
          </PrivateRoute>
        ),
        path: 'settings'
      }
    ]
  },
]);

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </AuthProvider>
);