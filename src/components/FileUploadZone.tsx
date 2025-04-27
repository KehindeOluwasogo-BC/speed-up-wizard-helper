import React, { useCallback, useState } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface FileUploadZoneProps {
    onFilesSelected: (files: File[]) => void;
    isUploading?: boolean;
    progress?: number;
    maxFiles?: number;
    maxSize?: number;
    acceptedFiles?: string[];
}

export const FileUploadZone = ({
    onFilesSelected,
    isUploading = false,
    progress = 0,
    maxFiles = 5,
    maxSize = 10 * 1024 * 1024, // 10MB
    acceptedFiles = ['.pdf', '.doc', '.docx', '.txt', '.csv', '.xls', '.xlsx']
}: FileUploadZoneProps) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
        if (rejectedFiles.length > 0) {
            const errors = rejectedFiles.map(rejection => 
                `${rejection.file.name}: ${rejection.errors[0].message}`
            );
            setError(errors.join('. '));
            return;
        }

        if (acceptedFiles.length + selectedFiles.length > maxFiles) {
            setError(`Maximum ${maxFiles} files allowed`);
            return;
        }

        setError(null);
        setSelectedFiles(prev => [...prev, ...acceptedFiles]);
        onFilesSelected(acceptedFiles);
    }, [maxFiles, selectedFiles.length, onFilesSelected]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: acceptedFiles.reduce((acc, curr) => ({
            ...acc,
            [curr]: []
        }), {}),
        maxSize,
        disabled: isUploading
    });

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={`
                    border-2 border-dashed rounded-lg p-8 text-center transition-colors
                    ${isDragActive ? 'border-primary bg-primary/5' : 'border-border'}
                    ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary'}
                `}
            >
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                {isDragActive ? (
                    <p className="text-primary">Drop files here</p>
                ) : (
                    <>
                        <p className="text-muted-foreground mb-2">
                            Drag files here or click to browse
                        </p>
                        <Button variant="outline" size="sm" disabled={isUploading}>
                            Browse Files
                        </Button>
                    </>
                )}
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {selectedFiles.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium">Selected Files:</h4>
                    {selectedFiles.map((file, index) => (
                        <div 
                            key={`${file.name}-${index}`}
                            className="flex items-center justify-between p-2 bg-muted rounded-md"
                        >
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{file.name}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={isUploading}
                                onClick={() => removeFile(index)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {isUploading && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        <span className="text-sm">Uploading files...</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>
            )}
        </div>
    );
};