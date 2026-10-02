import { app } from './app.js';
import { config } from './config/index.js';
import { connectDB, disconnectDB } from './core/db/connection.js';
import { logger } from './core/logger/index.js';

let server;

async function startServer() {
  try {
    await connectDB();

    server = app.listen(config.PORT, () => {
      logger.info(`Dev House API server running on port ${config.PORT} [${config.NODE_ENV}]`);
    });

    const shutdown = async signal => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      if (server) {
        server.close(async () => {
          logger.info('HTTP server closed.');
          await disconnectDB();
          process.exit(0);
        });
      } else {
        await disconnectDB();
        process.exit(0);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

startServer();
