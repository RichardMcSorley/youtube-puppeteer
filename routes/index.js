const puppet = require("./puppet");
const livestream = require("./livestream");
const appInfo = require("../package.json");

const routes = [...puppet, ...livestream];
module.exports = (server, options) => {
  server.route({
    method: "GET",
    path: "/",
    handler: async () => {
      return `${appInfo.name}`;
    }
  });
  routes.forEach(route => server.route(route));
};
