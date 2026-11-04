const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('CyberZER0-main/src/js/apps/browser.js');
let code = fs.readFileSync(targetFile, 'utf8');

// Normalize CRLF to LF for consistent replacement, then we can preserve whatever or keep consistent
const isCRLF = code.includes('\r\n');
const lines = code.split(/\r?\n/);

console.log('Original line count:', lines.length);

// 1. Update isGoogleHome and isGoogleSearch
let p1Found = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const isGoogleHome = url === 'https://www.google.com'")) {
    lines[i] = "  const isGoogleHome = /^https?:\\/\\/(www\\.)?google\\.com\\/?$/i.test(url) || url === '' || url === 'about:blank';";
    if (lines[i+1] && lines[i+1].includes("const isGoogleSearch")) {
      lines[i+1] = "  const isGoogleSearch = /^https?:\\/\\/(www\\.)?google\\.com\\/search/i.test(url);";
    }
    p1Found = true;
    console.log('Part 1 updated at line', i + 1);
    break;
  }
}
if (!p1Found) throw new Error('Part 1 not found');

// 2. Update placeholder in renderGoogleHome
let p2Found = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('id="browser-home-search"') && lines[i].includes('placeholder="Search Google or type a URL')) {
    lines[i] = lines[i].replace(
      'placeholder="Search Google or type a URL (e.g. phishing, malware, cisa.gov)"',
      'placeholder="Search Google or type a URL (e.g. cyber tips, phishing, malware, cisa.gov)"'
    );
    p2Found = true;
    console.log('Part 2 updated at line', i + 1);
    break;
  }
}
if (!p2Found) throw new Error('Part 2 not found');

// 3. Update getFilteredBrowserImages
let p3Found = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("function getFilteredBrowserImages(query)")) {
    if (lines[i+2] && lines[i+2].includes("!qClean || qClean === 'all'")) {
      lines[i+2] = "  if (!qClean || qClean === 'all' || qClean === 'cyber' || qClean === 'cyber tips' || qClean === 'cybertips' || qClean === 'cybersecurity' || qClean === 'security' || qClean === 'safety tips' || qClean === 'online safety') {";
      p3Found = true;
      console.log('Part 3 updated at line', i + 3);
      break;
    }
  }
}
if (!p3Found) throw new Error('Part 3 not found');

// Reassemble code to do broader block replacements in renderGoogleResults
code = lines.join(isCRLF ? '\r\n' : '\n');

// 4. Update Images tab filter chips
const oldImagesChipsBlock = `    const isPhishingQuery = /phish|email|vishing|smishing|quishing|social(\\s+engineering)?|bait|spoof/i.test(cleanQ);
    const isMalwareQuery = /malware|virus|trojan|worm|ransomware|spyware|adware|botnet|rootkit|keylogger|dropper/i.test(cleanQ);

    let chips = [];
    if (isPhishingQuery && !isMalwareQuery) {
      chips = [
        { label: 'All Phishing', q: 'phishing', active: (cleanQ === 'phishing') },
        { label: 'Red Flags', q: 'phishing red flags', active: cleanQ.includes('red flag') },
        { label: 'Social Media', q: 'phishing facebook social media', active: cleanQ.includes('facebook') || cleanQ.includes('social') },
        { label: 'Vishing & Smishing', q: 'vishing smishing phone phishing', active: cleanQ.includes('vishing') || cleanQ.includes('smishing') },
        { label: 'Quishing (QR)', q: 'quishing qr code phishing', active: cleanQ.includes('quishing') || cleanQ.includes('qr') },
        { label: 'Switch to Malware', q: 'malware', active: false }
      ];
    } else if (isMalwareQuery && !isPhishingQuery) {
      chips = [
        { label: 'All Malware', q: 'malware', active: (cleanQ === 'malware') },
        { label: 'Types of Malware', q: 'types of malware classifications', active: cleanQ.includes('types') },
        { label: 'Trojans & Viruses', q: 'malware trojan virus dropper', active: cleanQ.includes('trojan') || cleanQ.includes('virus') },
        { label: 'Infection Signs', q: 'signs of malware infection symptoms', active: cleanQ.includes('signs') || cleanQ.includes('symptoms') },
        { label: 'Prevention & Defense', q: 'malware protection prevention best practices', active: cleanQ.includes('protect') || cleanQ.includes('prevent') },
        { label: 'Switch to Phishing', q: 'phishing', active: false }
      ];
    } else {
      chips = [
        { label: 'All Infographics', q: 'cybersecurity', active: true },
        { label: 'Phishing', q: 'phishing', active: false },
        { label: 'Malware', q: 'malware', active: false },
        { label: 'Red Flags', q: 'red flags phishing', active: false },
        { label: 'Ransomware', q: 'ransomware malware', active: false },
        { label: 'Vishing & Voice', q: 'vishing phone phishing', active: false },
        { label: 'Protection & Defense', q: 'malware protection prevention', active: false }
      ];
    }`;

