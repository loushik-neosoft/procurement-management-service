import swaggerJsdoc from 'swagger-jsdoc'
import envConfig from '@config/env';

export const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Procurement Management API',
            version: '1.0.0',
            description: 'API documentation for Procurement Management System'
        },
        servers: [
            {
                url: `http://localhost:${envConfig.PORT}/api`,
                description: 'Local server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                Question: {
                    type: 'object',
                    required: ['key', 'label', 'type', 'orderIndex'],
                    properties: {
                        key: { type: 'string' },
                        label: { type: 'string' },
                        type: {
                            type: 'string',
                            enum: ['BOOLEAN', 'DROPDOWN', 'MULTI_SELECT', 'TEXT', 'IMAGE_UPLOAD']
                        },
                        required: { type: 'boolean', default: true },
                        options: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                        orderIndex: { type: 'integer' }
                    }
                },
                CreateChecklistTemplate: {
                    type: 'object',
                    required: ['name', 'questions'],
                    properties: {
                        name: { type: 'string' },
                        clientId: { type: 'string', format: 'uuid' },
                        source: { type: 'string', enum: ['DEFAULT', 'CLIENT'] },
                        questions: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Question' }
                        }
                    }
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ['./src/modules/**/*.routes.ts', './dist/modules/**/*.routes.js']
})
