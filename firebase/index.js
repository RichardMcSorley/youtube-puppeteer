const firebase = require("./firebase");
const db = firebase.database;
const moment = require("moment");
const livechatRef =
  process.env.NODE_ENV === "production"
    ? "livechat/tasks"
    : "TEST/livechat/tasks";
const Queue = require("firebase-queue");
const puppetDBResource =
  process.env.NODE_ENV === "development"
    ? `TEST/livechat/puppet`
    : "livechat/puppet";
const { sendMessage } = require("../puppet");
module.exports.sendMessageToDB = async ({
  name = "",
  thumbnailUrl = "",
  msg = "",
  timestampUsec = 0,
  videoId = ""
}) => {
  const ref = await db.ref(livechatRef);
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
const queue = new Queue(
  db.ref(puppetDBResource),
  { sanitize: false, suppressStack: true },
  (data, progress, resolve, reject) => {
    progress("picked up");
    return processChat(data, progress).then(() => {
      progress("should have finished");
      return db
        .ref(puppetDBResource)
        .child(data._id)
        .remove()
        .then(resolve)
        .catch(reject);
    });
  }
);
module.exports.queue = queue;
const processChat = async data => {
  const { payload, videoId } = data;
  await sendMessage({ message: payload, id: videoId });
};
