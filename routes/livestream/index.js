const puppet = require("../../puppet");
module.exports = [
  {
    method: "POST",
    path: "/live/{id}",
    handler: async request => {
      const { id } = request.params;
      return puppet
        .startLiveChatProcess({ id })
        .then(obj => {
          return obj;
        })
        .catch(err => {
          return { error: err };
        });
    }
  },
  {
    method: "POST",
    path: "/live/{id}/message",
    handler: async request => {
      const { id } = request.params;
      const { message } = request.payload;
      return puppet
        .sendMessage({ id, message })
        .then(obj => {
          return obj;
        })
        .catch(err => {
          return { error: err };
        });
    }
  }
];
