import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Centro Quiropráctico',
      version: '1.0.0',
      description: 'API para el sistema de gestión del Centro Quiropráctico',
      contact: {
        name: 'Centro Quiropráctico',
        email: 'contacto@centroquiro.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./presentation/*/routes.js', './presentation/*/controller.js']
};

const specs = swaggerJsdoc(options);

export default specs; 