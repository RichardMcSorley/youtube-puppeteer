const puppet = require("../../puppet");
module.exports = [
  {
    method: "GET",
    path: "/screenshot/{id}",
    handler: async (request, h) => {
      const { id } = request.params;
      const screenshot = await puppet.getScreenshot({ id });
      return h
        .response(screenshot)
        .header("Content-Disposition", "inline")
        .header("Content-type", "image/png");
    }
  },

  {
    method: "GET",
    path: "/html/{id}",
    handler: async request => {
      const { id } = request.params;
      const html = await puppet.getHTML({ id });
      return html;
    }
  }
];
