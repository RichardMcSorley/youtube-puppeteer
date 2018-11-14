"use strict";
require("dotenv").config();
const Hapi = require("hapi");
const server = Hapi.server({
  port: process.env.PORT,
  host: "localhost"
});
const browserProcess = require("./puppet");
require("./routes")(server); //setup routes

const init = async () => {
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

process.on("unhandledRejection", err => {
  console.log(err);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Closing server...");
  server.close(async () => {
    await browserProcess.close();
    console.log("Browser closed !!!");
    console.log("Server closed !!! ");
    process.exit();
  });
  // Force close server after 5secs
  setTimeout(e => {
    console.log("Forcing server close !!!", e);
    process.exit(1);
  }, 5000);
});
init();
