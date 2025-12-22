import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@config/swagger';
import setUpRoutes from './routes';
import { errorHandler } from '@middlewares/errorHandler';
import { requestLogger } from '@middlewares/logger';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use('/uploads', express.static('uploads'));

app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

// Routes
setUpRoutes(app);

// Error Handling Middleware
app.use(errorHandler);

export default app;
