import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

/* --------------------------------------------------
   Fix __dirname for ES Modules
-------------------------------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* --------------------------------------------------
   Sequelize Instance
-------------------------------------------------- */
export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    dialect: process.env.DB_DIALECT || "postgres",
    logging: false,
    timezone: "+05:30",

    pool: {
      max: 5,
      min: 0,
      acquire: Number(process.env.DB_ACQUIRE || 30000),
      idle: Number(process.env.DB_IDLE || 10000),
    },

    dialectOptions: {
      statement_timeout: 30000, // prevent long-running queries
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

/* --------------------------------------------------
   Model Container
-------------------------------------------------- */
const db = {};

/* --------------------------------------------------
   Load Models Dynamically
-------------------------------------------------- */
const loadModels = async () => {
  const modulesDir = path.join(__dirname, "../modules");

  if (!fs.existsSync(modulesDir)) {
    throw new Error(`Modules directory not found: ${modulesDir}`);
  }

  const folders = fs.readdirSync(modulesDir);

  for (const folder of folders) {
    const modelPath = path.join(modulesDir, folder, "model.js");

    if (!fs.existsSync(modelPath)) continue;

    const module = await import(modelPath);
    const model = module.default(sequelize);

    if (!model || !model.name) {
      throw new Error(`Invalid model export in ${modelPath}`);
    }

    db[model.name] = model;
  }

  // Setup associations
  Object.values(db).forEach((model) => {
    if (typeof model.associate === "function") {
      model.associate(db);
    }
  });

  Object.freeze(db);
};

/* --------------------------------------------------
   Connect Database
-------------------------------------------------- */
export const connectDB = async () => {
  try {
    await loadModels();
    await sequelize.authenticate();

    console.log("✅ PostgreSQL connected successfully");

    await sequelize.sync({ alter: true }); 
    console.log("✅ Database tables created/updated");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

/* --------------------------------------------------
   Exports
-------------------------------------------------- */
export { db };
export default sequelize;