const newImagesChipsBlock = `    const isPhishingQuery = /phish|email|vishing|smishing|quishing|social(\\s+engineering)?|bait|spoof/i.test(cleanQ);
    const isMalwareQuery = /malware|virus|trojan|worm|ransomware|spyware|adware|botnet|rootkit|keylogger|dropper/i.test(cleanQ);
    const isCyberQuery = /cyber|safety|hygiene|tips?|security/i.test(cleanQ);

    let chips = [];
    if (isPhishingQuery && !isMalwareQuery) {
      chips = [
        { label: 'All Phishing', q: 'phishing', active: (cleanQ === 'phishing') },
        { label: 'Red Flags', q: 'phishing red flags', active: cleanQ.includes('red flag') },
        { label: 'Social Media', q: 'phishing facebook social media', active: cleanQ.includes('facebook') || cleanQ.includes('social') },
        { label: 'Vishing & Smishing', q: 'vishing smishing phone phishing', active: cleanQ.includes('vishing') || cleanQ.includes('smishing') },
        { label: 'Quishing (QR)', q: 'quishing qr code phishing', active: cleanQ.includes('quishing') || cleanQ.includes('qr') },
        { label: 'Switch to Malware', q: 'malware', active: false }
      ];
    } else if (isMalwareQuery && !isPhishingQuery) {
      chips = [
        { label: 'All Malware', q: 'malware', active: (cleanQ === 'malware') },
        { label: 'Types of Malware', q: 'types of malware classifications', active: cleanQ.includes('types') },
        { label: 'Trojans & Viruses', q: 'malware trojan virus dropper', active: cleanQ.includes('trojan') || cleanQ.includes('virus') },
        { label: 'Infection Signs', q: 'signs of malware infection symptoms', active: cleanQ.includes('signs') || cleanQ.includes('symptoms') },
        { label: 'Prevention & Defense', q: 'malware protection prevention best practices', active: cleanQ.includes('protect') || cleanQ.includes('prevent') },
        { label: 'Switch to Phishing', q: 'phishing', active: false }
      ];
    } else if (isCyberQuery) {
      chips = [
        { label: 'All Cyber Tips', q: 'cyber tips', active: cleanQ.includes('tip') },
        { label: 'Phishing Defense', q: 'phishing', active: (cleanQ === 'phishing') },
        { label: 'Malware Types', q: 'malware', active: (cleanQ === 'malware') },
        { label: 'Red Flags', q: 'red flags phishing', active: cleanQ.includes('red flag') },
        { label: 'Ransomware', q: 'ransomware malware', active: cleanQ.includes('ransomware') },
        { label: 'Protection & Hygiene', q: 'cybersecurity protection prevention', active: cleanQ.includes('hygiene') || cleanQ.includes('protect') }
      ];
    } else {
      chips = [
        { label: 'All Infographics', q: 'cybersecurity', active: true },
        { label: 'Phishing', q: 'phishing', active: false },
        { label: 'Malware', q: 'malware', active: false },
        { label: 'Red Flags', q: 'red flags phishing', active: false },
        { label: 'Ransomware', q: 'ransomware malware', active: false },
        { label: 'Vishing & Voice', q: 'vishing phone phishing', active: false },
        { label: 'Protection & Defense', q: 'malware protection prevention', active: false }
      ];
    }`;

// Helper for CRLF/LF safe replace
function safeReplace(src, targetStr, replacementStr) {
  const normTarget = targetStr.replace(/\r?\n/g, '\n');
  const normSrc = src.replace(/\r?\n/g, '\n');
  if (!normSrc.includes(normTarget)) {
    return null;
  }
  const normResult = normSrc.replace(normTarget, replacementStr.replace(/\r?\n/g, '\n'));
  return isCRLF ? normResult.replace(/\n/g, '\r\n') : normResult;
}

const resChips = safeReplace(code, oldImagesChipsBlock, newImagesChipsBlock);
if (!resChips) throw new Error('Part 4 (Chips block) not matched');
code = resChips;
console.log('Part 4 (Chips block) replaced!');

// 5. Update All tab mockResults, snippet, sitelinks, people ask, related searches, and no-result tips
const oldAllTabStart = `  // ──────────────────────────────────────────────────────────
  // 4. "ALL" SEARCH TAB (Comprehensive Search Results)
  // ──────────────────────────────────────────────────────────
  let mockResults = [];
  let isPhishingTopic = /phish|phising|pisihing|email|scam|spoof|social-?engineering|fake login/i.test(qLower);
  let isMalwareTopic = /malware|trojan|virus|spyware|worm|download/i.test(qLower);
  let isRansomwareTopic = /ransomware|encrypt|decrypt|ransom/i.test(qLower);
  let isCyberSecurityTopic = /cybersecurity|cyber security|cyber defense|infosec|security/i.test(qLower);`;

