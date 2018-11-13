const puppet = require("./puppet");
module.exports = (server, options) => {
  server.route({
    method: "GET",
    path: "/live/{id}",
    handler: async (request, h) => {
      const id = request.params.id;
      if (id) {
        const screenshot = await puppet.startLiveChatProcess(id);
        return h
          .response(screenshot)
          .header("Content-Disposition", "inline")
          .header("Content-type", "image/png");
      } else {
        return "no";
      }
    }
  });
  server.route({
    method: "GET",
    path: "/",
    handler: async (request, h) => {
      return 'Running!!'
    }
  });
  server.route({
    method: "POST",
    path: "/live/{id}",
    handler: async (request, h) => {
      return puppet.startLiveChatProcess(request.params.id, true).then((obj) => {
         return obj;
      }).catch((err) => {
        return { error: err };
      });
    }
  }); 
  server.route({
    method: "GET",
    path: "/live/message/{msg}",
    handler: async (request, h) => {
      const msg = request.params.msg;
      if (msg) {
        const screenshot = await puppet.sendMessage(msg);
        return h
          .response(screenshot)
          .header("Content-Disposition", "inline")
          .header("Content-type", "image/png");
      } else {
        return "no";
      }
    }
  });
  server.route({
    method: "GET",
    path: "/messages",
    handler: async (request, h) => {
      return puppet.getMessages()
    }
  });
  server.route({
    method: "POST",
    path: "/live/message",
    handler: async (request, h) => {
      return puppet.sendMessage(request.payload.message, true).then((bool) => {
         return { message: bool };
      }).catch((err) => {
        return { err: err };
      });
    }
  }); 

  server.route({
    method: "GET",
    path: "/screenshot",
    handler: async (request, h) => {
      const screenshot = await puppet.getScreenshot();
      return h
        .response(screenshot)
        .header("Content-Disposition", "inline")
        .header("Content-type", "image/png");
    }
  });
  server.route({
    method: "GET",
    path: "/html",
    handler: async (request, h) => {
      const html = await puppet.getHTML();
      return html;
      
    }
  });
};
