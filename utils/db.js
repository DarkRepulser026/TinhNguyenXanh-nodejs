const { PrismaClient } = require('@prisma/client');

let prisma;

if (!global.__samplePrisma) {
    global.__samplePrisma = new PrismaClient();
}

prisma = global.__samplePrisma;

module.exports = {
    prisma,
};