const newAllTabStart = `  // ──────────────────────────────────────────────────────────
  // 4. "ALL" SEARCH TAB (Comprehensive Search Results)
  // ──────────────────────────────────────────────────────────
  let mockResults = [];
  const isCyberTipsTopic = /cyber\\s*tips?|cybertips?|security\\s*tips?|safety\\s*tips?|online\\s*safety|cyber\\s*hygiene|stay\\s*safe\\s*online|cyber\\s*rules?|safe\\s*browsing|protect\\s*(yourself|myself|online)|security\\s*best\\s*practices|cisa\\s*tips?/i.test(qLower);
  const isGeneralCyberTopic = /^cyber$|\\bcyber\\b|cybersecurity|cyber security|cyber defense|infosec|\\bsecurity\\b|cyber\\s*threat|cyber\\s*awareness|cyber\\s*safety/i.test(qLower);
  const isPhishingTopic = /phish|phising|pisihing|email|scam|spoof|social-?engineering|fake login/i.test(qLower);
  const isMalwareTopic = /malware|trojan|virus|spyware|worm|download/i.test(qLower);
  const isRansomwareTopic = /ransomware|encrypt|decrypt|ransom/i.test(qLower);
  const isCyberSecurityTopic = isGeneralCyberTopic || isCyberTipsTopic;`;

const resAllStart = safeReplace(code, oldAllTabStart, newAllTabStart);
if (!resAllStart) throw new Error('Part 5a (All tab start) not matched');
code = resAllStart;
console.log('Part 5a replaced!');

// Now replace the mockResults if-blocks
const oldIfBlocks = `  if (isMalwareTopic) {
    mockResults = [
      {
        url: 'www.cisa.gov › topics › malware-and-ransomware',
        link: 'https://www.cisa.gov/topics/malware',
        title: 'Malware Threat Intelligence & Defense Guide | CISA',
        desc: 'Comprehensive official threat advisory on Trojans, Ransomware, Spyware, Worms, and how adversaries disguise executables (.exe, .scr) as harmless documents.'
      },
      {
        url: 'www.cisa.gov › news-events › news › safe-software-downloads',
        link: 'https://www.cisa.gov/topics/malware#trojans',
        title: 'Trojan Horses: The Danger of "Free Software" Downloads | Cyber Academy',
        desc: 'Learn why downloading free utilities and game tools from online forums leads to Trojan dropper infections and system compromise.'
      },
      {
        url: 'www.consumer.ftc.gov › articles › ransomware-protection',
        link: 'https://www.cisa.gov/topics/malware#ransomware',
        title: 'Ransomware Prevention & Recovery Best Practices | CISA & FTC',
        desc: 'Protecting personal and organizational files from cryptographic ransomware lockouts. Real-world mitigation and cold backup advice.'
      },
      {
        url: 'www.sans.org › resources › glossary › malware',
        link: 'https://www.cisa.gov/topics/malware',
        title: 'Malware Classifications & Threat Categories | SANS Institute',
        desc: 'Authoritative cybersecurity glossary covering all major malware families, attack vectors, and prevention frameworks.'
      }
    ];
  } else if (isPhishingTopic) {
    mockResults = [
      {
        url: 'www.cisa.gov › secure-our-world › recognize-and-report-phishing',
        link: 'https://www.cisa.gov/secure-our-world/recognize-and-report-phishing',
        title: 'Recognize and Report Phishing | CISA (Secure Our World)',
        desc: "Official cyber defense guidance from America's Cyber Defense Agency. Learn how to recognize the 4 red flags of phishing: lookalike domains, artificial urgency, mismatched hyperlinks, and malicious attachments."
      },
      {
        url: 'www.consumer.ftc.gov › articles › how-recognize-phishing',
        link: 'https://www.consumer.ftc.gov/articles/how-recognize-phishing',
        title: 'How to Recognize and Avoid Phishing Scams | Federal Trade Commission',
        desc: 'Learn the 4 tell-tale signs of a phishing email: mismatched sender addresses, artificial urgency, deceptive hyperlinks, and generic greetings.'
      },
      {
        url: 'www.cisa.gov › secure-our-world',
        link: 'https://www.cisa.gov',
        title: 'Secure Our World: 4 Easy Ways to Stay Safe Online | CISA',
        desc: "America's Cyber Defense Agency flagship program: Use strong passwords, enable MFA, recognize & report phishing, and update software."
      },
      {
        url: 'www.ic3.gov › resources › phishing-prevention',
        link: 'https://www.cisa.gov/secure-our-world/recognize-and-report-phishing',
        title: 'Phishing & Email Spoofing Defense | FBI Internet Crime Complaint Center',
        desc: 'Report phishing and email spoofing attacks. FBI guidance on identifying lookalike sender addresses and fake login pages.'
      },
      {
        url: 'en.wikipedia.org › wiki › Phishing',
        link: 'https://en.wikipedia.org/wiki/Phishing',
        title: 'Phishing — Techniques, History and Countermeasures | Wikipedia',
        desc: 'Comprehensive encyclopedia article covering social engineering, typosquatting domains, credential harvesting, and technical email defenses.'
      }
    ];
  } else if (isRansomwareTopic) {
    mockResults = [
      {
        url: 'www.cisa.gov › stopransomware',
        link: 'https://www.cisa.gov/topics/malware#ransomware',
        title: 'Stop Ransomware | CISA',
        desc: 'Official joint advisory on ransomware prevention, detection, and recovery. Includes offline backup strategies and incident response playbooks.'
      },
      {
        url: 'www.consumer.ftc.gov › topics › ransomware-protection',
        link: 'https://www.cisa.gov/topics/malware',
        title: 'Ransomware Protection & Recovery Guide | FTC Consumer Advice',
        desc: 'Step-by-step guidance on protecting files from ransomware encryption and recovering after an attack without paying a ransom.'
      }
    ];
  } else if (isCyberSecurityTopic) {
    mockResults = [
      {
        url: 'www.cisa.gov',
        link: 'https://www.cisa.gov',
        title: 'Cybersecurity & Infrastructure Security Agency (CISA)',
        desc: "America's Cyber Defense Agency — providing resources, advisories, and guidelines to defend national and personal digital infrastructure."
      },
      {
        url: 'www.consumer.ftc.gov › privacy-identity-online-security',
        link: 'https://www.consumer.ftc.gov/articles/how-recognize-phishing',
        title: 'Online Security & Identity Protection Tips | FTC',
        desc: 'Expert advice on cybersecurity hygiene, password safety, phishing awareness, and protecting your digital identity online.'
      },
      {
        url: 'en.wikipedia.org › wiki › Computer_security',
        link: 'https://en.wikipedia.org/wiki/Computer_security',
        title: 'Computer security & Cyber Defense Systems | Wikipedia',
        desc: 'Protection of computer systems and networks from attacks by malicious actors that may result in unauthorized information disclosure.'
      }
    ];
  }`;

