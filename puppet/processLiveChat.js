const db = require("../firebase");
const moment = require("moment");

module.exports = async ({ id, page }) => {
  let responses = respond => handleResponses({ respond, id, page });
  let onError = e => console.log("page error", e);
  page.unsubscribeFromMyEvents = () => {
    page.removeListener("response", responses);
    page.removeListener("error", onError);
  };

  page.on("response", responses);
  page.on("error", onError);
  page.on("close", () => page.unsubscribeFromMyEvents());
};

const handleResponses = async ({ respond, id, page }) => {
  if (
    respond.url().startsWith("https://www.youtube.com/live_chat/get_live_chat")
  ) {
    if (respond) {
      let json = null;
      try {
        json = await respond.json();
      } catch (error) {
        console.log("could not parse json");
      }
      if (!json) {
        return null;
      }
      let = liveChatTextMessageRenderer = null
      let = liveChatPaidMessageRenderer = null
      const { response = {} } = json;
      const { continuationContents = {} } = response;
      const { liveChatContinuation = {} } = continuationContents;
      const { actions = [] } = liveChatContinuation;
      let items = [];

      actions.forEach(({ addChatItemAction = null }) => {
        if (addChatItemAction && addChatItemAction.item) {
          const { item } = addChatItemAction;
          if(item.liveChatPaidMessageRenderer){
            liveChatPaidMessageRenderer = item.liveChatPaidMessageRenderer;
          }if(item.liveChatTextMessageRenderer){
            liveChatTextMessageRenderer = item.liveChatTextMessageRenderer;
          }
          if (!liveChatTextMessageRenderer) {
            return;
          }
          const {
            authorName,
            authorPhoto,
            timestampUsec,
            message,
            authorBadges = []
          } = liveChatTextMessageRenderer;
          if (!authorName || !authorPhoto || !timestampUsec || !message) {
            return;
          }
          const roles = authorBadges.map(badge => {
            const { liveChatAuthorBadgeRenderer } = badge;
            const { icon } = liveChatAuthorBadgeRenderer;
            return icon.iconType;
          });
          const name = authorName.simpleText;
          if (name === "Korean Dictionary *") {
            return;
          }
          const thumbnails = authorPhoto.thumbnails.sort(
            (a, b) => a.height - b.height
          );
          const thumbnailUrl = thumbnails[thumbnails.length - 1].url;
          const msg = message.simpleText;

          items.push({
            name,
            thumbnailUrl,
            msg,
            timestampUsec,
            videoId: id,
            roles
          });
        }
      });
      items = items.sort((a, b) => {
        if (a.timestampUsec && b.timestampUsec) {
          return a.timestampUsec - b.timestampUsec;
        } else {
          return -1;
        }
      });
      items.forEach(message => {
        db.sendMessageToDB(message);
      });
      if (!liveChatPaidMessageRenderer) {
        liveChatPaidMessageRenderer = null;
      }
      if (!liveChatTextMessageRenderer) {
        liveChatTextMessageRenderer = null;
      }
      page.timestamp = moment().format();
      db.updatePage({
        liveChatTextMessageRenderer,
        liveChatPaidMessageRenderer,
        id
      });
    }
  }
};
