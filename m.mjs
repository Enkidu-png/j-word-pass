import { chromium } from "@playwright/test";
const b = await chromium.launch();
const c = await b.newContext({viewport:{width:1280,height:800}});
await c.addInitScript(() => sessionStorage.setItem("jwp.v1", JSON.stringify({v:1,egzamin:{odpowiedz:"x",punkty:9,komentarz:"k"},quiz:null,ogien:null})));
const p = await c.newPage();
await p.goto("http://localhost:3000/quiz");
await p.waitForSelector(".karta__pytanie");
const zebrane=[];
for (let i=1;i<=15;i++){
  await p.locator(`[data-kwadrat="${i}"]`).click();
  await p.waitForTimeout(80);
  zebrane.push(await p.locator(".karta__pytanie").textContent());
}
console.log(zebrane.map((t,i)=>`${i+1}: ${t}`).join("\n"));
console.log("z imieniem:", zebrane.filter(t=>/Aleksandr|Rutkowsk|Mario Magdalen/.test(t)).length);
await b.close();