const newIfBlocks = `  if (isCyberTipsTopic) {
    mockResults = [
      {
        url: 'www.cisa.gov › secure-our-world › 4-easy-ways-stay-safe-online',
        link: 'https://www.cisa.gov',
        title: 'CISA: 4 Easy Ways to Stay Safe Online | Secure Our World',
        desc: "Official cyber safety guidance from America's Cyber Defense Agency: Use strong passwords and a password manager, turn on Multi-Factor Authentication (MFA), recognize and report phishing, and update your software regularly."
      },
      {
        url: 'www.consumer.ftc.gov › articles › online-security-tips',
        link: 'https://www.consumer.ftc.gov/articles/how-recognize-phishing',
        title: 'Online Security & Identity Protection Tips | Federal Trade Commission',
        desc: 'Learn vital cyber hygiene rules: how to protect personal devices, avoid credential theft, detect spoofed login portals, and safeguard personal information from scam networks.'
      },
      {
        url: 'www.cisa.gov › secure-our-world › recognize-and-report-phishing',
        link: 'https://www.cisa.gov/secure-our-world/recognize-and-report-phishing',
        title: 'Recognize & Report Phishing: The 4 Red Flags | CISA',
        desc: 'Over 90% of cyber breaches start with phishing. Master the key red flags: lookalike typosquatted domains, manufactured urgency, deceptive links, and unexpected attachments.'
      },
      {
        url: 'www.sans.org › cyber-hygiene-best-practices',
        link: 'https://www.cisa.gov/topics/malware',
        title: 'Top 10 Cyber Hygiene Best Practices for Daily Life | SANS Institute',
        desc: 'Practical daily cybersecurity defense checklist: passphrases, MFA verification, automatic software patches, cold backups, and avoiding untrusted free software downloads.'
      },
      {
        url: 'en.wikipedia.org › wiki › Internet_safety',
        link: 'https://en.wikipedia.org/wiki/Computer_security',
        title: 'Internet Safety & Cyber Threat Defense | Wikipedia',
        desc: 'Authoritative encyclopedia article covering digital hygiene, social engineering countermeasures, multi-factor authentication, safe browsing, and data privacy principles.'
      }
    ];
  } else if (isMalwareTopic) {
    mockResults = [
      {
        url: 'www.cisa.gov › topics › malware-and-ransomware',
        link: 'https://www.cisa.gov/topics/malware',
        title: 'Malware Threat Intelligence & Defense Guide | CISA',
        desc: 'Comprehensive official threat advisory on Trojans, Ransomware, Spyware, Worms, and how adversaries disguise executables (.exe, .scr) as harmless documents.'
      },
      {
        url: 'www.cisa.gov › news-events › news › safe-software-downloads',
        link: 'https://www.cisa.gov/topics/malware#trojans',
        title: 'Trojan Horses: The Danger of "Free Software" Downloads | Cyber Academy',
        desc: 'Learn why downloading free utilities and game tools from online forums leads to Trojan dropper infections and system compromise.'
      },
      {
        url: 'www.consumer.ftc.gov › articles › ransomware-protection',
        link: 'https://www.cisa.gov/topics/malware#ransomware',
        title: 'Ransomware Prevention & Recovery Best Practices | CISA & FTC',
        desc: 'Protecting personal and organizational files from cryptographic ransomware lockouts. Real-world mitigation and cold backup advice.'
      },
      {
        url: 'www.sans.org › resources › glossary › malware',
        link: 'https://www.cisa.gov/topics/malware',
        title: 'Malware Classifications & Threat Categories | SANS Institute',
        desc: 'Authoritative cybersecurity glossary covering all major malware families, attack vectors, and prevention frameworks.'
      }
    ];
  } else if (isPhishingTopic) {
    mockResults = [
      {
        url: 'www.cisa.gov › secure-our-world › recognize-and-report-phishing',
        link: 'https://www.cisa.gov/secure-our-world/recognize-and-report-phishing',
        title: 'Recognize and Report Phishing | CISA (Secure Our World)',
        desc: "Official cyber defense guidance from America's Cyber Defense Agency. Learn how to recognize the 4 red flags of phishing: lookalike domains, artificial urgency, mismatched hyperlinks, and malicious attachments."
      },
      {
        url: 'www.consumer.ftc.gov › articles › how-recognize-phishing',
        link: 'https://www.consumer.ftc.gov/articles/how-recognize-phishing',
        title: 'How to Recognize and Avoid Phishing Scams | Federal Trade Commission',
        desc: 'Learn the 4 tell-tale signs of a phishing email: mismatched sender addresses, artificial urgency, deceptive hyperlinks, and generic greetings.'
      },
      {
        url: 'www.cisa.gov › secure-our-world',
        link: 'https://www.cisa.gov',
        title: 'Secure Our World: 4 Easy Ways to Stay Safe Online | CISA',
        desc: "America's Cyber Defense Agency flagship program: Use strong passwords, enable MFA, recognize & report phishing, and update software."
      },
      {
        url: 'www.ic3.gov › resources › phishing-prevention',
        link: 'https://www.cisa.gov/secure-our-world/recognize-and-report-phishing',
        title: 'Phishing & Email Spoofing Defense | FBI Internet Crime Complaint Center',
        desc: 'Report phishing and email spoofing attacks. FBI guidance on identifying lookalike sender addresses and fake login pages.'
      },
      {
        url: 'en.wikipedia.org › wiki › Phishing',
        link: 'https://en.wikipedia.org/wiki/Phishing',
        title: 'Phishing — Techniques, History and Countermeasures | Wikipedia',
        desc: 'Comprehensive encyclopedia article covering social engineering, typosquatting domains, credential harvesting, and technical email defenses.'
      }
    ];
  } else if (isRansomwareTopic) {
    mockResults = [
      {
        url: 'www.cisa.gov › stopransomware',
        link: 'https://www.cisa.gov/topics/malware#ransomware',
        title: 'Stop Ransomware | CISA',
        desc: 'Official joint advisory on ransomware prevention, detection, and recovery. Includes offline backup strategies and incident response playbooks.'
      },
      {
        url: 'www.consumer.ftc.gov › topics › ransomware-protection',
        link: 'https://www.cisa.gov/topics/malware',
        title: 'Ransomware Protection & Recovery Guide | FTC Consumer Advice',
        desc: 'Step-by-step guidance on protecting files from ransomware encryption and recovering after an attack without paying a ransom.'
      }
    ];
  } else if (isGeneralCyberTopic) {
    mockResults = [
      {
        url: 'www.cisa.gov',
        link: 'https://www.cisa.gov',
        title: 'Cybersecurity & Infrastructure Security Agency (CISA) | America\\'s Cyber Defense Agency',
        desc: "Official national cyber defense portal, providing real-time threat advisories, cyber safety guidelines, Shields Up defensive postures, and public awareness campaigns."
      },
      {
        url: 'www.cisa.gov › secure-our-world',
        link: 'https://www.cisa.gov/secure-our-world/recognize-and-report-phishing',
        title: 'Secure Our World: Essential Cyber Safety Habits | CISA',
        desc: 'The national cyber defense education initiative: Master the four basic steps to keep your digital life secure from ransomware, data breaches, and credential theft.'
      },
      {
        url: 'www.consumer.ftc.gov › privacy-identity-online-security',
        link: 'https://www.consumer.ftc.gov/articles/how-recognize-phishing',
        title: 'Online Security, Privacy & Scams Defense | Federal Trade Commission',
        desc: 'Federal Trade Commission guidance on digital identity protection, password management, scam detection, and shielding personal accounts from unauthorized access.'
      },
      {
        url: 'www.sans.org › resources › cyber-defense-fundamentals',
        link: 'https://www.cisa.gov/topics/malware',
        title: 'Cyber Defense Fundamentals & Threat Taxonomy | SANS Institute',
        desc: 'Comprehensive security curriculum covering threat actors, malicious payloads, social engineering vectors, and defensive technical countermeasures.'
      },
      {
        url: 'en.wikipedia.org › wiki › Computer_security',
        link: 'https://en.wikipedia.org/wiki/Computer_security',
        title: 'Computer Security, Cybersecurity & Network Defense | Wikipedia',
        desc: 'Global encyclopedia overview of digital defense: securing computer hardware, software, networks, and personal data from cyber attacks and unauthorized interception.'
      }
    ];
  }`;

