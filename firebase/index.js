const firebase = require("./firebase");
const db = firebase.database;
const moment = require("moment");
const livechatRef = "livechat/tasks";
const Queue = require("firebase-queue");
const puppetDBResource = "livechat/puppet";
const { sendMessage, startLiveChatProcess } = require("../puppet");
module.exports.sendMessageToDB = async ({
  name = "",
  thumbnailUrl = "",
  msg = "",
  timestampUsec = 0,
  videoId = "",
  ...rest
}) => {
  const ref = await db.ref(livechatRef);
  const key = await ref.push().key;
  ref.child(key).update({
    author: name,
    thumbnailUrl,
    content: msg,
    timestampUsec,
    videoId,
    timestamp: moment().format(),
    ...rest
  });
};
module.exports.updatePage = async ({
  id,
  liveChatTextMessageRenderer,
  liveChatPaidMessageRenderer
}) => {
  //temporarily disable for now
  // const ref = await db.ref(puppetDBResource + "/pages/" + id);
  // const key = await ref.push().key;
  // ref
  //   .child(key)
  //   .update({ liveChatTextMessageRenderer, liveChatPaidMessageRenderer });
};
const videoQ = new Queue(
  db.ref(puppetDBResource + "/video"),
  { sanitize: false, suppressStack: true },
  (data, progress, resolve, reject) => {
    progress("picked up");
    return processVideo(data, progress).then(() => {
      progress("finished");
      return db
        .ref(puppetDBResource)
        .child(data._id)
        .remove()
        .then(resolve)
        .catch(reject);
    });
  }
);
const messageQ = new Queue(
  db.ref(puppetDBResource),
  { sanitize: false, suppressStack: true },
  (data, progress, resolve, reject) => {
    progress("picked up");
    return processChat(data, progress).then(() => {
      progress("finished");
      return db
        .ref(puppetDBResource)
        .child(data._id)
        .remove()
        .then(resolve)
        .catch(reject);
    });
  }
);
module.exports.videoQ = videoQ;
module.exports.messageQ = messageQ;
const processChat = async data => {
  const { payload, videoId } = data;
  await sendMessage({ message: payload, id: videoId });
};
const processVideo = async data => {
  const { videoId } = data;
  console.log("connecting");
  await startLiveChatProcess({ id: videoId });
};
