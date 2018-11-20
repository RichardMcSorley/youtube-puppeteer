"use strict";
require("dotenv").config();
const MessageQ = require("./firebase").queue;
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
  server.stop().then(async err => {
    console.log("hapi server stopped ");
    if (browserProcess) {
      await browserProcess.close();
      await MessageQ.shutdown();
    }
    process.exit(err ? 1 : 0);
  });
  // Force close server after 5secs
  setTimeout(e => {
    console.log("Forcing server close !!!", e);
    process.exit(1);
  }, 6000);
});
init();
