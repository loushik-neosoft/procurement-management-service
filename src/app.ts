import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@config/swagger';
import setUpRoutes from './routes';
import { errorHandler } from '@middlewares/errorHandler';
import { requestLogger } from '@middlewares/logger';
import { notFound } from '@middlewares/notFound';



const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(requestLogger);
app.use('/uploads', express.static('uploads'));

app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);

// Routes
setUpRoutes(app);

// Not Found Middleware
app.use(notFound);

// Error Handling Middleware
app.use(errorHandler);


export default app;
