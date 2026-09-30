const html = document.documentElement;
const savedTheme = localStorage.getItem('blognest-theme');

if (savedTheme) {
  html.dataset.theme = savedTheme;
}

function getThemeToggles() {
  return document.querySelectorAll('#theme-toggle, #themeToggle, .theme-toggle');
}

function updateThemeIcons() {
  const isLight = html.dataset.theme === 'light';
  const toggles = getThemeToggles();

  toggles.forEach(toggle => {
    toggle.textContent = isLight ? '☀' : '☾';
    toggle.setAttribute(
      'aria-label',
      isLight ? 'Switch to dark mode' : 'Switch to light mode'
    );
    toggle.setAttribute(
      'title',
      isLight ? 'Switch to dark mode' : 'Switch to light mode'
    );
  });
}

function toggleTheme() {
  const currentTheme = html.dataset.theme || 'dark';
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

  html.dataset.theme = nextTheme;
  localStorage.setItem('blognest-theme', nextTheme);
  updateThemeIcons();
}

function initNavigation() {
  const mobileBtn = document.getElementById('mobileMenuBtn') || document.querySelector('.mobile-menu-btn');
  const drawer = document.getElementById('mobileDrawer') || document.querySelector('.mobile-drawer');

  if (mobileBtn && drawer) {
    mobileBtn.onclick = (e) => {
      e.stopPropagation();
      drawer.classList.toggle('open');
      mobileBtn.textContent = drawer.classList.contains('open') ? '✕' : '☰';
    };

    document.addEventListener('click', (e) => {
      if (!drawer.contains(e.target) && e.target !== mobileBtn) {
        drawer.classList.remove('open');
        mobileBtn.textContent = '☰';
      }
    });
  }

  const token = localStorage.getItem('blognest-token');
  if (token) {
    document.querySelectorAll('.nav-login').forEach(el => {
      if (el.textContent.trim().toLowerCase() === 'login') {
        el.href = 'profile.html';
        el.textContent = 'Profile';
      }
    });
    document.querySelectorAll('.nav-join').forEach(el => {
      if (el.textContent.trim().toLowerCase() === 'join') {
        el.href = 'create.html';
        el.textContent = '+ Create';
      }
    });

    const userStr = localStorage.getItem('blognest-user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && (user.role === 'Admin' || user.role === 'Editor')) {
          const isCurrentAdmin = window.location.pathname.endsWith('admin.html');
          document.querySelectorAll('.nav-links, .mobile-drawer').forEach(nav => {
            if (!nav.querySelector('a[href="admin.html"]')) {
              const adminLink = document.createElement('a');
              adminLink.href = 'admin.html';
              adminLink.textContent = 'Admin';
              if (isCurrentAdmin) {
                adminLink.className = 'active';
              }
              nav.appendChild(adminLink);
            }
          });
        }
      } catch (err) {
        console.error('Failed to parse blognest-user:', err);
      }
    }
  }
}

updateThemeIcons();

document.addEventListener('DOMContentLoaded', () => {
  updateThemeIcons();
  const toggles = getThemeToggles();
  toggles.forEach(btn => {
    btn.removeEventListener('click', toggleTheme);
    btn.addEventListener('click', toggleTheme);
  });
  initNavigation();
});

getThemeToggles().forEach(btn => {
  btn.addEventListener('click', toggleTheme);
});
initNavigation();
