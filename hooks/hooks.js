const gith = require("gith").create(6000); // run on port 6000
const exec = require("child_process").exec;
gith({
  repo: "RichardMcSorley/youtube-puppeteer" // the github-user/repo-name
}).on("all", function(payload) {
  console.log("push received ");
  exec("sh hooks.sh " + payload.branch, function(err, stdout, stderr) {
    if (err) {
      console.log("error", err);
      console.log("stderr", stderr);
      return err;
    }
    if (stderr) {
      console.log("stderr", stderr);
      return stderr;
    }
    console.log(stdout);
    console.log("Deployed!");
  });
});
console.log("Hooks is listening on port: 6000");