const resIfBlocks = safeReplace(code, oldIfBlocks, newIfBlocks);
if (!resIfBlocks) throw new Error('Part 5b (If blocks) not matched');
code = resIfBlocks;
console.log('Part 5b replaced!');

// 6. Update no-result tips
const oldNoResultTips = `<button class="google-btn" onclick="browserGo('https://www.google.com/search?q=phishing')">🎣 Phishing</button>`;
const newNoResultTips = `<button class="google-btn" onclick="browserGo('https://www.google.com/search?q=cyber tips')">🛡️ Cyber Tips</button>
                <button class="google-btn" onclick="browserGo('https://www.google.com/search?q=phishing')">🎣 Phishing</button>`;

const resNoResult = safeReplace(code, oldNoResultTips, newNoResultTips);
if (!resNoResult) throw new Error('Part 6 (No-result tips) not matched');
code = resNoResult;
console.log('Part 6 replaced!');

// 7. Update feature snippet
const oldFeatureSnippet = `  // Feature Snippet / Knowledge Alert
  let featureSnippetHtml = '';
  if (isPhishingTopic) {`;

const newFeatureSnippet = `  // Feature Snippet / Knowledge Alert
  let featureSnippetHtml = '';
  if (isCyberTipsTopic || isGeneralCyberTopic) {
    featureSnippetHtml = \`
      <div class="gfeature-snippet">
        <div class="gfeature-badge"><span>🛡️ Official Cyber Safety Guide</span> • CISA Secure Our World &amp; FTC</div>
        <div class="gfeature-title">The 4 Foundational Cyber Tips to Stay Safe Online</div>
        <p class="gfeature-text">Cyber defense is built on simple everyday habits. Follow these four foundational cybersecurity rules recommended by CISA and security professionals to prevent over 90% of cyber attacks:</p>
        <ul class="gfeature-list">
          <li><strong>1. Turn On Multi-Factor Authentication (MFA):</strong> Enable MFA on every account that supports it. MFA makes your accounts up to 99% less likely to get hacked, even if your password is stolen.</li>
          <li><strong>2. Use Strong, Unique Passwords &amp; Passphrases:</strong> Create passwords with at least 16 characters or a memorable passphrase. Never reuse passwords across school, work, personal email, or banking accounts.</li>
          <li><strong>3. Recognize &amp; Report Phishing:</strong> Think before you click. Check sender email addresses for typosquatting (such as numbers replacing letters), beware of artificial urgency, and hover over hyperlinks to inspect the true web destination.</li>
          <li><strong>4. Update Your Software &amp; Operating System:</strong> Turn on automatic updates for your browser, operating system, and apps to patch security vulnerabilities before cyber attackers can exploit them.</li>
        </ul>
        <button type="button" class="gfeature-btn" onclick="browserGo('https://www.cisa.gov')">Explore Official CISA Cyber Defense Portal ➔</button>
      </div>
    \`;
  } else if (isPhishingTopic) {`;

