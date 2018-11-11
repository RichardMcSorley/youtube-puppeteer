const puppet = require("./puppet");
module.exports = (server, options) => {
  server.route({
    method: "GET",
    path: "/live/{id}",
    handler: async (request, h) => {
      console.log('hello')
      const id = request.params.id;
        if (id) {
          const screenshot = await puppet.startLiveChatProcess(id)
          return h.response(screenshot).header('Content-Disposition','inline').header('Content-type','image/png')
      } else {
        return "no";
      }
    }
    });
    server.route({
      method: "GET",
      path: "/live/message/{msg}",
      handler: async (request, h) => {
        const msg = request.params.msg;
          if (msg) {
            const screenshot = await puppet.sendMessage(msg)
            return h.response(screenshot).header('Content-Disposition','inline').header('Content-type','image/png')
        } else {
          return "no";
        }
      }
      });
};
