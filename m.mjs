import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await (await b.newContext({viewport:{width:1280,height:800}})).newPage();
for (const s of ["/","/egzamin","/quiz","/proba-ognia"]) {
  await p.goto("http://localhost:3000"+s);
  console.log(s, JSON.stringify(await p.evaluate(() => ({
    img: document.querySelectorAll("footer img").length,
    tekst: document.querySelector(".stopka__tekst")?.textContent,
    slot: document.querySelectorAll("footer [data-radio-slot]").length,
  }))));
}
await b.close();
