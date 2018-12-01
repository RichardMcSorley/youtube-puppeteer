"use strict";
require("dotenv").config();
const MessageQ = require("./firebase").queue;
const Hapi = require("hapi");
const server = Hapi.server({
  port: 3000
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
process.on("SIGINT", () => gShutdown("SIGINT"));

const gShutdown = eventType => {
  console.log("Closing server...");
  server.stop().then(async _ => {
    console.log("hapi server stopped ");
    if (browserProcess && browserProcess.hasOwnProperty("close")) {
      await browserProcess.close();
    }
    await MessageQ.shutdown();
    process.kill(process.pid, eventType);
  });
  // Force close server after 6secs
  setTimeout(e => {
    console.log("Forcing server close !!!", e);
    process.kill(process.pid, eventType);
  }, 6000);
};

init();
