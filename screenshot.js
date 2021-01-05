const puppeteer = require("puppeteer");
const GIFEncoder = require('gifencoder');
const PNG = require('png-js');
const fs = require('fs');
const ENV = 'DEV'; //DEV or PROD

function decode(png) {
  return new Promise(r => {png.decode(pixels => r(pixels))});
}

async function gifAddFrame(page, encoder, rect, left, top, padding) {
  const pngBuffer = await page.screenshot({ clip: { width: rect.width + padding, height: rect.height+ padding, x: left !== 0 ? left : rect.left , y: top !== 0 ? top : rect.top  } });
  const png = new PNG(pngBuffer);
  await decode(png).then(pixels => encoder.addFrame(pixels));
}

module.exports = function (url,preview_type='', gif=false,ad_id=null) {
  return new Promise((resolve, reject) => {
    (async () => {
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
        ignoreHTTPSErrors: true,
        headless: false,
        defaultViewport:null,
        executablePath: ENV === 'DEV'?  '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome' : '/usr/bin/google-chrome' //The chromium that is shipped with puppeteer does not have the codecs required for licensing and size reasons. https://github.com/puppeteer/puppeteer#q-what-features-does-puppeteer-not-support
      });
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1590 });
      await page.goto(url, {
        waitUntil: ["networkidle2", "domcontentloaded"],
      });
    
     
      var padding = 75;
      var left = 0;
      var top = 0;
      var selector =
        "#fb-ad-preview > div > div > div:nth-child(1) > div > div";

      if(preview_type === "MOBILE_FEED_STANDARD"){
        selector = "#fb-ad-preview > div > div";
        padding = 20;
      } 
      
      if(ad_id){ // adlib case
        await page.keyboard.press('Enter');
        await page.reload({ waitUntil: ["networkidle2", "domcontentloaded"] });
      }
      
      await new Promise((resolve) => setTimeout(resolve, 8000));
      
      const rect = await page.evaluate(async(selector,ad_id) => {
        let element;
        if(ad_id){
            const divElements = await document.documentElement.querySelectorAll('div');
            const AdLibElements = Array.prototype.filter.call(divElements, (element) =>
                RegExp(ad_id).test(element.textContent)
            );

          const adLibElement =  AdLibElements.pop();
          element = adLibElement.parentElement.parentElement.parentElement.parentElement.nextElementSibling.nextElementSibling;
        }else{
          element = document.querySelector(selector);
        }
        const { x, y, width, height } = element.getBoundingClientRect();
        return { left: x, top: y, width, height, id: element.id };
      }, selector, ad_id);

      if (!rect)
        throw Error(
          `Could not find element that matches selector: ${selector}.`
        );

      if(gif){      
        await page.click(
          'div[role="button"]'
        ); //video not playing upon clicking
        console.log("Rendering GIFs");

        var encoder = new GIFEncoder(rect.width+padding, rect.height+padding);
        encoder.createWriteStream()
          .pipe(fs.createWriteStream('test.gif'));

        encoder.start();
        encoder.setRepeat(0);
        encoder.setDelay(150);
        encoder.setQuality(10);

        for (let i = 0; i < 10; i++) {
          await gifAddFrame(page, encoder, rect, left, top, padding);
        }
        
        encoder.finish();
        await browser.close();
        resolve(encoder);
      }else{
      const buffer = await page.screenshot({
          path: "element.png",
          type: "png",
          clip: {
            x: left !== 0 ? left : rect.left,
            y: top !== 0 ? top : rect.top,
            width: rect.width + padding,
            height: rect.height + padding,
          }
        });
    
      await browser.close();

      resolve(buffer);
      }
    })();
  });
};
