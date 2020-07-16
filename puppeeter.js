const puppeteer = require("puppeteer");
(async function () {
  function delay(time) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  }
  const browser = await puppeteer.launch({
    ignoreDefaultArgs: ["--mute-audio"],
  });
  const page = await browser.newPage();
  page
    .on("console", (message) =>
      console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`)
    )
    .on("pageerror", ({ message }) => console.log(message))
    .on("response", (response) => console.log(`${response.status()} ${response.url()}`))
    .on("requestfailed", (request) =>
      console.log(`${request.failure().errorText} ${request.url()}`)
    );

  page.on("request", (request) => {
    console.log(request);
    request.continue();
  });
  const resp = await page.goto("http://localhost:3000");

  page.on("load", async function () {
    delay(3);
    await page.keyboard.down("a");
    page.mouse.click(5, 3);
    await delay(0.1);
    page.mouse.click(5, 3);

    page.keyboard.down("a");

    await delay(0.1);
    page.keyboard.up("a");

    page.screenshot();
  });
  console.log(resp.headers());
})();
