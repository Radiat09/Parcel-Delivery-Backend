/* eslint-disable no-console */
import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
    console.log("Connected to Mongodb Database!!");

    server = app.listen(envVars.PORT, () => {
      console.log(`Server is listing to port: ${envVars.PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
};

(async () => {
  await startServer();
  await seedSuperAdmin();
})();

// unhandled rejection error
process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection detected .... Server shutting down...", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

// uncaught rejection error
process.on("uncaughtException", (err) => {
  console.log("Uncaught exception detected .... Server shutting down...", err);

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

// signal termination /sigterm
process.on("SIGTERM", () => {
  console.log("Sigterm signal reciveed detected .... Server shutting down...");

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

// SIGINT
process.on("SIGINT", () => {
  console.log("SIGINT signal reciveed detected .... Server shutting down...");

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});
