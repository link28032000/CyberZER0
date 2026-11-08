'use strict';

/**
 * Steam PC Game Store & Client Simulation
 * Real PC games store layout, interactive library, live search & GTA VI cybersecurity tie-in
 */

const STEAM_STORE_GAMES = [
  {
    id: 'gta6',
    title: 'Grand Theft Auto VI',
    dev: 'Rockstar Games',
    pub: 'Rockstar Games',
    release: 'Coming Soon',
    tags: ['Action', 'Open World', 'Crime', 'Multiplayer'],
    category: ['upcoming', 'top_sellers', 'action'],
    price: null,
    discount: null,
    review: 'Most Anticipated PC Title',
    isGta6: true,
    banner: 'OFFICIAL STORE PAGE',
    bg: 'linear-gradient(135deg, #2b0938 0%, #ff007f 40%, #00f0ff 100%)',
    capsule: 'assets/icons/Chapter 2 new apps/GTA6.svg',
    desc: 'Grand Theft Auto VI heads to the state of Leonida, home to the neon-soaked streets of Vice City and beyond in the biggest, most immersive evolution of the Grand Theft Auto series yet.',
    thumbs: [
      'linear-gradient(135deg, #1b0a2a, #d946ef)',
      'linear-gradient(135deg, #0f172a, #06b6d4)',
      'linear-gradient(135deg, #3b0764, #f43f5e)',
      'linear-gradient(135deg, #1e1b4b, #8b5cf6)'
    ]
  },
  {
    id: 'cyberpunk2077',
    title: 'Cyberpunk 2077: Phantom Liberty',
    dev: 'CD PROJEKT RED',
    pub: 'CD PROJEKT RED',
    release: 'Available Now',
    tags: ['RPG', 'Open World', 'Cyberpunk', 'Sci-Fi'],
    category: ['specials', 'top_sellers', 'rpg', 'action'],
    price: '$29.99',
    origPrice: '$59.99',
    discount: '-50%',
    review: 'Very Positive (680,420)',
    banner: 'MIDWEEK MADNESS',
    bg: 'linear-gradient(135deg, #fee715 0%, #101820 60%, #004b6e 100%)',
    capsule: 'linear-gradient(135deg, #facc15, #0284c7)',
    desc: 'Phantom Liberty is a spy-thriller adventure for the open-world action-adventure RPG Cyberpunk 2077. As cyber-enhanced mercenary V, join secret agent Solomon Reed to unravel a web of shattered loyalties.',
    thumbs: [
      'linear-gradient(135deg, #eab308, #0f172a)',
      'linear-gradient(135deg, #0284c7, #1e293b)',
      'linear-gradient(135deg, #ef4444, #09090b)',
      'linear-gradient(135deg, #8b5cf6, #18181b)'
    ]
  },
  {
    id: 'cs2',
    title: 'Counter-Strike 2',
    dev: 'Valve',
    pub: 'Valve',
    release: 'Available Now',
    tags: ['FPS', 'Shooter', 'Competitive', 'Multiplayer'],
    category: ['top_sellers', 'new', 'action'],
    price: 'Free to Play',
    discount: null,
    review: 'Very Positive (7,890,100)',
    banner: 'PLAY FOR FREE',
    bg: 'linear-gradient(135deg, #de6b08 0%, #1e232d 50%, #0c1015 100%)',
    capsule: 'linear-gradient(135deg, #ea580c, #1e293b)',
    desc: 'For over two decades, Counter-Strike has offered an elite competitive experience. Now the next chapter arrives with Counter-Strike 2, building on the Source 2 engine with overhauled sub-tick responsive gameplay.',
    thumbs: [
      'linear-gradient(135deg, #f97316, #111827)',
      'linear-gradient(135deg, #3b82f6, #1e1b4b)',
      'linear-gradient(135deg, #10b981, #064e3b)',
      'linear-gradient(135deg, #64748b, #0f172a)'
    ]
  },
  {
    id: 'eldenring',
    title: 'ELDEN RING: Shadow of the Erdtree',
    dev: 'FromSoftware Inc.',
    pub: 'Bandai Namco Entertainment',
    release: 'Available Now',
    tags: ['Souls-like', 'Dark Fantasy', 'RPG', 'Open World'],
    category: ['top_sellers', 'rpg', 'action'],
    price: '$39.59',
    origPrice: '$59.99',
    discount: '-34%',
    review: 'Overwhelmingly Positive (754,120)',
    banner: 'FEATURED SPOTLIGHT',
    bg: 'linear-gradient(135deg, #854d0e 0%, #1c1917 50%, #0a0a0a 100%)',
    capsule: 'linear-gradient(135deg, #ca8a04, #1c1917)',
    desc: 'Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between. Traverse breathtaking vistas and perilous dungeons.',
    thumbs: [
      'linear-gradient(135deg, #a16207, #09090b)',
      'linear-gradient(135deg, #451a03, #18181b)',
      'linear-gradient(135deg, #713f12, #020617)',
      'linear-gradient(135deg, #ca8a04, #172554)'
    ]
  },
  {
    id: 'bg3',
    title: 'Baldur\'s Gate 3',
    dev: 'Larian Studios',
    pub: 'Larian Studios',
    release: 'Available Now',
    tags: ['RPG', 'Choices Matter', 'Story Rich', 'Turn-Based'],
    category: ['top_sellers', 'rpg'],
    price: '$59.99',
    discount: null,
    review: 'Overwhelmingly Positive (582,300)',
    banner: 'GAME OF THE YEAR',
    bg: 'linear-gradient(135deg, #831843 0%, #1e1b4b 60%, #030712 100%)',
    capsule: 'linear-gradient(135deg, #9d174d, #1e1b4b)',
    desc: 'Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival, and the lure of absolute power. Choose from 12 classes and 11 races.',
    thumbs: [
      'linear-gradient(135deg, #be185d, #111827)',
      'linear-gradient(135deg, #6366f1, #0f172a)',
      'linear-gradient(135deg, #dc2626, #18181b)',
      'linear-gradient(135deg, #4f46e5, #020617)'
    ]
  },
  {
    id: 'gtav',
    title: 'Grand Theft Auto V: Premium Edition',
    dev: 'Rockstar Games',
    pub: 'Rockstar Games',
    release: 'Available Now',
    tags: ['Open World', 'Action', 'Multiplayer', 'Crime'],
    category: ['top_sellers', 'specials', 'action'],
    price: '$14.99',
    origPrice: '$39.99',
    discount: '-63%',
    review: 'Very Positive (1,580,000)',
    banner: 'WEEKEND DEAL',
    bg: 'linear-gradient(135deg, #15803d 0%, #1e293b 60%, #052e16 100%)',
    capsule: 'linear-gradient(135deg, #16a34a, #0f172a)',
    desc: 'When a young street hustler, a retired bank robber and a terrifying psychopath find themselves entangled with some of the most frightening and deranged elements of the criminal underworld.',
    thumbs: [
      'linear-gradient(135deg, #22c55e, #0f172a)',
      'linear-gradient(135deg, #0284c7, #111827)',
      'linear-gradient(135deg, #eab308, #18181b)',
      'linear-gradient(135deg, #dc2626, #09090b)'
    ]
  }
];