const resSnippet = safeReplace(code, oldFeatureSnippet, newFeatureSnippet);
if (!resSnippet) throw new Error('Part 7 (Feature snippet) not matched');
code = resSnippet;
console.log('Part 7 replaced!');

// 8. Update sitelinks
const oldSitelinksCondition = `      \${idx === 0 && isPhishingTopic ? \`
        <div class="gsitelinks-grid">`;

const newSitelinksCondition = `      \${idx === 0 && (isCyberTipsTopic || isGeneralCyberTopic) ? \`
        <div class="gsitelinks-grid">
          <div class="gsitelink-card">
            <a href="#" onclick="browserGo('https://www.cisa.gov'); return false;">Enable Multi-Factor Authentication (MFA)</a>
            <p>Why two-step verification stops 99% of automated credential attacks.</p>
          </div>
          <div class="gsitelink-card">
            <a href="#" onclick="browserGo('https://www.cisa.gov/secure-our-world/recognize-and-report-phishing'); return false;">Recognize &amp; Report Phishing</a>
            <p>Spot typosquatted domains, fake alerts, and urgent emotional manipulation.</p>
          </div>
          <div class="gsitelink-card">
            <a href="#" onclick="browserGo('https://www.consumer.ftc.gov/articles/how-recognize-phishing'); return false;">FTC Online Security Guidelines</a>
            <p>Consumer protections against identity theft and fraudulent web portals.</p>
          </div>
          <div class="gsitelink-card">
            <a href="#" onclick="switchGoogleSearchTab('images', '\${escapeHtml(cleanQ)}'); return false;">View Cyber Defense Infographics</a>
            <p>Browse educational charts, red flag checklists, and safety diagrams.</p>
          </div>
        </div>
      \` : (idx === 0 && isPhishingTopic ? \`
        <div class="gsitelinks-grid">`;

const resSitelinks = safeReplace(code, oldSitelinksCondition, newSitelinksCondition);
if (!resSitelinks) throw new Error('Part 8 (Sitelinks) not matched');

// In the closing of sitelinks:
const oldSitelinksEnd = `        </div>
      \` : ''}`;

const newSitelinksEnd = `        </div>
      \` : '')}`;

code = safeReplace(resSitelinks, oldSitelinksEnd, newSitelinksEnd);
if (!code) throw new Error('Part 8b (Sitelinks end) not matched');
console.log('Part 8 replaced!');

