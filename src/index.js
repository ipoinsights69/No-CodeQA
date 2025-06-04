'use strict';

require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const path = require('path');
const cors = require('@fastify/cors');

// Register CORS plugin
fastify.register(cors, {
  // put your options here
  origin: "*", // Allow all origins for now, you might want to restrict this in production
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
});

// Register routes
fastify.register(require('./routes/test-routes'));

// Health check route
fastify.get('/health', async () => {
  return { status: 'ok' };
});

// Start server
const start = async () => {
  try {
    const defaultPort = process.env.PORT || 3000;
    let port = defaultPort;
    let maxAttempts = 10;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        await fastify.listen({ port, host: '0.0.0.0' });
        fastify.log.info(`Server listening on ${fastify.server.address().port}`);
        break;
      } catch (err) {
        if (err.code === 'EADDRINUSE') {
          attempts++;
          port = defaultPort + attempts;
          fastify.log.warn(`Port ${port - 1} is in use, trying port ${port}...`);
        } else {
          throw err;
        }
      }
    }
    
    if (attempts >= maxAttempts) {
      throw new Error(`Could not find an available port after ${maxAttempts} attempts`);
    }
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();