const STEAM_OFFERS = [
  { id: 'rdr2', title: 'Red Dead Redemption 2', discount: '-67%', orig: '$59.99', price: '$19.79', bg: 'linear-gradient(135deg, #b91c1c, #450a0a)', deal: 'WEEKEND DEAL' },
  { id: 'forza5', title: 'Forza Horizon 5', discount: '-50%', orig: '$59.99', price: '$29.99', bg: 'linear-gradient(135deg, #d97706, #1e293b)', deal: 'MIDWEEK MADNESS' },
  { id: 're4', title: 'Resident Evil 4 Remake', discount: '-50%', orig: '$39.99', price: '$19.99', bg: 'linear-gradient(135deg, #475569, #090d16)', deal: 'WEEKEND DEAL' },
  { id: 'mhw', title: 'Monster Hunter: World', discount: '-67%', orig: '$29.99', price: '$9.89', bg: 'linear-gradient(135deg, #0284c7, #0c4a6e)', deal: 'DAILY DEAL' }
];

const STEAM_LIBRARY_GAMES = [
  { id: 'cs2', title: 'Counter-Strike 2', status: 'Ready to Play', hours: '428.5 hrs', lastPlayed: 'Yesterday', achievements: '48 / 60', bg: 'linear-gradient(135deg, #ea580c, #111827)' },
  { id: 'gtav', title: 'Grand Theft Auto V', status: 'Ready to Play', hours: '290.2 hrs', lastPlayed: '3 days ago', achievements: '55 / 77', bg: 'linear-gradient(135deg, #16a34a, #0f172a)' },
  { id: 'apex', title: 'Apex Legends', status: 'Ready to Play', hours: '185.0 hrs', lastPlayed: 'Last week', achievements: '12 / 12', bg: 'linear-gradient(135deg, #dc2626, #18181b)' },
  { id: 'cyberpunk', title: 'Cyberpunk 2077', status: 'Ready to Play', hours: '94.6 hrs', lastPlayed: '2 weeks ago', achievements: '32 / 44', bg: 'linear-gradient(135deg, #facc15, #0284c7)' },
  { id: 'tf2', title: 'Team Fortress 2', status: 'Ready to Play', hours: '110.1 hrs', lastPlayed: 'Last month', achievements: '140 / 520', bg: 'linear-gradient(135deg, #ca8a04, #451a03)' }
];

// ── Steam State Tracker ──────────────────────────────────────────
let _steamCurrentHeroIndex = 0;
let _steamCart = [];
let _steamWishlist = new Set();
let _steamActiveTab = 'store';
let _steamActiveSubtab = 'top_sellers';
let _steamActiveCatFilter = 'all';
let _steamSelectedLibGame = 'cs2';
let _steamSearchQuery = '';
let _steamCarouselTimer = null;

/** Master Initialization when Steam is opened */
function initSteamApp() {
  renderSteamStore();
  renderSteamLibrary();
  renderSteamCommunity();
  renderSteamProfile();
  startSteamCarousel();
}

