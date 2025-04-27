import axios, { AxiosError } from 'axios';
import { IWorkflow } from '../../wizard-backend/src/services/workflow.service';
import { toast } from '@/components/ui/use-toast';

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    errors?: string[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiResponse<any>>) => {
        const errorMessage = error.response?.data?.error 
            || error.response?.data?.errors?.join(', ')
            || error.message 
            || 'An unexpected error occurred';

        toast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive'
        });

        return Promise.reject(error);
    }
);

export const workflowApi = {
    getAllWorkflows: async () => {
        const response = await api.get<ApiResponse<IWorkflow[]>>('/workflows');
        return response.data.data || [];
    },

    getWorkflowById: async (id: string) => {
        const response = await api.get<ApiResponse<IWorkflow>>(`/workflows/${id}`);
        return response.data.data;
    },

    createWorkflow: async (workflow: Partial<IWorkflow>) => {
        const response = await api.post<ApiResponse<IWorkflow>>('/workflows', workflow);
        return response.data.data;
    },

    updateWorkflow: async (id: string, workflow: Partial<IWorkflow>) => {
        const response = await api.put<ApiResponse<IWorkflow>>(`/workflows/${id}`, workflow);
        return response.data.data;
    },

    deleteWorkflow: async (id: string) => {
        const response = await api.delete<ApiResponse<void>>(`/workflows/${id}`);
        return response.data.success;
    },

    uploadFiles: async (workflowId: string, files: File[]) => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        const response = await axios.post<ApiResponse<IWorkflow>>(
            `${API_URL}/workflows/${workflowId}/files`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return response.data.data;
    },

    getUploadConfig: () => ({
        maxFiles: 5,
        maxSize: 10 * 1024 * 1024, // 10MB
        acceptedFiles: [
            '.pdf',
            '.doc',
            '.docx',
            '.txt',
            '.csv',
            '.xls',
            '.xlsx'
        ],
        acceptedMimeTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ]
    })
};