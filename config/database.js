import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Sequelize
export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || "postgres",
    logging: false,
    synchronize: true,

    pool: {
      max: 10,
      min: 0,
      acquire: parseInt(process.env.DB_ACQUIRE || "30000", 10),
      idle: parseInt(process.env.DB_IDLE || "10000", 10),
    },

   dialectOptions: {
      ssl: {
        require: false,
        rejectUnauthorized: false,
      },
    },
  }
);

// DB container
const db = {};



// Auto-load all models
const loadModels = async () => {
  const modulesDir = path.join(__dirname, "../modules");
  const folders = fs.readdirSync(modulesDir);

  for (const folder of folders) {
    const modelPath = path.join(modulesDir, folder, "model.js");

    if (fs.existsSync(modelPath)) {
      console.log("Loading model:", modelPath);
      const module = await import(modelPath);
      const model = module.default(sequelize);

      console.log(" → Loaded:", model?.name);

      db[model.name] = model;
    } else {
      console.log("No model.js found in:", folder);
    }
  }

  console.log("Final models in db:", Object.keys(db));

  // Associations
  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) db[modelName].associate(db);
  });
};


export const connectDB = async () => {
  try {
    await loadModels();   // ⬅️ Make sure models are loaded FIRST

    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected successfully");

    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync({ alter: true });
      console.log("✅  Database synchronized (DEV MODE)");
    }
  } catch (error) {
    console.error("❌ DB connection failed:", error.message);
    process.exit(1);
  }
};

export default sequelize;

export { db };