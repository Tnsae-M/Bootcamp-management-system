import prisma from "./prisma.js";

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log(" PostgreSQL Connected via Prisma (csec_bms_db)");
  } catch (error) {
    console.error("Database Connection Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
