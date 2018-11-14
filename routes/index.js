const puppet = require("./puppet");
const livestream = require("./livestream");

const routes = [...puppet, ...livestream];
module.exports = (server, options) => {
  server.route({
    method: "GET",
    path: "/",
    handler: async () => {
      return "Running!!";
    }
  });
  routes.forEach(route => server.route(route));
};
