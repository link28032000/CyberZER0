'use strict';

// ══════════════════════════════════════════════════════════════════
//  🔍  TASKBAR SEARCH BAR
// ══════════════════════════════════════════════════════════════════

/** Master index: apps only, with real SVG icons */
const TASKBAR_SEARCH_INDEX = [
  { label: 'Zmail',         sub: 'Application', icon: 'assets/icons/apps/mail.svg',            action: () => taskbarClick('gmail')     },
  { label: 'Browser',       sub: 'Application', icon: 'assets/icons/apps/browser.svg',          action: () => taskbarClick('browser')   },
  { label: 'File Explorer', sub: 'Application', icon: 'assets/icons/apps/folder.svg',           action: () => taskbarClick('folder')    },
  { label: 'Antivirus',     sub: 'Application', icon: 'assets/icons/apps/windows_defender.svg', action: () => taskbarClick('antivirus') },
  { label: 'Phone Link',    sub: 'Application', icon: 'assets/icons/apps/Smartphone.svg',       action: () => taskbarClick('comms')     },
  { label: 'Sticky Notes',  sub: 'Application', icon: 'assets/icons/apps/note.svg',             action: () => toggleStickyNote() },
  { label: 'Settings',      sub: 'Network · Wi-Fi', icon: 'assets/icons/apps/settings.svg',         action: () => { if (typeof openApp === 'function') openApp('wifi-settings'); else showToast('Settings is not available yet.', 'info'); } },
];

// ── State ──────────────────────────────────────────────────────
let _tbSearchOpen     = false;
let _tbSearchSelected = -1;        // keyboard highlight index
let _tbSearchFiltered = [];        // current visible results
let _tbBlurTimer      = null;

/** Called on every keystroke in the search input */
function taskbarSearchInput(val) {
  const clearBtn = document.getElementById('taskbar-search-clear');
  if (clearBtn) clearBtn.classList.toggle('visible', val.length > 0);
  _tbSearchSelected = -1;
  _tbSearchRender(val.trim());
}

/** Show results panel (on focus) */
function taskbarSearchFocus() {
  clearTimeout(_tbBlurTimer);
  const input = document.getElementById('taskbar-search-input');
  if (input && input.value.trim()) _tbSearchRender(input.value.trim());
}

/** Hide panel after a short delay (allows click on result) */
function taskbarSearchBlur() {
  _tbBlurTimer = setTimeout(() => _tbSearchClose(), 180);
}

/** Keyboard navigation: ↑ ↓ Enter Escape */
function taskbarSearchKeydown(e) {
  const panel = document.getElementById('taskbar-search-results');
  if (!panel || panel.classList.contains('hidden')) return;

  const items = panel.querySelectorAll('.search-result-item');
  if (!items.length) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    _tbSearchSelected = Math.min(_tbSearchSelected + 1, items.length - 1);
    _tbSearchHighlight(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    _tbSearchSelected = Math.max(_tbSearchSelected - 1, 0);
    _tbSearchHighlight(items);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (_tbSearchSelected >= 0 && _tbSearchSelected < _tbSearchFiltered.length) {
      _tbSearchActivate(_tbSearchSelected);
    } else if (_tbSearchFiltered.length === 1) {
      _tbSearchActivate(0);
    }
  } else if (e.key === 'Escape') {
    _tbSearchClose();
    document.getElementById('taskbar-search-input')?.blur();
  }
}

function _tbSearchHighlight(items) {
  items.forEach((el, i) => el.classList.toggle('keyboard-selected', i === _tbSearchSelected));
  if (_tbSearchSelected >= 0) items[_tbSearchSelected]?.scrollIntoView({ block: 'nearest' });
}

/** Clear button */
function taskbarSearchClear() {
  const input = document.getElementById('taskbar-search-input');
  if (input) { input.value = ''; input.focus(); }
  const clearBtn = document.getElementById('taskbar-search-clear');
  if (clearBtn) clearBtn.classList.remove('visible');
  _tbSearchClose();
}

/** Activate a result by filtered-index */
function _tbSearchActivate(idx) {
  const item = _tbSearchFiltered[idx];
  if (!item) return;
  _tbSearchClose();
  taskbarSearchClear();
  try { item.action(); } catch(err) { console.warn('Search action error', err); }
}

/** Close / hide the panel */
function _tbSearchClose() {
  const panel = document.getElementById('taskbar-search-results');
  if (panel) panel.classList.add('hidden');
  _tbSearchOpen = false;
}

/** Build and render the results dropdown */
function _tbSearchRender(query) {
  const panel = document.getElementById('taskbar-search-results');
  if (!panel) return;

  if (!query) { _tbSearchClose(); return; }

  const q = query.toLowerCase();
  _tbSearchFiltered = TASKBAR_SEARCH_INDEX.filter(item =>
    item.label.toLowerCase().includes(q) ||
    (item.sub && item.sub.toLowerCase().includes(q))
  );

  if (!_tbSearchFiltered.length) {
    panel.innerHTML = `<div class="search-no-results">No results for "<strong>${_htmlEsc(query)}</strong>"</div>`;
    panel.classList.remove('hidden');
    _tbSearchOpen = true;
    return;
  }

  let html = '<div class="search-result-section"><div class="search-result-section-label">Apps</div>';
  _tbSearchFiltered.forEach((item, i) => {
    html += `<div class="search-result-item" role="option"
                  tabindex="-1"
                  onmousedown="event.preventDefault()"
                  onclick="_tbSearchActivate(${i})">
      <div class="search-result-icon"><img src="${_htmlEsc(item.icon)}" alt="${_htmlEsc(item.label)}"></div>
      <div class="search-result-info">
        <div class="search-result-name">${_tbHighlight(item.label, q)}</div>
        <div class="search-result-type">${_htmlEsc(item.sub || '')}</div>
      </div>
    </div>`;
  });
  html += '</div>';

  panel.innerHTML = html;
  panel.classList.remove('hidden');
  _tbSearchOpen = true;
}

/** Wrap matching substring in a highlight span */
function _tbHighlight(text, q) {
  const idx = text.toLowerCase().indexOf(q);
  if (idx < 0) return _htmlEsc(text);
  return _htmlEsc(text.slice(0, idx))
    + `<span style="color:var(--accent-cyan);font-weight:700">${_htmlEsc(text.slice(idx, idx + q.length))}</span>`
    + _htmlEsc(text.slice(idx + q.length));
}

function _htmlEsc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
