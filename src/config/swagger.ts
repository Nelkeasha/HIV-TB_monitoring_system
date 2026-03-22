import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HIV & TB Patient Monitoring API',
      version: '1.0.0',
      description: 'Backend API for managing HIV and TB patients, visits, adherence and medication stock at community level',
      contact: {
        name: 'DMC',
        email: 'dmc@info.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        RegisterInput: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            name: { type: 'string', example: 'Nelly Igihozo' },
            email: { type: 'string', example: 'nelly@example.com' },
            password: { type: 'string', example: 'StrongPass123' },
            role: { type: 'string', enum: ['chw', 'healthcare_provider', 'admin'] },
            facility_id: { type: 'string', format: 'uuid' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'user@example.com' },
            password: { type: 'string', example: 'StrongPass123' },
          },
        },
        PatientInput: {
          type: 'object',
          required: ['first_name', 'last_name', 'date_of_birth', 'gender', 'address', 'disease_type'],
          properties: {
            national_id: { type: 'string', example: '1199880012345678' },
            first_name: { type: 'string', example: 'John' },
            last_name: { type: 'string', example: 'Doe' },
            date_of_birth: { type: 'string', format: 'date', example: '1990-05-15' },
            gender: { type: 'string', enum: ['male', 'female', 'other'] },
            phone: { type: 'string', example: '0781234567' },
            address: { type: 'string', example: 'Kigali, Gasabo' },
            disease_type: { type: 'string', enum: ['HIV', 'TB', 'HIV_TB'] },
            art_start_date: { type: 'string', format: 'date', example: '2023-01-10' },
            tb_treatment_start_date: { type: 'string', format: 'date' },
            facility_id: { type: 'string', format: 'uuid' },
          },
        },
        VisitInput: {
          type: 'object',
          required: ['patient_id', 'visit_date', 'visit_type'],
          properties: {
            patient_id: { type: 'string', format: 'uuid' },
            visit_date: { type: 'string', format: 'date-time' },
            visit_type: { type: 'string', enum: ['home_visit', 'facility_visit', 'phone_call'] },
            notes: { type: 'string', example: 'Patient is doing well' },
            symptoms: { type: 'array', items: { type: 'string' }, example: ['fever', 'cough'] },
            side_effects: { type: 'array', items: { type: 'string' }, example: ['nausea'] },
            missed_doses: { type: 'integer', example: 2 },
            next_visit_date: { type: 'string', format: 'date' },
          },
        },
        AdherenceInput: {
          type: 'object',
          required: ['patient_id', 'record_date', 'doses_taken', 'doses_prescribed'],
          properties: {
            patient_id: { type: 'string', format: 'uuid' },
            record_date: { type: 'string', format: 'date', example: '2026-03-20' },
            doses_taken: { type: 'integer', example: 28 },
            doses_prescribed: { type: 'integer', example: 30 },
          },
        },
        StockInput: {
          type: 'object',
          required: ['medication_name', 'quantity', 'unit'],
          properties: {
            medication_name: { type: 'string', example: 'TDF/3TC/EFV' },
            quantity: { type: 'integer', example: 100 },
            unit: { type: 'string', example: 'tablets' },
            low_stock_threshold: { type: 'integer', example: 20 },
            expiry_date: { type: 'string', format: 'date', example: '2027-01-01' },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);