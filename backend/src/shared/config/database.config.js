const { PrismaClient } = require('@prisma/client');

/**
 * Prisma client singleton.
 * Using a singleton prevents creating multiple database connections
 * during development with hot-reloading (nodemon restarts).
 */
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, attach to globalThis so hot-reloads don't create new connections.
  if (!globalThis.__prismaClient) {
    globalThis.__prismaClient = new PrismaClient({
      log: ['warn', 'error'],
    });
  }
  prisma = globalThis.__prismaClient;
}

module.exports = prisma;
