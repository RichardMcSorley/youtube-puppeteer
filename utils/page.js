// Normalizing the text
function getText(linkText) {
  linkText = linkText.replace(/\r\n|\r/g, "\n");
  linkText = linkText.replace(/\ +/g, " ");

  // Replace &nbsp; with a space
  var nbspPattern = new RegExp(String.fromCharCode(160), "g");
  return linkText.replace(nbspPattern, " ");
}

// find the link, by going over all links on the page
const findByElm = async ({ page, string, elm }) => {
  const links = await page.$$(elm);
  for (var i = 0; i < links.length; i++) {
    let valueHandle = await links[i].getProperty("innerText");
    let linkText = await valueHandle.jsonValue();
    const text = getText(linkText);
    if (string == text) {
      //console.log("Found" + text);
      return links[i];
    }
  }
  return null;
};

module.exports = {
  findByElm
};
