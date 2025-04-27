import mongoose from 'mongoose';
import { Workflow, IWorkflow as IWorkflowModel } from '../models/workflow.model';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

export interface IWorkflow {
    _id?: string;
    name: string;
    description?: string;
    source: {
        type: 'file' | 'api' | 'folder';
        config: {
            [key: string]: any;
        };
        files?: Array<{
            originalName: string;
            filename: string;
            path: string;
            mimetype: string;
            size: number;
        }>;
    };
    processingOptions: {
        autoProcess: boolean;
        sendNotifications: boolean;
        archiveProcessed: boolean;
        outputFormat: 'CSV' | 'PDF' | 'JSON';
    };
    schedule?: {
        type: 'manual' | 'recurring' | 'triggered';
        config?: {
            [key: string]: any;
        };
    };
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

interface FileInfo {
    originalName: string;
    filename: string;
    path: string;
    mimetype: string;
    size: number;
}

export class WorkflowService {
    async createWorkflow(workflowData: Partial<IWorkflowModel>): Promise<IWorkflowModel> {
        const workflow = new Workflow(workflowData);
        return await workflow.save();
    }

    async getAllWorkflows(): Promise<IWorkflow[]> {
        const workflows = await Workflow.find().sort({ createdAt: -1 });
        return workflows.map(workflow => workflow.toObject() as IWorkflow);
    }

    async getWorkflowById(id: string): Promise<IWorkflow | null> {
        const workflow = await Workflow.findById(id);
        return workflow ? (workflow.toObject() as IWorkflow) : null;
    }

    async updateWorkflow(id: string, workflowData: Partial<IWorkflow>): Promise<IWorkflow | null> {
        const updatedWorkflow = await Workflow.findByIdAndUpdate(id, workflowData, { new: true });
        return updatedWorkflow ? (updatedWorkflow.toObject() as IWorkflow) : null;
    }

    async deleteWorkflow(id: string): Promise<IWorkflow | null> {
        const deletedWorkflow = await Workflow.findByIdAndDelete(id);
        return deletedWorkflow ? (deletedWorkflow.toObject() as IWorkflow) : null;
    }

    async addFilesToWorkflow(workflowId: string, files: Array<{
        originalName: string;
        filename: string;
        path: string;
        mimetype: string;
        size: number;
    }>): Promise<IWorkflow | null> {
        const updatedWorkflow = await Workflow.findByIdAndUpdate(
            workflowId,
            { $push: { files: { $each: files } } },
            { new: true }
        );
        return updatedWorkflow ? (updatedWorkflow.toObject() as IWorkflow) : null;
    }

    async attachFilesToWorkflow(id: string, files: FileInfo[]): Promise<IWorkflow | null> {
        try {
            const workflow = await Workflow.findById(id);
            if (!workflow) {
                throw new AppError('Workflow not found', 404);
            }

            workflow.files = workflow.files || [];
            workflow.files.push(...files);

            await workflow.save();
            return workflow.toObject() as IWorkflow;
        } catch (error) {
            logger.error(`Error attaching files to workflow ${id}:`, error);
            throw error instanceof AppError ? error : new AppError('Failed to attach files', 500);
        }
    }

    validateWorkflowData(data: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!data.name) {
            errors.push('Name is required');
        }

        if (!data.source?.type || !['file', 'api', 'folder'].includes(data.source.type)) {
            errors.push('Valid source type is required (file, api, or folder)');
        }

        if (data.processingOptions?.outputFormat && 
            !['CSV', 'PDF', 'JSON'].includes(data.processingOptions.outputFormat)) {
            errors.push('Invalid output format');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}