// 9. Update People Also Ask
const oldPeopleAsk = `  // People Also Ask Accordion
  const peopleAskHtml = isPhishingTopic ? \`
    <div class="gpeople-ask">
      <div class="gpeople-ask-header">People also ask</div>
      <div class="gask-item">
        <div class="gask-question" onclick="const a=this.nextElementSibling; a.style.display=a.style.display==='none'?'block':'none';">
          <span>How can you tell if an email is a phishing attempt?</span>
          <span>▾</span>
        </div>
        <div class="gask-answer" style="display:none;">
          Check the sender's exact email address (not just display name), look for artificial urgency or threats of account suspension, inspect hyperlink destinations by hovering before clicking, and never download unexpected attachments.
        </div>
      </div>
      <div class="gask-item">
        <div class="gask-question" onclick="const a=this.nextElementSibling; a.style.display=a.style.display==='none'?'block':'none';">
          <span>What is typosquatting and why is it dangerous?</span>
          <span>▾</span>
        </div>
        <div class="gask-answer" style="display:none;">
          Typosquatting is when attackers register lookalike domain names with slight spelling mistakes (e.g., substituting "1" for "l" in <code>paypa1.com</code>). Because the domain looks authentic at a glance, victims unknowingly surrender real credentials on counterfeit login forms.
        </div>
      </div>
      <div class="gask-item">
        <div class="gask-question" onclick="const a=this.nextElementSibling; a.style.display=a.style.display==='none'?'block':'none';">
          <span>What should you do immediately if you entered passwords on a fake website?</span>
          <span>▾</span>
        </div>
        <div class="gask-answer" style="display:none;">
          Immediately change the compromised password from a clean, verified device, notify your organizational IT security department, and enable multi-factor authentication (MFA) on the official account portal.
        </div>
      </div>
    </div>
  \` : '';`;

const newPeopleAsk = `  // People Also Ask Accordion
  let peopleAskHtml = '';
  if (isCyberTipsTopic || isGeneralCyberTopic) {
    peopleAskHtml = \`
    <div class="gpeople-ask">
      <div class="gpeople-ask-header">People also ask</div>
      <div class="gask-item">
        <div class="gask-question" onclick="const a=this.nextElementSibling; a.style.display=a.style.display==='none'?'block':'none';">
          <span>What are the 4 most important cyber safety tips from CISA?</span>
          <span>▾</span>
        </div>
        <div class="gask-answer" style="display:none;">
          CISA's Secure Our World program emphasizes four core daily habits: (1) Use strong, unique passwords with a password manager, (2) Turn on Multi-Factor Authentication (MFA) on all accounts, (3) Recognize and report phishing attempts immediately, and (4) Keep all software, browsers, and devices updated automatically.
        </div>
      </div>
      <div class="gask-item">
        <div class="gask-question" onclick="const a=this.nextElementSibling; a.style.display=a.style.display==='none'?'block':'none';">
          <span>Why is Multi-Factor Authentication (MFA) so effective against hackers?</span>
          <span>▾</span>
        </div>
        <div class="gask-answer" style="display:none;">
          MFA requires two or more verification factors before granting account access, such as your password plus a temporary code from an authenticator app or biometric fingerprint. Even if an attacker steals your password through a fake login page, they cannot access your account without the second factor.
        </div>
      </div>
      <div class="gask-item">
        <div class="gask-question" onclick="const a=this.nextElementSibling; a.style.display=a.style.display==='none'?'block':'none';">
          <span>How can you tell if a message or email is a scam before clicking?</span>
          <span>▾</span>
        </div>
        <div class="gask-answer" style="display:none;">
          Examine the exact sender address (watch out for typosquatting like numbers replacing letters), look for artificial urgency or threats of account lockout, hover over hyperlinks to verify the true web address, and never download unexpected file attachments.
        </div>
      </div>
      <div class="gask-item">
        <div class="gask-question" onclick="const a=this.nextElementSibling; a.style.display=a.style.display==='none'?'block':'none';">
          <span>Is it safe to access personal or work accounts on public Wi-Fi?</span>
          <span>▾</span>
        </div>
        <div class="gask-answer" style="display:none;">
          Public Wi-Fi networks in cafes or airports can expose unencrypted traffic to eavesdropping or rogue hotspots. Avoid accessing sensitive financial or work accounts on public networks without a trusted VPN, and verify that the website shows HTTPS in the browser address bar.
        </div>
      </div>
    </div>
    \`;
  } else if (isPhishingTopic) {
    peopleAskHtml = \`
    <div class="gpeople-ask">
      <div class="gpeople-ask-header">People also ask</div>
      <div class="gask-item">
        <div class="gask-question" onclick="const a=this.nextElementSibling; a.style.display=a.style.display==='none'?'block':'none';">
          <span>How can you tell if an email is a phishing attempt?</span>
          <span>▾</span>
        </div>
        <div class="gask-answer" style="display:none;">
          Check the sender's exact email address (not just display name), look for artificial urgency or threats of account suspension, inspect hyperlink destinations by hovering before clicking, and never download unexpected attachments.
        </div>
      </div>
      <div class="gask-item">
        <div class="gask-question" onclick="const a=this.nextElementSibling; a.style.display=a.style.display==='none'?'block':'none';">
          <span>What is typosquatting and why is it dangerous?</span>
          <span>▾</span>
        </div>
        <div class="gask-answer" style="display:none;">
          Typosquatting is when attackers register lookalike domain names with slight spelling mistakes (e.g., substituting "1" for "l" in <code>paypa1.com</code>). Because the domain looks authentic at a glance, victims unknowingly surrender real credentials on counterfeit login forms.
        </div>
      </div>
      <div class="gask-item">
        <div class="gask-question" onclick="const a=this.nextElementSibling; a.style.display=a.style.display==='none'?'block':'none';">
          <span>What should you do immediately if you entered passwords on a fake website?</span>
          <span>▾</span>
        </div>
        <div class="gask-answer" style="display:none;">
          Immediately change the compromised password from a clean, verified device, notify your organizational IT security department, and enable multi-factor authentication (MFA) on the official account portal.
        </div>
      </div>
    </div>
    \`;
  }`;

