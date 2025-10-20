import React, { createContext, useContext, useEffect, useState } from "react"

interface ThemeContextProps {
    children: React.ReactNode;
}

type ThemeType = 'dark' | 'light'

interface ThemeContextValue {
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
    toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

const getTheme = (): ThemeType => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || theme === 'light') {
        return theme;
    }
    localStorage.setItem('theme', 'light');
    return 'light';
}

export const ThemeProvider = ({ children }: ThemeContextProps) => {
    const [theme, setTheme] = useState<ThemeType>(getTheme);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    }

    useEffect(() => {
        localStorage.setItem('theme', theme);
    }, [theme])

    const value: ThemeContextValue = {
        theme,
        setTheme,
        toggleTheme
    }

    return (
        <ThemeContext.Provider value={value}>
            <div data-theme={theme} className="min-h-screen bg-primary">
                {children}
            </div>
        </ThemeContext.Provider>
    )
}

export const getThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('getThemeContext must be used within a ThemeProvider')
    }
    return context;
}