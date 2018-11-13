const firebase = require("./firebase");
const db = firebase.database;
const moment = require('moment');

module.exports.sendMessageToDB = async (videoId, { name = '', thumbnailUrl = '', msg ='', timestamp = 0}) => {
    const ref = await db.ref(`livechat`);
    const key = await ref.push().key;
    ref.child(key).update({author: name, thumbnailUrl, content: msg, timestamp: moment().format()});
};
