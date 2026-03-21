import { AxiosInstance } from '../axios/axiosInstance';

export interface Goal {
    id: number;
    title: string;
    description?: string;
    type: 'CODING_TIME' | 'STREAK' | 'COMMITS' | 'FOCUS_TIME' | 'CUSTOM';
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    targetValue: number;
    currentValue: number;
    unit: string;
    completed: boolean;
    isAiGenerated: boolean;
    createdAt: string;
    weekStart?: string;
}

export interface CreateGoalPayload {
    title: string;
    description?: string;
    type?: Goal['type'];
    period?: Goal['period'];
    targetValue: number;
    unit?: string;
}

export const getGoals = async (period?: string): Promise<Goal[]> => {
    try {
        const params = period ? { period } : {};
        const response = await AxiosInstance.get('/goals', { params });
        return response.data.data ?? [];
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const createGoal = async (payload: CreateGoalPayload): Promise<Goal | null> => {
    try {
        const response = await AxiosInstance.post('/goals', payload);
        return response.data.data;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const updateGoal = async (id: number, data: Partial<CreateGoalPayload & { completed: boolean }>): Promise<Goal | null> => {
    try {
        const response = await AxiosInstance.put(`/goals/${id}`, data);
        return response.data.data;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const deleteGoal = async (id: number): Promise<boolean> => {
    try {
        await AxiosInstance.delete(`/goals/${id}`);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

export const generateAiGoals = async (period: string): Promise<{ goals: Goal[]; context: any } | null> => {
    try {
        console.log(period)
        const response = await AxiosInstance.post('/goals/ai-generate', {period});
        return response.data.data;
    } catch (error) {
        console.error(error);
        return null;
    }
};
