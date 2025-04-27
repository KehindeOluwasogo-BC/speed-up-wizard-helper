// src/config/index.ts

import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/wizard-helper',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    },
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
        credentials: true
    }
};