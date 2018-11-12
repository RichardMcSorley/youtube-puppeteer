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

        if (respond) {
            let json = null
            try {
                json = await respond.json();
            } catch (error) {
                console.log('could not parse json')
            }
            
            const { response = {} } = json;
            const { continuationContents = {} } = response;
            const { liveChatContinuation = {} } = continuationContents;
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
     
    }
  });
  page.on("error", () => console.log("page error"));
    LoginWhileHere(page);

};

const LoginWhileHere = async (page) => {
    try {
        
        await page.waitForSelector("#button > yt-button-renderer > a");
        await page.click("#button > yt-button-renderer > a");
        await page.waitForSelector('input[type="email"]');
        console.log(process.env.GOOGLE_USER, process.env.GOOGLE_PWD)
        await page.type('input[type="email"]', process.env.GOOGLE_USER );
        await page.keyboard.press("Enter"); 
        console.log('email')
        // await page.evaluate(() => { 
        //     debugger;
        // })
        await page.waitForSelector('input[type="password"]', { visible: true });
        await page.type('input[type="password"]', process.env.GOOGLE_PWD);
        await page.keyboard.press("Enter"); 
        console.log('password')
    } catch (err) {
        console.log('err logging in')
    }
    //captchaWorkAround(page);
}

const captchaWorkAround = async (page) => {
    try {
        await page.mouse.click(533, 567)
        console.log('clicked')
        // await page.evaluate(() => { 
        //     document.querySelector("#next > content > span").click();
        // })
        // await page.waitForSelector("#next > content > span");
        // await page.click("#next > content > span");
        // await page.waitForSelector('input[type="email"]');
        // console.log(process.env.GOOGLE_USER, process.env.GOOGLE_PWD)
        // await page.type('input[type="email"]', process.env.GOOGLE_USER );
        // await page.keyboard.press("Enter"); 
        // console.log('email')
        // // await page.evaluate(() => { 
        // //     debugger;
        // // })
        // await page.waitForSelector('input[type="password"]', { visible: true });
        // await page.type('input[type="password"]', process.env.GOOGLE_PWD);
        // await page.keyboard.press("Enter"); 
        // console.log('password')
    } catch (err) {
        console.log('err trying captcha')
    }

}

module.exports.processLiveChat = processLiveChat;
module.exports.startLiveChatProcess = async videoId => {
    if (browserProcess) {
      currentPage = null
    await browserProcess.close();
  }
    const browser = await puppeteer.launch({
        userDataDir: "data1",devtools: false,args: ['--no-sandbox', '--disable-setuid-sandbox']});
    console.log('cool')
  browserProcess = browser;
     const page = (await browser.pages())[0];
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36')
    currentPage = page;
  await page.goto(`https://www.youtube.com/live_chat?v=${videoId}&is_popout=1`);
  const screenshot = await page.screenshot();
  processLiveChat(videoId, page);
  return screenshot;
};
module.exports.sendMessage = async msg => {
    if (browserProcess && currentPage) {
        console.log('im in')
        const page = currentPage;
        let bodyHTML = await page.evaluate(() => document.body.innerHTML);
        console.log(bodyHTML)
        await page.waitForSelector("#input");
        console.log('i see input')
        await page.type("#input", msg);
        await page.keyboard.press("Enter");
        console.log('i pressed enter')
        return page.screenshot()
    }
    

};

module.exports.getScreenshot = async () => {
    if (browserProcess && currentPage) {
        const page = currentPage;
        return page.screenshot()
    }
}

module.exports.getHTML = async () => {
    if (browserProcess && currentPage) {
        const page = currentPage;
        return await page.content();
    }
}