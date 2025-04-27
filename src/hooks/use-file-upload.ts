import { useState, useCallback } from 'react';
import { workflowApi } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

interface UseFileUploadOptions {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

export const useFileUpload = (workflowId: string | undefined, options?: UseFileUploadOptions) => {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const { toast } = useToast();
    const config = workflowApi.getUploadConfig();

    const validateFiles = (files: File[]): string[] => {
        const errors: string[] = [];

        if (files.length > config.maxFiles) {
            errors.push(`Maximum ${config.maxFiles} files allowed`);
        }

        files.forEach(file => {
            if (file.size > config.maxSize) {
                errors.push(`${file.name} exceeds maximum file size of ${config.maxSize / 1024 / 1024}MB`);
            }
            if (!config.acceptedMimeTypes.includes(file.type)) {
                errors.push(`${file.name} has an unsupported file type`);
            }
        });

        return errors;
    };

    const uploadFiles = useCallback(async (files: File[]) => {
        if (!workflowId) {
            toast({
                title: "Error",
                description: "Workflow ID is required for file upload",
                variant: "destructive"
            });
            return;
        }

        const errors = validateFiles(files);
        if (errors.length > 0) {
            errors.forEach(error => {
                toast({
                    title: "Validation Error",
                    description: error,
                    variant: "destructive"
                });
            });
            return;
        }

        setIsUploading(true);
        setProgress(0);

        try {
            // Simulate progress updates
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 10, 90));
            }, 500);

            const result = await workflowApi.uploadFiles(workflowId, files);

            clearInterval(progressInterval);
            setProgress(100);

            toast({
                title: "Success",
                description: "Files uploaded successfully",
            });

            options?.onSuccess?.();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload files';
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive"
            });
            options?.onError?.(error as Error);
        } finally {
            setIsUploading(false);
            setProgress(0);
        }
    }, [workflowId, options, toast]);

    return {
        uploadFiles,
        isUploading,
        progress,
        config
    };
};