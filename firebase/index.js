const firebase = require("./firebase");
const db = firebase.database;
const moment = require("moment");

module.exports.sendMessageToDB = async ({
  name = "",
  thumbnailUrl = "",
  msg = "",
  timestampUsec = 0,
  videoId = ""
}) => {
  const ref = await db.ref(`livechat`);
  const key = await ref.push().key;
  ref.child(key).update({
    author: name,
    thumbnailUrl,
    content: msg,
    timestampUsec,
    videoId,
    timestamp: moment().format()
  });
};
