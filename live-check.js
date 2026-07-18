const puppeteer = require('puppeteer-core');
const path = require('path');

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => console.log('[BROWSER CONSOLE]', msg.text()));
  page.on('pageerror', err => console.log('[BROWSER PAGE ERROR]', err.toString()));

  console.log('Navigating to live production site https://rarecomforts.in ...');
  
  // Track network requests to see bundle names
  page.on('request', req => {
    const url = req.url();
    if (url.includes('.js') || url.includes('.css')) {
      console.log('[NETWORK REQUEST]', url);
    }
  });

  try {
    await page.goto('https://rarecomforts.in', { waitUntil: 'networkidle2', timeout: 30000 });
  } catch (e) {
    console.error('Navigation error:', e);
  }

  await new Promise(r => setTimeout(r, 4000));

  const domInfo = await page.evaluate(() => {
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    const blanket = document.querySelector('div[style*="willChange"], div[style*="will-change"]');
    
    // Look for any elements matching the blanket checkered overlay pattern/text
    const bodyChildren = [...document.body.children].map(el => ({
      tagName: el.tagName,
      className: el.className,
      id: el.id,
      style: el.getAttribute('style')
    }));

    return {
      headerFound: !!header,
      navFound: !!nav,
      blanketFound: !!blanket,
      bodyChildren,
      scrollHeight: document.body.scrollHeight,
      htmlScrollHeight: document.documentElement.scrollHeight,
    };
  });

  console.log('\n=== DOM INFO ===');
  console.log(JSON.stringify(domInfo, null, 2));

  console.log('\nTaking screenshot of live site...');
  await page.screenshot({ path: path.join(__dirname, 'live-screenshot.png'), fullPage: false });

  await browser.close();
  console.log('Done.');
}

run().catch(console.error);
