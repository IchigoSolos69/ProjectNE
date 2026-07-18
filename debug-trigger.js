const puppeteer = require('puppeteer-core');

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Navigating to live production site...');
  await page.goto('https://rarecomforts.in', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 4000));

  const pageInfo = await page.evaluate(() => {
    const blanket = [...document.body.children].find(el => el.tagName === 'DIV' && el.style.willChange === 'transform, opacity');
    const hero = document.querySelector('.hero-container');
    const heroRect = hero ? hero.getBoundingClientRect() : null;
    const blanketRect = blanket ? blanket.getBoundingClientRect() : null;
    
    return {
      scrollY: window.scrollY,
      innerHeight: window.innerHeight,
      heroRect,
      blanketRect,
      blanketStyle: blanket ? blanket.getAttribute('style') : null,
    };
  });

  console.log('Live Page Info on load:', JSON.stringify(pageInfo, null, 2));

  await browser.close();
}

run().catch(console.error);
