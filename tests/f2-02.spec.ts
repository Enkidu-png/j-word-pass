import { test, expect } from "@playwright/test";

// AC F2-02: dzwiek startuje WYLACZNIE po kliknieciu (takze przy jwp.audio=on
// po odswiezeniu), wylaczenie ucisza w < 100 ms; negatywne: zero plikow audio.

// Podsluch WebAudio wstrzykiwany PRZED skryptami strony: liczy powstale
// konteksty i ich stan, wiec widac, czy cokolwiek zagralo bez klikniecia.
const PODSLUCH = () => {
  const okno = window as unknown as {
    __audio: AudioContext[];
    __wezly: { gain: GainNode[]; filtr: BiquadFilterNode[]; zrodla: AudioBufferSourceNode[] };
  };
  okno.__audio = [];
  okno.__wezly = { gain: [], filtr: [], zrodla: [] };
  const Oryginalny = window.AudioContext;
  const proto = Oryginalny.prototype;
  const cg = proto.createGain;
  proto.createGain = function (this: AudioContext) {
    const n = cg.call(this);
    okno.__wezly.gain.push(n);
    return n;
  };
  const cf = proto.createBiquadFilter;
  proto.createBiquadFilter = function (this: AudioContext) {
    const n = cf.call(this);
    okno.__wezly.filtr.push(n);
    return n;
  };
  const cbs = proto.createBufferSource;
  proto.createBufferSource = function (this: AudioContext) {
    const n = cbs.call(this);
    okno.__wezly.zrodla.push(n);
    return n;
  };
  class Podsluchany extends Oryginalny {
    constructor(...args: ConstructorParameters<typeof AudioContext>) {
      super(...args);
      okno.__audio.push(this as unknown as AudioContext);
    }
  }
  window.AudioContext = Podsluchany as unknown as typeof AudioContext;
};

test("Z16: bez klikniecia zero dzwieku, takze gdy jwp.audio=on", async ({ page }) => {
  await page.addInitScript(PODSLUCH);
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("jwp.audio", "on"));
  await page.reload();

  // preferencja zapamietana, ale radio milczy do czasu klikniecia
  await expect(page.locator("[data-radio]")).toHaveAttribute("data-gra", "nie");
  await expect(page.locator("[data-radio-notka]")).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { __audio: AudioContext[] }).__audio.length)).toBe(0);

  await page.locator("[data-radio-przycisk]").click();
  await expect(page.locator("[data-radio]")).toHaveAttribute("data-gra", "tak");
  const poKliknieciu = await page.evaluate(() => {
    const a = (window as unknown as { __audio: AudioContext[] }).__audio;
    return { ile: a.length, stan: a[0]?.state };
  });
  expect(poKliknieciu.ile).toBe(1);
  expect(poKliknieciu.stan).toBe("running");

  // graf faktycznie generuje szum urzedowy, a nie tylko stoi "running"
  const graf = await page.evaluate(() => {
    const w = (window as unknown as {
      __wezly: { gain: GainNode[]; filtr: BiquadFilterNode[]; zrodla: AudioBufferSourceNode[] };
    }).__wezly;
    const zrodlo = w.zrodla[0];
    const probki = zrodlo.buffer!.getChannelData(0);
    let niezerowe = 0;
    for (let i = 0; i < 1000; i++) if (probki[i] !== 0) niezerowe++;
    return {
      glosnosc: w.gain[0].gain.value,
      typFiltru: w.filtr[0].type,
      odciecie: w.filtr[0].frequency.value,
      petla: zrodlo.loop,
      dlugoscBufora: zrodlo.buffer!.length,
      niezerowe,
    };
  });
  expect(graf.glosnosc).toBeCloseTo(0.03, 5);
  expect(graf.typFiltru).toBe("lowpass");
  expect(graf.odciecie).toBe(400);
  expect(graf.petla).toBe(true);
  expect(graf.dlugoscBufora).toBeGreaterThan(0);
  expect(graf.niezerowe).toBeGreaterThan(900); // bialy szum, nie cisza
});

test("wylaczenie ucisza w mniej niz 100 ms", async ({ page }) => {
  await page.addInitScript(PODSLUCH);
  await page.goto("/");
  await page.locator("[data-radio-przycisk]").click();
  await expect(page.locator("[data-radio]")).toHaveAttribute("data-gra", "tak");

  const czasWyciszenia = await page.evaluate(async () => {
    const ctx = (window as unknown as { __audio: AudioContext[] }).__audio[0];
    const start = performance.now();
    (document.querySelector("[data-radio-przycisk]") as HTMLButtonElement).click();
    while (performance.now() - start < 1000) {
      if (ctx.state === "closed") return performance.now() - start;
      await new Promise((r) => setTimeout(r, 5));
    }
    return -1;
  });
  expect(czasWyciszenia).toBeGreaterThanOrEqual(0);
  expect(czasWyciszenia).toBeLessThan(100);
  await expect(page.locator("[data-radio]")).toHaveAttribute("data-gra", "nie");
  expect(await page.evaluate(() => localStorage.getItem("jwp.audio"))).toBe("off");
});

test("negatywne: zero plikow audio i jedyny localStorage to jwp.audio", async ({ page }) => {
  const zadania: string[] = [];
  page.on("request", (r) => zadania.push(r.url()));
  await page.goto("/");
  await page.locator("[data-radio-przycisk]").click();
  await page.waitForTimeout(300);
  expect(zadania.filter((u) => /\.(mp3|ogg|wav|m4a|aac|flac)(\?|$)/i.test(u))).toEqual([]);

  const klucze = await page.evaluate(() => Object.keys(localStorage));
  expect(klucze).toEqual(["jwp.audio"]);
});
