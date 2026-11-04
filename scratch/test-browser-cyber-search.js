const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Mock a lightweight browser environment to run browser.js
const domState = {
  elements: {},
  bodyChildren: []
};

function createMockElement(tag, id = '') {
  let _text = '';
  let _html = '';
  return {
    tagName: tag.toUpperCase(),
    id: id,
    style: {},
    className: '',
    value: '',
    get textContent() { return _text; },
    set textContent(v) {
      _text = v;
      _html = String(v)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },
    get innerHTML() { return _html; },
    set innerHTML(v) { _html = v; },
    children: [],
    appendChild(c) { this.children.push(c); return c; },
    focus() {},
    setAttribute() {},
    getAttribute() {},
    addEventListener() {}
  };
}

global.window = {
  _awardClaimed: false,
  _postAwardTasks: {}
};
global.document = {
  body: {
    appendChild(el) { domState.bodyChildren.push(el); return el; }
  },
  getElementById(id) {
    if (!domState.elements[id]) {
      domState.elements[id] = createMockElement('div', id);
    }
    return domState.elements[id];
  },
  createElement(tag) {
    return createMockElement(tag);
  }
};
global.isInternetConnected = () => true;
global.showToast = (msg, type) => {};
global.openApp = (app) => {};
global.focusWindow = (win) => {};
global.escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Load browser.js in sandbox
const browserJsPath = path.resolve('CyberZER0-main/src/js/apps/browser.js');
const browserCode = fs.readFileSync(browserJsPath, 'utf8');

// Evaluate browser.js
const vm = require('vm');
const context = vm.createContext({
  ...global,
  BROWSER_HOME_HTML: '',
  browserHistory: [],
  browserCurrentIdx: 0,
  window: global.window,
  document: global.document,
  console: console,
  URL: global.URL,
  encodeURIComponent: global.encodeURIComponent,
  decodeURIComponent: global.decodeURIComponent,
  encodeURI: global.encodeURI,
  Math: Math
});

vm.runInContext(browserCode, context);

console.log('=== RUNNING BROWSER CYBER & CYBER TIPS SEARCH TESTS ===\n');

// 1. Test renderGoogleResults('cyber', 'all')
console.log('--- Test 1: Search query "cyber" ---');
const cyberHtml = context.renderGoogleResults('cyber', 'all');
assert(!cyberHtml.includes('did not match any documents'), 'Should NOT show no-results for "cyber"');
assert(cyberHtml.includes('Cybersecurity &amp; Infrastructure Security Agency') || cyberHtml.includes('cisa.gov'), 'Should display CISA in results');
assert(cyberHtml.includes('The 4 Foundational Cyber Tips to Stay Safe Online'), 'Should render feature snippet for "cyber"');
assert(cyberHtml.includes('Turn On Multi-Factor Authentication (MFA)'), 'Feature snippet should include MFA');
assert(cyberHtml.includes('Recognize &amp; Report Phishing'), 'Feature snippet should include Phishing defense');
assert(cyberHtml.includes('People also ask'), 'Should display People Also Ask section');
assert(cyberHtml.includes('What are the 4 most important cyber safety tips from CISA?'), 'Should show CISA tips question');
assert(cyberHtml.includes('Why is Multi-Factor Authentication (MFA) so effective against hackers?'), 'Should show MFA explanation');
assert(cyberHtml.includes('Related searches'), 'Should display Related Searches section');
assert(cyberHtml.includes('cisa 4 easy ways to stay safe online'), 'Should include CISA related search chip');
console.log('✓ "cyber" search displays authentic CISA cyber defense guide, feature snippet, sitelinks, PAA, and related searches.');

