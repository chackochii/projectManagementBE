import swaggerJSDoc from "swagger-jsdoc";

const BASE_URL =
  process.env.BASE_URL || "https://tsuite.tortillon.net";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Project Management API",
      version: "1.0.0",
      description: "API documentation for Project Management Backend",
    },
    servers: [
      {
        url: `${BASE_URL}/api`,
        description: "Main API Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },

  apis: ["./routes/*.js", "./modules/**/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
