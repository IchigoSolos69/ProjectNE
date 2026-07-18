const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function getScrollHeight() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));

  const scrollHeight = await page.evaluate(() => {
    return document.documentElement.scrollHeight || document.body.scrollHeight;
  });

  await browser.close();
  return scrollHeight;
}

async function run() {
  const landingPath = path.join(__dirname, 'frontend', 'src', 'pages', 'Landing.tsx');
  const originalLanding = fs.readFileSync(landingPath, 'utf8');

  console.log('Testing with solid curtain active...');
  const activeResult = await getScrollHeight();
  console.log(`scrollHeight with curtain: ${activeResult}`);

  // Comment out HeroBlanket
  console.log('\nCommenting out HeroBlanket...');
  const commentedLanding = originalLanding.replace('<HeroBlanket heroNode={heroNode} />', '{/* <HeroBlanket heroNode={heroNode} /> */}');
  fs.writeFileSync(landingPath, commentedLanding, 'utf8');
  await new Promise(r => setTimeout(r, 2000));

  console.log('Testing with curtain disabled...');
  const disabledResult = await getScrollHeight();
  console.log(`scrollHeight without curtain: ${disabledResult}`);

  // Restore original
  fs.writeFileSync(landingPath, originalLanding, 'utf8');

  const match = activeResult === disabledResult;
  console.log(`\nHeights match: ${match ? 'YES' : 'NO'}`);
}

run().catch(console.error);
