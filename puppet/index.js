const puppeteer = require("puppeteer");
const db = require("../firebase");
let browserProcess = null;
let currentPage = null;
let globalItems = [];

const processLiveChat = async (videoId, page) => {
  page.on("response", async respond => {
    if (
      respond
        .url()
        .startsWith("https://www.youtube.com/live_chat/get_live_chat")
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
              timestamp: timestampUsec,
              videoId
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
        globalItems = items;
      }
    }
  });
  page.on("error", () => console.log("page error"));
};

const isLoggedIn = async page => {
  try {
    const MyAvatar = await findByLink(page, "Korean Dictionary", "span");
    console.log('trying to login')
    if (MyAvatar) {
      return { isLoggedIn: true }; // we are logged in
    } else {
      console.log("not logged in");
    }
    await page.waitForSelector("#button > yt-button-renderer > a");
    await page.click("#button > yt-button-renderer > a");
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', process.env.GOOGLE_USER);
    await page.screenshot({ path: "1.png" });
    await page.keyboard.press("Enter");
    await page.waitForSelector('input[type="password"]', { visible: true });
    await page.type('input[type="password"]', process.env.GOOGLE_PWD);
    await page.screenshot({ path: "2.png" });
    await page.keyboard.press("Enter");
    await page.screenshot({ path: "Logged in.png" });
    return { isLoggedIn: true };
  } catch (err) {
    return { isLoggedIn: false, error: err };
  }

};

// Normalizing the text
function getText(linkText) {
  linkText = linkText.replace(/\r\n|\r/g, "\n");
  linkText = linkText.replace(/\ +/g, " ");

  // Replace &nbsp; with a space
  var nbspPattern = new RegExp(String.fromCharCode(160), "g");
  return linkText.replace(nbspPattern, " ");
}

// find the link, by going over all links on the page
async function findByLink(page, linkString, elm) {
  const links = await page.$$(elm);
  for (var i = 0; i < links.length; i++) {
    let valueHandle = await links[i].getProperty("innerText");

    let linkText = await valueHandle.jsonValue();
    const text = getText(linkText);
    if (linkString == text) {
      //console.log("Found" + text);
      return links[i];
    }
  }
  return null;
}

const captchaWorkAround = async page => {
  try {
    await page.waitFor(1000);
    const Yes = await findByLink(page, "Yes", "span");
    if (Yes) {
      console.log("trying to click");
      await Yes.click();
    }
  } catch (err) {
    console.log("err trying captcha");
  }
};

const startLiveChatProcess = async (videoId, isPost) => {
  if (browserProcess) {
    currentPage = null;
    await browserProcess.close();
    browserProcess = null;
  }
  const browser = await puppeteer.launch({
    userDataDir: "data",
    devtools: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  browserProcess = browser;
  const page = (await browser.pages())[0];
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36"
  );
  await page.setRequestInterception(true);
  page.on("request", request => {
    if (request.resourceType() === "image") request.abort();
    else request.continue();
  });
  currentPage = page;
  await page.goto(`https://www.youtube.com/live_chat?v=${videoId}&is_popout=1`);
  processLiveChat(videoId, page);
  if (!isPost) {
    return await getScreenshot()
  } else {
    return await isLoggedIn(page);
  }
};
const sendMessage = async (msg, isPost) => {
  if (browserProcess && currentPage) {
    const page = currentPage;
    console.log('about to type')
    await page.waitForSelector("#input");
    console.log('found the input')
    await page.type("#input", msg);
    console.log('typed')
    await page.keyboard.press("Enter");
    console.log('pressed enter')
    if (!isPost) {
      return await getScreenshot()
    } else {
      return {message: msg};
    }
  }
};

const getScreenshot = async () => {
  if (browserProcess && currentPage) {
    const page = currentPage;
    return page.screenshot();
  }
};

const getHTML = async () => {
  if (browserProcess && currentPage) {
    const page = currentPage;
    return await page.content();
  }
};

const getMessages = async () => {
  return globalItems;
};


module.exports = {
    getScreenshot: getScreenshot,
    getMessages: getMessages,
    getHTML: getHTML,
    sendMessage: sendMessage,
    startLiveChatProcess: startLiveChatProcess
}