import mongoose, { Schema, Document } from 'mongoose';

interface IFile {
    originalName: string;
    filename: string;
    path: string;
    mimetype: string;
    size: number;
}

export interface IWorkflow extends Document {
    name: string;
    description?: string;
    source: {
        type: 'file' | 'api' | 'folder';
        config: Record<string, any>;
    };
    processingOptions: {
        autoProcess: boolean;
        sendNotifications: boolean;
        archiveProcessed: boolean;
        outputFormat: 'CSV' | 'PDF' | 'JSON';
    };
    schedule: {
        type: string;
        config: Record<string, any>;
    };
    status: string;
    files?: IFile[];
    createdAt: Date;
    updatedAt: Date;
}

const fileSchema = new Schema<IFile>({
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    path: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true }
});

const workflowSchema = new Schema<IWorkflow>({
    name: { type: String, required: true },
    description: { type: String },
    source: {
        type: {
            type: String,
            enum: ['file', 'api', 'folder'],
            required: true
        },
        config: {
            type: Schema.Types.Mixed,
            default: {}
        }
    },
    processingOptions: {
        autoProcess: { type: Boolean, default: true },
        sendNotifications: { type: Boolean, default: true },
        archiveProcessed: { type: Boolean, default: false },
        outputFormat: {
            type: String,
            enum: ['CSV', 'PDF', 'JSON'],
            default: 'CSV'
        }
    },
    schedule: {
        type: { type: String, default: 'manual' },
        config: { type: Schema.Types.Mixed, default: {} }
    },
    status: { type: String, default: 'active' },
    files: [fileSchema]
}, {
    timestamps: true,
    versionKey: false
});

export const Workflow = mongoose.model<IWorkflow>('Workflow', workflowSchema);