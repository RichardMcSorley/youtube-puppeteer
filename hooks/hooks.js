var gith = require("gith").create(6000); // run on port 6000

gith({
  repo: "RichardMcSorley/youtube-puppeteer" // the github-user/repo-name
}).on("all", function(payload) {
  console.log("push received");
  exec('/root/puppet/hooks/hooks.sh ' + payload.branch, function(err, stdout, stderr){
    if (err) return err;
    console.log(stdout);
    console.log("git deployed to branch " + payload.branch);
  });
});
