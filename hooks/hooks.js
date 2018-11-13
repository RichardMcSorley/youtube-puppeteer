var gith = require("gith").create(6000); // run on port 6000
const git = require("simple-git");
const path = "/root/puppet";

gith({
  repo: "RichardMcSorley/youtube-puppeteer" // the github-user/repo-name
}).on("all", function(payload) {
  console.log("push received");
  git(path).raw(
    ["config", "--global", "advice.pushNonFastForward", "false"],
    (err, result) => {
      if (err) {
        return console.log("err", err);
      }
      console.log("pulled", result);
    }
  );
});