// 2. Test renderGoogleResults('cyber tips', 'all')
console.log('\n--- Test 2: Search query "cyber tips" ---');
const cyberTipsHtml = context.renderGoogleResults('cyber tips', 'all');
const titles = [...cyberTipsHtml.matchAll(/class="gresult-title"[^>]*>(.*?)<\/div>/g)].map(m => m[1]);
console.log('Result titles for cyber tips:', titles);
assert(!cyberTipsHtml.includes('did not match any documents'), 'Should NOT show no-results for "cyber tips"');
assert(cyberTipsHtml.includes('CISA: 4 Easy Ways to Stay Safe Online'), 'Should show CISA 4 Easy Ways in top results');
assert(cyberTipsHtml.includes('Online Security &amp; Identity Protection Tips'), 'Should show FTC tips');
assert(cyberTipsHtml.includes('Top 10 Cyber Hygiene Best Practices'), 'Should show SANS cyber hygiene');
assert(cyberTipsHtml.includes('The 4 Foundational Cyber Tips to Stay Safe Online'), 'Should render feature snippet');
assert(cyberTipsHtml.includes('Enable Multi-Factor Authentication (MFA)'), 'Should show MFA sitelink');
assert(cyberTipsHtml.includes('gsitelinks-grid'), 'Should render sitelinks grid for cyber tips');
assert(cyberTipsHtml.includes('People also ask'), 'Should display People Also Ask section');
assert(cyberTipsHtml.includes('How can you tell if a message or email is a scam before clicking?'), 'Should include scam detection question');
console.log('✓ "cyber tips" search displays curated cyber hygiene rules, CISA 4 easy ways, FTC guide, sitelinks, and PAA accordion.');

// 3. Test variations: "cybertips", "cyber security tips", "safety tips", "cyber hygiene"
console.log('\n--- Test 3: Topic query variations ---');
const variants = ['cybertips', 'cyber security tips', 'safety tips', 'cyber hygiene', 'stay safe online'];
variants.forEach(v => {
  const html = context.renderGoogleResults(v, 'all');
  assert(!html.includes('did not match any documents'), `Should NOT show no-results for variant "${v}"`);
  assert(html.includes('The 4 Foundational Cyber Tips to Stay Safe Online'), `Should render feature snippet for "${v}"`);
  console.log(`✓ Variant "${v}" properly routed to real cyber tips content.`);
});

// 4. Test Images Tab with "cyber tips" and "cyber"
console.log('\n--- Test 4: Images Tab filtering for cyber queries ---');
const cyberTipsImages = context.getFilteredBrowserImages('cyber tips');
assert(cyberTipsImages.length > 0, 'getFilteredBrowserImages("cyber tips") should return images');
console.log(`✓ getFilteredBrowserImages("cyber tips") returned ${cyberTipsImages.length} infographics.`);

const cyberImagesHtml = context.renderGoogleResults('cyber tips', 'images');
assert(cyberImagesHtml.includes('gimages-grid'), 'Images tab should render images grid');
assert(cyberImagesHtml.includes('All Cyber Tips'), 'Images tab should show "All Cyber Tips" chip');
assert(cyberImagesHtml.includes('Protection &amp; Hygiene'), 'Images tab should show "Protection & Hygiene" chip');
assert(cyberImagesHtml.includes('Showing ' + cyberTipsImages.length + ' visual cyber intelligence results'), 'Stats text should show visual count');
console.log('✓ Images Tab for "cyber tips" displays cyber threat infographics and specialized filter chips.');

// 5. Test Regression: "phishing" query
console.log('\n--- Test 5: Regression Check — "phishing" ---');
const phishHtml = context.renderGoogleResults('phishing', 'all');
assert(!phishHtml.includes('did not match any documents'), 'Phishing should show results');
assert(phishHtml.includes('The 4 Core Red Flags of Phishing Attacks'), 'Phishing should show red flags snippet');
assert(phishHtml.includes('Recognize and Report Phishing'), 'Phishing should show CISA phishing link');
console.log('✓ Phishing search results preserved with 0 regressions.');

// 6. Test Regression: "malware" query
console.log('\n--- Test 6: Regression Check — "malware" ---');
const malwareHtml = context.renderGoogleResults('malware', 'all');
assert(!malwareHtml.includes('did not match any documents'), 'Malware should show results');
assert(malwareHtml.includes('Malware Classifications &amp; Infection Vectors'), 'Malware should show malware snippet');
console.log('✓ Malware search results preserved with 0 regressions.');

// 7. Test Unknown query fallback with "Cyber Tips" suggestion button
console.log('\n--- Test 7: Unknown query fallback ---');
const unknownHtml = context.renderGoogleResults('xyzunknownquery987', 'all');
assert(unknownHtml.includes('did not match any documents'), 'Unknown query should show no-result page');
assert(unknownHtml.includes('🛡️ Cyber Tips'), 'No-result page should feature Cyber Tips suggestion button');
console.log('✓ Unknown queries correctly show suggestions including the new "🛡️ Cyber Tips" shortcut.');

console.log('\n=== ALL BROWSER CYBER SEARCH TESTS PASSED SUCCESSFULLY! ===\n');