const resPeopleAsk = safeReplace(code, oldPeopleAsk, newPeopleAsk);
if (!resPeopleAsk) throw new Error('Part 9 (People Ask) not matched');
code = resPeopleAsk;
console.log('Part 9 replaced!');

// 10. Update Related Searches
const oldRelatedSearches = `  // Related Searches Section
  const relatedSearchesHtml = \`
    <div class="grelated-section">
      <div class="grelated-title">Related searches</div>
      <div class="grelated-grid">
        <div class="grelated-chip" onclick="browserGo('https://www.google.com/search?q=cisa recognize and report phishing')">🔍 cisa recognize and report phishing</div>
        <div class="grelated-chip" onclick="browserGo('https://www.google.com/search?q=typosquatting examples')">🔍 typosquatting domain examples</div>
        <div class="grelated-chip" onclick="browserGo('https://www.google.com/search?q=malware trojan dropper defense')">🔍 malware trojan dropper defense</div>
        <div class="grelated-chip" onclick="switchGoogleSearchTab('images', '\${escapeHtml(cleanQ)}')">🖼️ \${escapeHtml(cleanQ)} diagrams &amp; infographics</div>
        <div class="grelated-chip" onclick="switchGoogleSearchTab('news', 'cybersecurity')">📰 cyber threat news alerts</div>
        <div class="grelated-chip" onclick="switchGoogleSearchTab('videos', '\${escapeHtml(cleanQ)}')">▶️ phishing awareness video briefing</div>
      </div>
    </div>
  \`;`;

const newRelatedSearches = `  // Related Searches Section
  let relatedSearchesHtml = '';
  if (isCyberTipsTopic || isGeneralCyberTopic) {
    relatedSearchesHtml = \`
    <div class="grelated-section">
      <div class="grelated-title">Related searches</div>
      <div class="grelated-grid">
        <div class="grelated-chip" onclick="browserGo('https://www.google.com/search?q=cisa 4 easy ways to stay safe online')">🔍 cisa 4 easy ways to stay safe online</div>
        <div class="grelated-chip" onclick="browserGo('https://www.google.com/search?q=how to enable multi factor authentication mfa')">🔍 how to enable multi factor authentication mfa</div>
        <div class="grelated-chip" onclick="browserGo('https://www.google.com/search?q=phishing red flags checklist')">🔍 phishing red flags checklist</div>
        <div class="grelated-chip" onclick="browserGo('https://www.google.com/search?q=strong password tips and passphrases')">🔍 strong password tips and passphrases</div>
        <div class="grelated-chip" onclick="switchGoogleSearchTab('images', '\${escapeHtml(cleanQ)}')">🖼️ \${escapeHtml(cleanQ)} diagrams &amp; infographics</div>
        <div class="grelated-chip" onclick="switchGoogleSearchTab('news', 'cybersecurity')">📰 latest cisa cyber defense alerts</div>
      </div>
    </div>
    \`;
  } else {
    relatedSearchesHtml = \`
    <div class="grelated-section">
      <div class="grelated-title">Related searches</div>
      <div class="grelated-grid">
        <div class="grelated-chip" onclick="browserGo('https://www.google.com/search?q=cisa recognize and report phishing')">🔍 cisa recognize and report phishing</div>
        <div class="grelated-chip" onclick="browserGo('https://www.google.com/search?q=typosquatting examples')">🔍 typosquatting domain examples</div>
        <div class="grelated-chip" onclick="browserGo('https://www.google.com/search?q=malware trojan dropper defense')">🔍 malware trojan dropper defense</div>
        <div class="grelated-chip" onclick="switchGoogleSearchTab('images', '\${escapeHtml(cleanQ)}')">🖼️ \${escapeHtml(cleanQ)} diagrams &amp; infographics</div>
        <div class="grelated-chip" onclick="switchGoogleSearchTab('news', 'cybersecurity')">📰 cyber threat news alerts</div>
        <div class="grelated-chip" onclick="switchGoogleSearchTab('videos', '\${escapeHtml(cleanQ)}')">▶️ phishing awareness video briefing</div>
      </div>
    </div>
    \`;
  }`;

const resRelatedSearches = safeReplace(code, oldRelatedSearches, newRelatedSearches);
if (!resRelatedSearches) throw new Error('Part 10 (Related searches) not matched');
code = resRelatedSearches;
console.log('Part 10 replaced!');

// Write updated code back
fs.writeFileSync(targetFile, code, 'utf8');
console.log('ALL PARTS SUCCESSFULLY UPDATED IN', targetFile);

