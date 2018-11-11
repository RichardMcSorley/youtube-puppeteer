const puppeteer = require("puppeteer");
const db = require("../firebase");
let browserProcess = null;
let currentPage = null

const processLiveChat = async (videoId, page) => {
  page.on("response", async respond => {
    if (
      respond
        .url()
        .startsWith("https://www.youtube.com/live_chat/get_live_chat")
    ) {
      const json = await respond.json();
      const { response } = json;
      const { continuationContents } = response;
      const { liveChatContinuation } = continuationContents;
      const { actions = [] } = liveChatContinuation;
      let items = [];

      actions.forEach(({ addChatItemAction = null }) => {
        if (addChatItemAction && addChatItemAction.item) {
          const { item } = addChatItemAction;
          const { liveChatTextMessageRenderer } = item;
          if (!liveChatTextMessageRenderer) {
            return;
          }
          const {
            authorName,
            authorPhoto,
            timestampUsec,
            message
          } = liveChatTextMessageRenderer;
          if (!authorName || !authorPhoto || !timestampUsec || !message) {
            return;
          }
          const name = authorName.simpleText;
          const thumbnails = authorPhoto.thumbnails.sort(
            (a, b) => a.height - b.height
          );
          const thumbnailUrl = thumbnails[thumbnails.length - 1].url;
          const msg = message.simpleText;

          items.push({
            name,
            thumbnailUrl,
            msg,
            timestamp: timestampUsec / 1000
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
        db.sendMessageToDB(videoId, message);
      });
    }
  });
  page.on("error", () => console.log("page error"));
    LoginWhileHere(page);

};

const LoginWhileHere = async (page)=>{
    await page.waitForSelector("#button > yt-button-renderer > a");
    await page.click("#button > yt-button-renderer > a");
    await page.waitForSelector('input[type="email"]');
    console.log(process.env.GOOGLE_USER, process.env.GOOGLE_PWD)
    await page.type('input[type="email"]', process.env.GOOGLE_USER );
    await page.keyboard.press("Enter"); 
    // await page.evaluate(() => { 
    //     debugger;
    // })
    await page.waitForSelector('input[type="password"]', { visible: true });
    await page.type('input[type="password"]', process.env.GOOGLE_PWD);
    await page.keyboard.press("Enter"); 
}

module.exports.processLiveChat = processLiveChat;
module.exports.startLiveChatProcess = async videoId => {
    if (browserProcess) {
      currentPage = null
    await browserProcess.close();
  }
    const browser = await puppeteer.launch({devtools: false,args: ['--no-sandbox', '--disable-setuid-sandbox']});
    console.log('cool')
  browserProcess = browser;
    const page = await browser.newPage();
    currentPage = page;
  await page.goto(`https://www.youtube.com/live_chat?v=${videoId}&is_popout=1`);
  const screenshot = await page.screenshot();
  processLiveChat(videoId, page);
  return screenshot;
};
module.exports.sendMessage = async msg => {
    if (browserProcess && currentPage) {
        const page = currentPage;
        await page.waitForSelector("#input");
        await page.type("#input", msg);
        await page.keyboard.press("Enter"); 
        return page.screenshot()
    }
}
