import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AxiosInstance } from '../axios/axiosInstance';

interface DashboardData {
    profile: any;
    priority: string;
    focusStats: {
        todayCodingMins: number;
        todayCommits: number;
        meetingCount: number;
        meetingHours: number;
        tasksCompleted: number;
        tasksTotal: number;
    };
    streak: {
        current: number;
        longest: number;
        weekStatus: boolean[];
    };
    goals: any[];
    stats: any[];
    notes: any[];
    aiCoach: {
        summary: string | null;
        updatedAt: string | null;
    };
}

interface DashboardContextType {
    data: DashboardData | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        try {
            const res = await AxiosInstance.get('/dashboard/summary');
            setData(res.data.data);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch dashboard summary:', err);
            setError(err.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    return (
        <DashboardContext.Provider value={{ data, loading, error, refresh: fetchDashboard }}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
};
