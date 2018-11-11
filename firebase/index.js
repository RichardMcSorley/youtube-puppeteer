const firebase = require("./firebase");
const db = firebase.database;

module.exports.sendMessageToDB = async (videoId, { name = '', thumbnailUrl = '', msg ='', timestamp = 0}) => {
    const ref = await db.ref(`livechat/${videoId}`);
    const key = await ref.push().key;
    ref.child(key).update({name, thumbnailUrl, msg, timestamp});
};
