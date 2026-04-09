import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    db: {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        name: process.env.DB_NAME || 'hiv_tb_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '12345',
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },

    fhir: {
        serverUrl: process.env.FHIR_SERVER_URL || 'http://localhost:8080/fhir',
    },
};