/** Renders the Storefront */
function renderSteamStore() {
  const container = document.getElementById('steam-page-store');
  if (!container) return;

  const heroGame = STEAM_STORE_GAMES[_steamCurrentHeroIndex] || STEAM_STORE_GAMES[0];
  const isWishlisted = _steamWishlist.has(heroGame.id);

  // Filter games based on search query and category
  let listGames = STEAM_STORE_GAMES;
  if (_steamSearchQuery) {
    const q = _steamSearchQuery.toLowerCase();
    listGames = listGames.filter(g =>
      g.title.toLowerCase().includes(q) ||
      g.tags.some(t => t.toLowerCase().includes(q)) ||
      g.dev.toLowerCase().includes(q)
    );
  } else if (_steamActiveCatFilter !== 'all') {
    listGames = listGames.filter(g => g.category.includes(_steamActiveCatFilter));
  } else if (_steamActiveSubtab) {
    listGames = listGames.filter(g => g.category.includes(_steamActiveSubtab));
  }

  container.innerHTML = `
    <!-- ── FEATURED & RECOMMENDED SPOTLIGHT ── -->
    <div class="steam-hero-section">
      <div class="steam-section-title">
        <span>Featured &amp; Recommended</span>
        <div style="display:flex; gap:6px;">
          <button type="button" class="steam-arrow-btn" onclick="steamCycleHero(-1)" title="Previous">◀</button>
          <button type="button" class="steam-arrow-btn" onclick="steamCycleHero(1)" title="Next">▶</button>
        </div>
      </div>

      <div class="steam-carousel-wrapper">
        <div class="steam-hero-main" style="background: ${heroGame.bg};">
          <div class="steam-hero-content">
            <span class="steam-hero-badge ${heroGame.isGta6 ? 'warn' : ''}">${heroGame.banner || 'FEATURED'}</span>
            <div class="steam-hero-title">${heroGame.title}</div>
            <div class="steam-hero-desc">${heroGame.desc}</div>
          </div>
        </div>

        <div class="steam-hero-sidebar">
          <div>
            <div style="font-size:14px; font-weight:700; color:#ffffff; margin-bottom:10px;">${heroGame.title}</div>
            <div class="steam-hero-thumbs">
              ${heroGame.thumbs.map((thumbBg, idx) => `
                <div class="steam-hero-thumb" style="background:${thumbBg};" onclick="steamSetHero(${idx})" title="Preview screenshot ${idx + 1}"></div>
              `).join('')}
            </div>
            <div class="steam-tags-row">
              ${heroGame.tags.map(t => `<span class="steam-tag">${t}</span>`).join('')}
            </div>
            <div class="steam-review-summary">
              Overall Reviews: <span class="steam-review-score">${heroGame.review}</span>
            </div>
          </div>

          <div class="steam-hero-bottom">
            <div class="steam-price-box">
              ${heroGame.discount ? `<span class="steam-discount-pill">${heroGame.discount}</span>` : ''}
              <div class="steam-price-nums">
                ${heroGame.origPrice ? `<span class="steam-original-price">${heroGame.origPrice}</span>` : ''}
                <span class="steam-final-price ${heroGame.price === 'Free to Play' ? 'free' : ''}">${heroGame.price || 'Free to Play'}</span>
              </div>
            </div>

            <div style="display:flex; gap:8px;">
              ${heroGame.isGta6 ? `
                <button type="button" class="steam-action-btn ${isWishlisted ? 'wishlisted' : ''}" onclick="steamToggleWishlist('${heroGame.id}')">
                  ${isWishlisted ? '✓ On Wishlist' : '+ Add to Wishlist'}
                </button>
              ` : `
                <button type="button" class="steam-action-btn" onclick="steamAddToCart('${heroGame.id}')">
                  ${heroGame.price === 'Free to Play' ? 'Play Game' : 'Add to Cart'}
                </button>
              `}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── GTA VI SECURITY ADVISORY (CRUCIAL CHAPTER 2 TIE-IN) ── -->
    <div class="steam-security-advisory">
      <div class="steam-advisory-icon">🛡️</div>
      <div class="steam-advisory-text">
        <div class="steam-advisory-title">Official Steam &amp; Rockstar Games Security Notice</div>
        <div class="steam-advisory-body">
          <strong>Grand Theft Auto VI has NOT released for PC yet.</strong> Attackers frequently prey on anticipation by advertising fake "early leak installers", cracked game torrents, and mod executables. As explored with Ryan in Chapter 2, these files contain dangerous <strong>Trojan Horses, Worms, and Spyware</strong>.<br><br>
          🛡️ <strong>How to Prevent:</strong> Never download unverified or cracked game files from third-party sites, and always keep your antivirus active.<br>
          🎮 <strong>Support Game Developers:</strong> If you want a game, always download it through official websites or verified platforms like Steam. Legitimate purchases ensure your computer remains safe and directly support the hard-working developers who create the games you love!
        </div>
      </div>
    </div>

    <!-- ── SPECIAL OFFERS SECTION ── -->
    <div class="steam-section-title">
      <span>Special Offers &amp; Midweek Sales</span>
    </div>
    <div class="steam-offers-grid">
      ${STEAM_OFFERS.map(o => `
        <div class="steam-offer-card" onclick="steamViewOffer('${o.id}')">
          <div class="steam-offer-img" style="background:${o.bg};">
            <span class="steam-offer-banner">${o.deal}</span>
          </div>
          <div class="steam-offer-body">
            <div class="steam-offer-title">${o.title}</div>
            <div class="steam-offer-meta">Windows · Controller Support</div>
            <div class="steam-price-box">
              <span class="steam-discount-pill">${o.discount}</span>
              <div class="steam-price-nums">
                <span class="steam-original-price">${o.orig}</span>
                <span class="steam-final-price">${o.price}</span>
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- ── CATEGORY PILLS ── -->
    <div class="steam-pills-row">
      ${['all', 'action', 'rpg', 'top_sellers', 'specials', 'upcoming', 'new'].map(cat => `
        <button type="button" class="steam-cat-pill ${_steamActiveCatFilter === cat ? 'active' : ''}" onclick="steamSetCategoryFilter('${cat}')">
          ${cat === 'all' ? 'Browse All' : cat.replace('_', ' ').toUpperCase()}
        </button>
      `).join('')}
    </div>

    <!-- ── STORE TABS: TOP SELLERS / NEW / SPECIALS ── -->
    <div class="steam-tabs-container">
      <div class="steam-subtabs-header">
        <button type="button" class="steam-subtab-btn ${_steamActiveSubtab === 'top_sellers' ? 'active' : ''}" onclick="steamSetSubtab('top_sellers')">Top Sellers</button>
        <button type="button" class="steam-subtab-btn ${_steamActiveSubtab === 'new' ? 'active' : ''}" onclick="steamSetSubtab('new')">New Releases</button>
        <button type="button" class="steam-subtab-btn ${_steamActiveSubtab === 'upcoming' ? 'active' : ''}" onclick="steamSetSubtab('upcoming')">Upcoming Titles</button>
        <button type="button" class="steam-subtab-btn ${_steamActiveSubtab === 'specials' ? 'active' : ''}" onclick="steamSetSubtab('specials')">Specials</button>
      </div>

      <div class="steam-games-list">
        ${listGames.map(g => `
          <div class="steam-game-row" onclick="steamFocusGame('${g.id}')">
            <div class="steam-game-capsule" style="background:${g.bg}; display:flex; align-items:center; justify-content:center; color:#fff; font-size:9px; font-weight:800; text-align:center; padding:2px;">
              ${g.title}
            </div>
            <div class="steam-game-info">
              <div class="steam-game-title">${g.title}</div>
              <div class="steam-game-tags">
                <span class="steam-os-icon">🪟</span>
                <span>${g.tags.slice(0, 3).join(', ')}</span>
              </div>
            </div>
            <div class="steam-game-review">${g.review}</div>
            <div class="steam-game-price-wrap">
              ${g.discount ? `<span class="steam-discount-pill">${g.discount}</span>` : ''}
              <div class="steam-price-nums">
                ${g.origPrice ? `<span class="steam-original-price">${g.origPrice}</span>` : ''}
                <span class="steam-final-price ${g.price === 'Free to Play' ? 'free' : ''}">${g.price || 'Coming Soon'}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/** Renders the Ethan's Steam Library view */
function renderSteamLibrary() {
  const container = document.getElementById('steam-page-library');
  if (!container) return;

  const filteredLibGames = STEAM_LIBRARY_GAMES.filter(g =>
    !_steamLibSearchQuery || g.title.toLowerCase().includes(_steamLibSearchQuery)
  );
  const activeGame = STEAM_LIBRARY_GAMES.find(g => g.id === _steamSelectedLibGame) || filteredLibGames[0] || STEAM_LIBRARY_GAMES[0];

  container.innerHTML = `
    <div class="steam-library-layout">
      <!-- Left sidebar -->
      <div class="steam-lib-sidebar">
        <div class="steam-lib-search">
          <input type="text" placeholder="Search your library..." value="${_steamLibSearchQuery}" oninput="steamFilterLibrary(this.value)">
        </div>
        <div class="steam-lib-list">
          <div class="steam-lib-group-title">INSTALLED (${filteredLibGames.length})</div>
          ${filteredLibGames.map(g => `
            <div class="steam-lib-item ${g.id === activeGame.id ? 'active' : ''}" onclick="steamSelectLibGame('${g.id}')">
              <span style="font-size:12px;">🎮</span>
              <span>${g.title}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Right main display -->
      <div class="steam-lib-main">
        <div class="steam-lib-hero" style="background:${activeGame.bg};">
          <div class="steam-lib-hero-content">
            <div>
              <div class="steam-lib-title">${activeGame.title}</div>
              <div style="font-size:12px; color:#66c0f4; font-weight:600;">STATUS: ${activeGame.status}</div>
            </div>
            <button type="button" class="steam-lib-play-btn green" onclick="steamPlayGame('${activeGame.title}')">
              ▶ PLAY
            </button>
          </div>
        </div>

        <div class="steam-lib-stats-bar">
          <div class="steam-stat-block">
            <span class="steam-stat-label">LAST PLAYED</span>
            <span class="steam-stat-value">${activeGame.lastPlayed}</span>
          </div>
          <div class="steam-stat-block">
            <span class="steam-stat-label">PLAY TIME</span>
            <span class="steam-stat-value">${activeGame.hours}</span>
          </div>
          <div class="steam-stat-block">
            <span class="steam-stat-label">ACHIEVEMENTS</span>
            <span class="steam-stat-value">${activeGame.achievements}</span>
          </div>
          <div class="steam-stat-block">
            <span class="steam-stat-label">CLOUD STATUS</span>
            <span class="steam-stat-value" style="color:#66c0f4;">✓ Up to date</span>
          </div>
        </div>

        <div style="padding:24px 30px;">
          <div class="steam-section-title"><span>Recent Activity &amp; Community Updates</span></div>
          <div style="background:#131c26; border-radius:6px; padding:18px; border:1px solid rgba(255,255,255,0.06);">
            <div style="font-size:13.5px; font-weight:700; color:#fff; margin-bottom:6px;">Season 2 Major Content Update is Live!</div>
            <div style="font-size:12px; color:#8f98a0; line-height:1.5;">
              Featuring improved match stability, upgraded anticheat protocols, community map rotations, and official performance enhancements for high-refresh gaming displays.
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/** Renders Community Hub */
function renderSteamCommunity() {
  const container = document.getElementById('steam-page-community');
  if (!container) return;

  container.innerHTML = `
    <div style="max-width:860px; margin:0 auto;">
      <div class="steam-section-title"><span>Steam Community Hub</span></div>
      <div style="background:#131d27; border-radius:8px; padding:24px; border:1px solid rgba(255,255,255,0.08); margin-bottom:20px;">
        <div style="font-size:18px; font-weight:800; color:#fff; margin-bottom:10px;">Community Activity &amp; Discussions</div>
        <div style="font-size:12.5px; color:#8f98a0; line-height:1.6; margin-bottom:18px;">
          Connect with millions of players worldwide. Share screenshots, write guides, trade inventory items, and participate in official game forums.
        </div>
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px;">
          <div style="background:#0b1118; padding:14px; border-radius:6px; border:1px solid rgba(255,255,255,0.05);">
            <div style="font-size:13px; font-weight:700; color:#66c0f4; margin-bottom:4px;">Steam Workshop</div>
            <div style="font-size:11px; color:#8f98a0;">Browse 1.2M+ verified mods and custom maps.</div>
          </div>
          <div style="background:#0b1118; padding:14px; border-radius:6px; border:1px solid rgba(255,255,255,0.05);">
            <div style="font-size:13px; font-weight:700; color:#66c0f4; margin-bottom:4px;">Community Market</div>
            <div style="font-size:11px; color:#8f98a0;">Buy and sell digital items safely with Steam Wallet.</div>
          </div>
          <div style="background:#0b1118; padding:14px; border-radius:6px; border:1px solid rgba(255,255,255,0.05);">
            <div style="font-size:13px; font-weight:700; color:#66c0f4; margin-bottom:4px;">Discussions &amp; Guides</div>
            <div style="font-size:11px; color:#8f98a0;">Tips, walkthroughs, and verified game tutorials.</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/** Renders Ethan's Profile */
function renderSteamProfile() {
  const container = document.getElementById('steam-page-profile');
  if (!container) return;

  container.innerHTML = `
    <div style="max-width:860px; margin:0 auto;">
      <div style="background:linear-gradient(135deg, #1b2838 0%, #10161f 100%); border-radius:8px; padding:24px; border:1px solid rgba(255,255,255,0.08); display:flex; gap:20px; align-items:center; margin-bottom:20px;">
        <img src="assets/Character/Ethan.png" alt="Ethan" style="width:72px; height:72px; border-radius:8px; border:2px solid #1a9fff; object-fit:cover;">
        <div style="flex:1;">
          <div style="font-size:22px; font-weight:800; color:#fff;">Ethan_Gamer</div>
          <div style="font-size:12px; color:#66c0f4; margin-top:2px;">Workstation Security Enthusiast &amp; Casual Gamer</div>
          <div style="font-size:11px; color:#8f98a0; margin-top:4px;">Currently Online · Member since 2021</div>
        </div>
        <div style="background:#0b1117; padding:12px 18px; border-radius:8px; border:1px solid rgba(255,255,255,0.06); text-align:center;">
          <div style="font-size:10px; color:#8f98a0; font-weight:700;">STEAM LEVEL</div>
          <div style="font-size:22px; font-weight:800; color:#66c0f4;">24</div>
        </div>
      </div>
    </div>
  `;
}

// ── Interactive Controller Functions ─────────────────────────────
function switchSteamMainTab(tab) {
  _steamActiveTab = tab;
  document.querySelectorAll('.steam-tab').forEach(t => t.classList.remove('active'));
  const btn = document.getElementById(`steam-tab-${tab}`);
  if (btn) btn.classList.add('active');

  const subnav = document.getElementById('steam-store-subnav');
  if (subnav) {
    subnav.style.display = (tab === 'store') ? 'flex' : 'none';
  }

  document.querySelectorAll('.steam-page-view').forEach(view => view.classList.remove('active'));
  const activeView = document.getElementById(`steam-page-${tab}`);
  if (activeView) activeView.classList.add('active');

  if (tab === 'store') renderSteamStore();
  else if (tab === 'library') renderSteamLibrary();
  else if (tab === 'community') renderSteamCommunity();
  else if (tab === 'profile') renderSteamProfile();
}

function onSteamSearch(val) {
  _steamSearchQuery = val;
  renderSteamStore();
}

function steamCycleHero(delta) {
  _steamCurrentHeroIndex = (_steamCurrentHeroIndex + delta + STEAM_STORE_GAMES.length) % STEAM_STORE_GAMES.length;
  renderSteamStore();
}

function steamSetHero(idx) {
  _steamCurrentHeroIndex = idx % STEAM_STORE_GAMES.length;
  renderSteamStore();
}

function startSteamCarousel() {
  if (_steamCarouselTimer) clearInterval(_steamCarouselTimer);
  _steamCarouselTimer = setInterval(() => {
    // Only auto-cycle if on store tab and search is empty
    if (_steamActiveTab === 'store' && !_steamSearchQuery) {
      _steamCurrentHeroIndex = (_steamCurrentHeroIndex + 1) % STEAM_STORE_GAMES.length;
      renderSteamStore();
    }
  }, 9000);
}

function steamToggleWishlist(gameId) {
  if (_steamWishlist.has(gameId)) {
    _steamWishlist.delete(gameId);
    if (typeof showToast === 'function') {
      showToast('Removed from your Steam Wishlist.', 'info');
    }
  } else {
    _steamWishlist.add(gameId);
    if (typeof showToast === 'function') {
      showToast('⭐ Added Grand Theft Auto VI to your Steam Wishlist! You will be notified when it officially releases.', 'success');
    }
    if (typeof AudioManager !== 'undefined' && AudioManager.playWindowSound) {
      AudioManager.playWindowSound(true);
    }
  }
  renderSteamStore();
}

function steamAddToCart(gameId) {
  const g = STEAM_STORE_GAMES.find(x => x.id === gameId);
  if (!g) return;

  if (g.price === 'Free to Play') {
    steamPlayGame(g.title);
    return;
  }

  _steamCart.push(g);
  const cartEl = document.getElementById('steam-cart-count');
  if (cartEl) cartEl.textContent = String(_steamCart.length);

  if (typeof showToast === 'function') {
    showToast(`🛒 Added "${g.title}" to your Steam Cart!`, 'success');
  }
  if (typeof AudioManager !== 'undefined' && AudioManager.playWindowSound) {
    AudioManager.playWindowSound(true);
  }
}

function steamViewCart() {
  if (_steamCart.length === 0) {
    if (typeof showToast === 'function') {
      showToast('Your Steam Cart is currently empty.', 'info');
    }
  } else {
    if (typeof showToast === 'function') {
      showToast(`🛒 Steam Cart: ${_steamCart.length} item(s) totaling $${_steamCart.reduce((acc, c) => acc + parseFloat(c.price.replace('$', '')), 0).toFixed(2)}`, 'info');
    }
  }
}

function steamSetCategoryFilter(cat) {
  _steamActiveCatFilter = cat;
  renderSteamStore();
}

function steamFilterCategory(cat) {
  if (cat === 'all') {
    steamSetCategoryFilter('all');
  } else if (cat === 'new') {
    steamSetSubtab('new');
    steamSetCategoryFilter('new');
  } else if (cat === 'categories') {
    steamSetCategoryFilter('all');
    if (typeof showToast === 'function') {
      showToast('Steam Categories: Action, RPG, Open World, Multiplayer, Competitive FPS.', 'info');
    }
  } else if (cat === 'points') {
    if (typeof showToast === 'function') {
      showToast('Steam Points Shop: Customize Ethan’s Steam profile, avatar frames, and animated stickers.', 'info');
    }
  } else if (cat === 'news') {
    if (typeof showToast === 'function') {
      showToast('Steam News: Rockstar Games releases PC security reminder regarding GTA VI releases.', 'info');
    }
  }
}

function steamFocusGame(gameId) {
  const idx = STEAM_STORE_GAMES.findIndex(g => g.id === gameId);
  if (idx !== -1) {
    _steamCurrentHeroIndex = idx;
    renderSteamStore();
    const vp = document.getElementById('steam-viewport');
    if (vp) vp.scrollTo({ top: 0, behavior: 'smooth' });
    const g = STEAM_STORE_GAMES[idx];
    if (g && g.isGta6 && typeof showToast === 'function') {
      showToast('⚠️ Security Notice: GTA VI is NOT on PC yet! Download from Steam or official sites to support developers.', 'warning');
    }
  }
}

let _steamLibSearchQuery = '';
function steamFilterLibrary(query) {
  _steamLibSearchQuery = (query || '').toLowerCase().trim();
  renderSteamLibrary();
}

function steamSetSubtab(subtab) {
  _steamActiveSubtab = subtab;
  renderSteamStore();
}

function steamSelectLibGame(id) {
  _steamSelectedLibGame = id;
  renderSteamLibrary();
}

function steamPlayGame(title) {
  if (typeof showToast === 'function') {
    showToast(`🎮 Launching ${title}... (Running official verified game build)`, 'success');
  }
  if (typeof AudioManager !== 'undefined' && AudioManager.playWindowSound) {
    AudioManager.playWindowSound(true);
  }
}

function toggleSteamFriendsChat() {
  const popout = document.getElementById('steam-friends-popout');
  if (!popout) return;

  const isHidden = popout.classList.contains('hidden');
  if (isHidden) {
    popout.classList.remove('hidden');
    popout.innerHTML = `
      <div class="steam-friends-header">
        <span class="steam-friends-header-title">Friends List</span>
        <button type="button" class="steam-friends-close" onclick="toggleSteamFriendsChat()">✕</button>
      </div>
      <div class="steam-friends-list">
        <div class="steam-friend-card">
          <img src="assets/Character/Ryan.png" alt="Ryan" class="steam-friend-avatar">
          <div class="steam-friend-info">
            <div class="steam-friend-name">Ryan (IT Support Mentor)</div>
            <div class="steam-friend-status">In-Game: Cyber Security Awareness</div>
            <div class="steam-friend-tip">"Stick to official Steam pages, Ethan. Never download pirated exes!"</div>
          </div>
        </div>
      </div>
    `;
  } else {
    popout.classList.add('hidden');
  }
}

function steamNavHistory(delta) {
  if (delta === -1) {
    switchSteamMainTab('store');
  } else {
    switchSteamMainTab('library');
  }
}

function steamAddGameModal() {
  if (typeof showToast === 'function') {
    showToast('Add a Game: Enter an official Steam Product Activation Key.', 'info');
  }
}

function steamViewOffer(id) {
  const offer = STEAM_OFFERS.find(o => o.id === id);
  if (offer && typeof showToast === 'function') {
    showToast(`Steam Deal: ${offer.title} is currently on sale for ${offer.price} (${offer.discount})!`, 'info');
  }
}


// ─────────────────────────────────────────────────────────
//  STEAM MENU BAR — Dropdown system (Steam / View / Friends / Games / Help)
// ─────────────────────────────────────────────────────────

const STEAM_MENUS = {
  steam: [
    { label: 'Settings',         icon: '⚙️',  action: () => steamMenuAction('settings') },
    { label: 'Go Offline...',    icon: '🔌',  action: () => steamMenuAction('offline') },
    { label: 'Change Account',   icon: '👤',  action: () => steamMenuAction('account') },
    { sep: true },
    { label: 'Backup and Restore Games...', icon: '💾', action: () => steamMenuAction('backup') },
    { label: 'Check for Steam Client Updates...', icon: '🔄', action: () => steamMenuAction('update') },
    { sep: true },
    { label: 'Screenshots',      icon: '📷',  action: () => steamMenuAction('screenshots') },
    { sep: true },
    { label: 'Exit',             icon: '🚪',  action: () => { closeSteamMenus(); closeApp('steam'); } }
  ],
  view: [
    { label: 'Large Mode',       icon: '⬜',  action: () => steamMenuAction('large_mode') },
    { label: 'Small Mode',       icon: '◽',  action: () => steamMenuAction('small_mode') },
    { sep: true },
    { label: 'Store',            icon: '🏪',  action: () => { closeSteamMenus(); switchSteamMainTab('store'); } },
    { label: 'Library',         icon: '📚',  action: () => { closeSteamMenus(); switchSteamMainTab('library'); } },
    { label: 'Community',        icon: '🌐',  action: () => { closeSteamMenus(); switchSteamMainTab('community'); } },
    { sep: true },
    { label: 'Downloads',        icon: '📥',  action: () => steamMenuAction('downloads') },
    { label: 'Screenshots',      icon: '📷',  action: () => steamMenuAction('screenshots') },
    { label: 'News',             icon: '📰',  action: () => steamMenuAction('news') },
    { sep: true },
    { label: 'Servers',          icon: '🖥️', action: () => steamMenuAction('servers') },
    { label: 'Broadcasts',       icon: '📡',  action: () => steamMenuAction('broadcasts') },
    { sep: true },
    { label: 'Settings',         icon: '⚙️',  action: () => steamMenuAction('settings') }
  ],
  friends: [
    { label: 'View Friends List', icon: '👥',  action: () => { closeSteamMenus(); toggleSteamFriendsChat(); } },
    { label: 'Add a Friend...',   icon: '➕',  action: () => steamMenuAction('add_friend') },
    { label: 'Find Players...',   icon: '🔍',  action: () => steamMenuAction('find_players') },
    { sep: true },
    { label: 'Invite to Game',    icon: '🎮',  action: () => steamMenuAction('invite_game') },
    { label: 'Join Friend\'s Game', icon: '🕹️', action: () => steamMenuAction('join_game') },
    { sep: true },
    { label: 'Friends Playing (1)', icon: '🟢', action: () => steamMenuAction('friends_playing'), dim: true },
    { sep: true },
    { label: 'Ryan (IT Support)',   icon: '🟢', action: () => { closeSteamMenus(); toggleSteamFriendsChat(); } }
  ],
  games: [
    { label: 'Activate a Product on Steam...', icon: '🔑', action: () => steamAddGameModal() },
    { label: 'Manage Family Sharing...',       icon: '👨‍👩‍👧', action: () => steamMenuAction('family') },
    { sep: true },
    { label: 'Join a Steam Group...',          icon: '🏷️', action: () => steamMenuAction('group') },
    { sep: true },
    { label: 'View Game Details',              icon: '📋',  action: () => steamMenuAction('game_details') },
    { label: 'Add Non-Steam Game...',          icon: '➕',  action: () => steamMenuAction('add_non_steam') },
    { sep: true },
    { label: 'Library',                        icon: '📚',  action: () => { closeSteamMenus(); switchSteamMainTab('library'); } }
  ],
  help: [
    { label: 'Steam Support',       icon: '🆘',  action: () => steamMenuAction('support') },
    { label: 'Steam Community',     icon: '🌐',  action: () => { closeSteamMenus(); switchSteamMainTab('community'); } },
    { sep: true },
    { label: 'Steam Hardware Survey', icon: '🖥️', action: () => steamMenuAction('hardware_survey') },
    { sep: true },
    { label: 'Check for Steam Client Updates...', icon: '🔄', action: () => steamMenuAction('update') },
    { sep: true },
    { label: 'About Steam',         icon: 'ℹ️',  action: () => steamMenuAction('about') },
    { label: 'View Crash Dump...',  icon: '📄',  action: () => steamMenuAction('crash') }
  ]
};

let _steamOpenMenu = null;

function toggleSteamMenu(menuKey, triggerEl) {
  // Close if already open
  if (_steamOpenMenu === menuKey) {
    closeSteamMenus();
    return;
  }
  closeSteamMenus();
  _steamOpenMenu = menuKey;

  const dropdown = document.getElementById('steam-dropdown-' + menuKey);
  if (!dropdown) return;

  // Build menu HTML
  const items = STEAM_MENUS[menuKey] || [];
  dropdown.innerHTML = items.map(item => {
    if (item.sep) return '<div class="steam-dd-sep"></div>';
    return `<div class="steam-dd-item${item.dim ? ' steam-dd-dim' : ''}" onclick="(${item.action.toString()})()">
      <span class="steam-dd-icon">${item.icon}</span>
      <span class="steam-dd-label">${item.label}</span>
    </div>`;
  }).join('');

  // Position dropdown below the trigger
  const bar = document.getElementById('steam-menu-bar');
  const barRect = bar.getBoundingClientRect();
  const trigRect = triggerEl.getBoundingClientRect();
  dropdown.style.left = (trigRect.left - barRect.left) + 'px';
  dropdown.style.top = '100%';
  dropdown.classList.add('open');

  triggerEl.classList.add('active');

  // Close on outside click
  setTimeout(() => {
    document.addEventListener('click', _steamOutsideClick, { once: true });
  }, 0);
}

function _steamOutsideClick(e) {
  if (!e.target.closest('#steam-menu-bar')) {
    closeSteamMenus();
  }
}

function closeSteamMenus() {
  _steamOpenMenu = null;
  document.querySelectorAll('.steam-dropdown').forEach(d => d.classList.remove('open'));
  document.querySelectorAll('.steam-menu-item').forEach(i => i.classList.remove('active'));
}

function steamMenuAction(key) {
  closeSteamMenus();
  const messages = {
    settings:        '⚙️ Steam Settings panel opened.',
    offline:         '🔌 Going offline... All online features will be disabled.',
    account:         '👤 Change Account: Sign out and switch Steam accounts.',
    backup:          '💾 Backup and Restore: Manage local game backups.',
    update:          '🔄 Steam is up to date. No updates available.',
    screenshots:     '📷 Screenshots Library: No screenshots captured yet.',
    large_mode:      '⬜ Switched to Large Mode.',
    small_mode:      '◽ Switched to Small Mode.',
    downloads:       '📥 Downloads: All games are up to date.',
    news:            '📰 Steam News: No new announcements.',
    servers:         '🖥️ Server Browser: No game servers found.',
    broadcasts:      '📡 Broadcasts: No live broadcasts right now.',
    add_friend:      '➕ Add a Friend: Enter their Steam username or email.',
    find_players:    '🔍 Find Players: Search the Steam community.',
    invite_game:     '🎮 Invite to Game: Select a friend to invite.',
    join_game:       '🕹️ Join Friend\'s Game: Ryan is playing Cyber Security Awareness.',
    friends_playing: '🟢 Friends Playing: Ryan is currently in-game.',
    family:          '👨‍👩‍👧 Family Sharing: Manage your shared library.',
    group:           '🏷️ Steam Groups: Browse and join game communities.',
    game_details:    '📋 Select a game in Library to view details.',
    add_non_steam:   '➕ Add Non-Steam Game: Browse your PC for an executable.',
    support:         '🆘 Steam Support: Visit help.steampowered.com for assistance.',
    hardware_survey: '🖥️ Hardware Survey: Anonymous PC spec data collection.',
    about:           'ℹ️ Steam Client v3.0 · Valve Corporation · All rights reserved.',
    crash:           '📄 No crash dumps found. Steam is running normally.'
  };
  const msg = messages[key] || `Steam: ${key}`;
  if (typeof showToast === 'function') showToast(msg, 'info');
}

window.toggleSteamMenu  = toggleSteamMenu;
window.closeSteamMenus  = closeSteamMenus;
window.steamMenuAction  = steamMenuAction;
