const puppeteer = require("puppeteer");

module.exports = function (url) {
  return new Promise((resolve, reject) => {
    (async () => {
      const browser = await puppeteer.launch({
        args: ["--no-sandbox"],
      });
      const page = await browser.newPage();

      await page.goto(url, {
        waitUntil: ["load", "networkidle0", "domcontentloaded"],
      });

      await new Promise((resolve) => setTimeout(resolve, 5000));

      const selector =
        "#fb-ad-preview > div > div > div:nth-child(1) > div > div";
      const padding = 0;

      const rect = await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        const { x, y, width, height } = element.getBoundingClientRect();
        return { left: x, top: y, width, height, id: element.id };
      }, selector);

      if (!rect)
        throw Error(
          `Could not find element that matches selector: ${selector}.`
        );

      const buffer = await page.screenshot({
        path: "element.png",
        type: "png",
        clip: {
          x: rect.left - padding,
          y: rect.top - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        },
      });

      await browser.close();

      resolve(buffer);
    })();
  });
};
