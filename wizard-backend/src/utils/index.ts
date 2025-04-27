// src/utils/index.ts

export const log = (message: string): void => {
    console.log(`[LOG] ${new Date().toISOString()}: ${message}`);
};

export const formatDate = (date: Date, format: string): string => {
    // Implement date formatting logic here
    return date.toISOString(); // Placeholder implementation
};