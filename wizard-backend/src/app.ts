import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from './config';
import { errorHandler } from './middleware/error.middleware';
import workflowRoutes from './routes/workflow.routes';
import logger from './utils/logger';
import path from 'path';

const app = express();

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/workflows', workflowRoutes);

// Error handling
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(config.mongodb.uri)
    .then(() => {
        logger.info('Connected to MongoDB successfully');
        
        // Start server after DB connection
        const server = app.listen(config.port, () => {
            logger.info(`Server is running on port ${config.port}`);
        });

        // Handle server errors
        server.on('error', (error) => {
            logger.error('Server error:', error);
        });
    })
    .catch((error) => {
        logger.error('MongoDB connection error:', error);
        process.exit(1);
    });