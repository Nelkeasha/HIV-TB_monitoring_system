import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import routes from './routes';

const app = express();

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'HIV & TB API Docs',
  swaggerOptions: {
    persistAuthorization: true,
  },
}));

app.get('/health', (_req, res) => {
    res.json({ status: 'ok', message: 'HIV TB API is running' });
});

// API Routes
app.use('/api/v1', routes);

export default app;