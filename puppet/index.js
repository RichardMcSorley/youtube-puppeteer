const puppeteer = require("puppeteer-extra");
const processLiveChat = require("./processLiveChat");
const pageUtils = require("../utils/page");
const moment = require("moment");
const schedule = require("node-schedule");
const devtools = require("puppeteer-extra-plugin-devtools")();
const DEVTOOLS_PORT = "5000";
devtools.setAuthCredentials("bob", "swordfish");
puppeteer.use(devtools);
puppeteer.use(require("puppeteer-extra-plugin-stealth")());
puppeteer.use(
  require("puppeteer-extra-plugin-block-resources")({
    blockedTypes: new Set([
      "image",
      "stylesheet",
      "font",
      "media",
      "texttrack",
      "manifest"
    ])
  })
);
let browserProcess = null;
const getBrowser = async () => {
  try {
    if (browserProcess) {
      return browserProcess;
    }
    browserProcess = await puppeteer.launch({
      userDataDir: "data",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        `--remote-debugging-port=${DEVTOOLS_PORT}`
      ]
    });
    return browserProcess;
  } catch (error) {
    return { error };
  }
};

// caching for when I dont know my page id
browserProcess = getBrowser();
let openPages = {};

const isLoggedIn = async ({ page, shouldScreenshot = false }) => {
  // Live chat
  try {
    let MyAvatar = await pageUtils.findByElm({
      page,
      string: "Korean Dictionary *",
      elm: "span"
    });
    if (MyAvatar) {
      return { isLoggedIn: true }; // we are logged in already
    } else {
    }
    let isChatDisabled = await pageUtils.findByElm({
      page,
      string: "Chat is disabled for this live stream.",
      elm: "yt-formatted-string"
    });
    if (isChatDisabled) {
      return { isLoggedIn: false, error: "chat is disabled" };
    }
    await page.waitForSelector("#button > yt-button-renderer > a");
    await page.click("#button > yt-button-renderer > a");
    if (shouldScreenshot) {
      await page.screenshot({ path: "click-login.png" });
    }
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', process.env.GOOGLE_USER);
    if (shouldScreenshot) {
      await page.screenshot({ path: "enter-email.png" });
    }
    await page.keyboard.press("Enter");
    await page.waitForSelector('input[type="password"]', { visible: true });
    await page.type('input[type="password"]', process.env.GOOGLE_PWD);
    if (shouldScreenshot) {
      await page.screenshot({ path: "enter-password.png" });
    }
    await page.keyboard.press("Enter");
    if (shouldScreenshot) {
      await page.screenshot({ path: "login-finish.png" });
    }
    MyAvatar = await pageUtils.findByElm({
      page,
      string: "Korean Dictionary *",
      elm: "span"
    });
    if (MyAvatar) {
      return { isLoggedIn: true }; // we are logged in already
    } else {
      return { isLoggedIn: false, error: "Couldn't see my Avatar!" }; // we are logged in already
    }
  } catch (err) {
    return { isLoggedIn: false, error: err };
  }
};

const startLiveChatProcess = async ({ id }) => {
  if (id in openPages) {
    // we already connected to that page, unsub!
    openPages[id].unsubscribeFromMyEvents();
  }
  // Live chat
  try {
    const browser = await getBrowser({});
    if (!browser || browser.error) {
      return { isLoggedIn: false, error: browser.error, ctx: "browser" };
    }
    const page = await getPage({
      id,
      url: `https://www.youtube.com/live_chat?v=${id}&is_popout=1`
    });
    if (!page || page.error) {
      return { isLoggedIn: false, error: page.error, ctx: "page" };
    }

    processLiveChat({ id, page });
    return await isLoggedIn({ page });
  } catch (error) {
    console.log("error", error);
    return { error };
  }
};

const getPage = async ({ id, url }) => {
  try {
    if (browserProcess && id in openPages) {
      return openPages[id];
    }
    openPages[id] = await browserProcess.newPage();
    const page = openPages[id];
    page.timestamp = moment().format();
    // got to URL
    await page.goto(url);
    return page;
  } catch (error) {
    console.log("error", error);
    if (error) {
      return { error };
    } else {
      return { error: "Page could not load correctly." };
    }
  }
};

const sendMessage = async ({ message, id }) => {
  // live chat message
  if (message.length > 197) {
    message = message.substring(0, 197);
    message = message + "...";
  }
  try {
    if (id in openPages) {
      const page = openPages[id];
      await page.waitForSelector("#input");
      await page.type("#input", message);
      await page.keyboard.press("Enter");
      return { message: message };
    } else {
      if (!browserProcess) {
        await getBrowser({});
      }
      const newPage = await getPage({
        id,
        url: `https://www.youtube.com/live_chat?v=${id}&is_popout=1`
      });
      await processLiveChat({ id, page: newPage });
      return await sendMessage({ message, id });
    }
  } catch (error) {
    return { error };
  }
};

const getScreenshot = async ({ id }) => {
  if (id in openPages) {
    return await openPages[id].screenshot();
  } else {
    return { error: "Could not find page id:" + id };
  }
};

const getHTML = async ({ id }) => {
  if (id in openPages) {
    return await openPages[id].content();
  } else {
    return { error: "Could not find page id:" + id };
  }
};

const getInspect = async () => {
  if ("inspect" in openPages) {
    return await openPages.inspect.content();
  } else {
    const page = await getPage({
      id: "inspect",
      url: "http://localhost:" + DEVTOOLS_PORT
    });
    return await page.content();
  }
};

const closeLongRunningTasks = async () => {
  // close page if open longer than an hour without updates, also close browser if no pages
  const pageIds = Object.keys(openPages);
  let amountOfPageIds = pageIds.length;
  pageIds.forEach(async pageId => {
    if (
      pageId in openPages &&
      moment(openPages[pageId].timestamp).isBefore(moment().subtract(1, "hour"))
    ) {
      // page is not active
      console.log("closing page", pageId);
      await openPages[pageId].close();
      delete openPages[pageId];
      amountOfPageIds = Object.keys(openPages).length;
    }
  });
  if (amountOfPageIds === 0) {
    // no pages open!
    if (browserProcess) {
      console.log("closing browser");
      await browserProcess.close();
      browserProcess = null;
    }
  }
};

const everyMin = () => {
  // batch running every 1 mins
  const rule = new schedule.RecurrenceRule();
  rule.minute = new schedule.Range(0, 59, 1);
  schedule.scheduleJob(rule, async () => {
    closeLongRunningTasks();
  });
};

const run = () => {
  everyMin();
};
run();

module.exports = {
  getScreenshot: getScreenshot,
  getHTML: getHTML,
  sendMessage: sendMessage,
  startLiveChatProcess: startLiveChatProcess,
  browserProcess: browserProcess,
  getInspect: getInspect
};
