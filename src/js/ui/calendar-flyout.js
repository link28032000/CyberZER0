'use strict';

// ═══════════════════════════════════════════════════════════
// CALENDAR & NOTIFICATIONS FLYOUT CONTROLS
// ═══════════════════════════════════════════════════════════

let calCurrentDate = new Date();
let calSelectedDay = calCurrentDate.getDate();

function toggleCalendarFlyout(event) {
  if (event) event.stopPropagation();
  if (typeof AudioManager !== 'undefined') AudioManager.unlock();
  const flyout = document.getElementById('desktop-calendar-flyout');
  const clockBtn = document.getElementById('taskbar-clock-btn');
  if (!flyout) return;

  const isHidden = flyout.classList.contains('hidden');
  if (isHidden) {
    closeVolumeFlyout();
    closeNetworkFlyout();
    const startMenu = document.getElementById('desktop-start-menu');
    if (startMenu && !startMenu.classList.contains('hidden')) toggleStartMenu();

    flyout.classList.remove('hidden');
    if (clockBtn) clockBtn.classList.add('active');
    updateClock();
    renderCalendar(calCurrentDate.getFullYear(), calCurrentDate.getMonth());
    renderSimulationNotifications();
    if (typeof AudioManager !== 'undefined') AudioManager.playMouseClick();
  } else {
    closeCalendarFlyout();
  }
}

function closeCalendarFlyout(event) {
  if (event) event.stopPropagation();
  const flyout = document.getElementById('desktop-calendar-flyout');
  const clockBtn = document.getElementById('taskbar-clock-btn');
  if (flyout) flyout.classList.add('hidden');
  if (clockBtn) clockBtn.classList.remove('active');
}

function renderCalendar(year, month) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const titleEl = document.getElementById('cal-nav-month-year');
  if (titleEl) titleEl.textContent = `${monthNames[month]} ${year}`;

  const gridEl = document.getElementById('cal-grid');
  if (!gridEl) return;
  gridEl.innerHTML = '';

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const realToday = new Date();
  const isCurrentMonth = (realToday.getFullYear() === year && realToday.getMonth() === month);

  // Previous month padding days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const dayEl = document.createElement('div');
    dayEl.className = 'cal-day other-month';
    dayEl.textContent = dayNum;
    gridEl.appendChild(dayEl);
  }

  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dayEl = document.createElement('div');
    dayEl.className = 'cal-day';
    if (isCurrentMonth && d === realToday.getDate()) {
      dayEl.classList.add('today');
    } else if (d === calSelectedDay) {
      dayEl.classList.add('selected');
    }
    dayEl.textContent = d;
    dayEl.onclick = () => {
      calSelectedDay = d;
      renderCalendar(year, month);
      if (typeof AudioManager !== 'undefined') AudioManager.playSliderTick();
    };
    gridEl.appendChild(dayEl);
  }

  // Next month padding days to fill full week rows
  const totalSlots = firstDayIndex + daysInMonth;
  const remaining = (7 - (totalSlots % 7)) % 7;
  for (let n = 1; n <= remaining; n++) {
    const dayEl = document.createElement('div');
    dayEl.className = 'cal-day other-month';
    dayEl.textContent = n;
    gridEl.appendChild(dayEl);
  }
}

function navCalendar(delta) {
  calCurrentDate.setMonth(calCurrentDate.getMonth() + delta);
  renderCalendar(calCurrentDate.getFullYear(), calCurrentDate.getMonth());
  if (typeof AudioManager !== 'undefined') AudioManager.playSliderTick();
}

function resetCalendarToToday() {
  calCurrentDate = new Date();
  calSelectedDay = calCurrentDate.getDate();
  renderCalendar(calCurrentDate.getFullYear(), calCurrentDate.getMonth());
  if (typeof AudioManager !== 'undefined') AudioManager.playMouseClick();
  showToast('📅 Jumped to today\'s date.', 'info');
}
