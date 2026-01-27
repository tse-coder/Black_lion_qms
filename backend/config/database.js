import { Sequelize } from "sequelize";
import dns from "dns";
import "dotenv/config";

dns.setDefaultResultOrder("ipv4first");

const sequelize = new Sequelize(
  process.env.DB_NAME || "neondb",
  process.env.DB_USER || "neondb_owner",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    dialect: "postgres",
    logging: false,

    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },

    retry: {
      max: 3,
    },
  }
);

export default sequelize;
