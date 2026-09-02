import { chromium } from "@playwright/test";
const b = await chromium.launch();
const c = await b.newContext({viewport:{width:1280,height:800}});
await c.addInitScript(() => sessionStorage.setItem("jwp.v1", JSON.stringify({v:1,egzamin:{odpowiedz:"x",punkty:9,komentarz:"k"},quiz:null,ogien:null})));
const p = await c.newPage();
await p.goto("http://localhost:3000/quiz");
await p.waitForTimeout(4000);
console.log(JSON.stringify(await p.evaluate(() => [...document.querySelectorAll("[data-goniec]")].map(e=>e.textContent))));
await b.close();
