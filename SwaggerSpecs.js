// swagger.js

import swaggerJsdoc from 'swagger-jsdoc';

const options1 = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Stocks',
      version: '1.0.0',
      description: 'APIs come from crawlers and third parties. If you have any questions, please contact Louis.',
      routePath:'/api/stock'
    },
  },
  apis: ['./Controllers/StockController.js'],

};
const options2 = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Shared',
      version: '1.0.0',
      description: 'APIs for managing share data',
      routePath:'/api/share'
    },
  },
  apis: ['./Controllers/SharedAPI_Controller.js'],

};
const options3 = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Users',
      version: '1.0.0',
      description: 'APIs for managing users data',
      routePath:'/api/user'
    },
  },
  apis: ['./Controllers/User_Controller.js'],

};
const SwaggerSpecs = [
  swaggerJsdoc(options1)
  ,swaggerJsdoc(options2)
  ,swaggerJsdoc(options3)
];

export default SwaggerSpecs;
