/**
 * easyfiscal - Oficjalny Portal Dokumentacji i Podręcznik Wdrożeniowy
 * Skrócona, bezbłędna logika interfejsu (app.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSidebar();
  initScrollSpy();
  initSearch();
  initCopyButtons();
  initChecklist();
});

/* ==========================================================================
   1. Zarządzanie Motywem (Ciemny / Jasny)
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('ef_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('ef_theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIcon');
  if (!icon) return;
  if (theme === 'light') {
    icon.className = 'icon-moon';
    icon.textContent = '🌙';
  } else {
    icon.className = 'icon-sun';
    icon.textContent = '☀️';
  }
}

/* ==========================================================================
   2. Obsługa Paska Bocznego (Mobile & Scroll)
   ========================================================================== */
function initSidebar() {
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const sidebar = document.getElementById('docsSidebar');

  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    const navLinks = sidebar.querySelectorAll('.nav-item a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
          sidebar.classList.remove('open');
        }
      });
    });
  }
}

/* ==========================================================================
   3. ScrollSpy & Pasek Postępu Czytania
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('.doc-section');
  const navLinks = document.querySelectorAll('.nav-item a');
  const progressBar = document.getElementById('readingProgressBar');
  const progressPercentText = document.getElementById('progressPercentText');

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
    const clampedProgress = Math.min(Math.max(Math.round(progress), 0), 100);

    if (progressBar) progressBar.style.width = clampedProgress + '%';
    if (progressPercentText) progressPercentText.textContent = clampedProgress + '%';

    let currentSectionId = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSectionId = sec.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentSectionId) {
          link.classList.add('active');
        }
      });
    }
  });
}

/* ==========================================================================
   4. Wyszukiwarka Dokumentacji (Instant Search)
   ========================================================================== */
function initSearch() {
  const searchInput = document.getElementById('docSearchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const sections = document.querySelectorAll('.doc-section');

    if (!query) {
      sections.forEach(s => s.style.display = '');
      return;
    }

    sections.forEach(sec => {
      const text = sec.textContent.toLowerCase();
      if (text.includes(query)) {
        sec.style.display = '';
      } else {
        sec.style.display = 'none';
      }
    });
  });

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      searchInput.focus();
    }
  });
}

/* ==========================================================================
   5. Kopiowanie Kodu do Schowka
   ========================================================================== */
function initCopyButtons() {
  document.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const pre = btn.closest('.code-block-wrap').querySelector('pre');
      let textToCopy = pre ? pre.innerText : '';

      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          const originalText = btn.innerHTML;
          btn.innerHTML = '<span>✓ Skopiowano!</span>';
          btn.style.borderColor = 'var(--success)';
          btn.style.color = 'var(--success)';
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.borderColor = '';
            btn.style.color = '';
          }, 2000);
        });
      }
    });
  });
}

/* ==========================================================================
   6. Interaktywna Checklista Wdrożeniowa
   ========================================================================== */
function initChecklist() {
  const checkboxes = document.querySelectorAll('.checklist-checkbox');
  const countBadge = document.getElementById('checklistCompletedCount');
  const STORAGE_KEY = 'easyfiscal_checklist_v3';

  function updateBadge(completed, total) {
    if (countBadge) {
      countBadge.textContent = `${completed}/${total}`;
      if (completed === total && total > 0) {
        countBadge.classList.add('completed');
      } else {
        countBadge.classList.remove('completed');
      }
    }
  }

  function saveState() {
    const state = [];
    checkboxes.forEach((cb, index) => {
      state.push({ index, checked: cb.checked });
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.forEach(item => {
          if (checkboxes[item.index]) {
            checkboxes[item.index].checked = item.checked;
            const parent = checkboxes[item.index].closest('.checklist-item');
            if (parent) {
              if (item.checked) parent.classList.add('checked');
              else parent.classList.remove('checked');
            }
          }
        });
      }
    } catch (e) {
      console.warn('Nie udało się wczytać stanu checklisty', e);
    }

    let completed = 0;
    checkboxes.forEach(cb => {
      if (cb.checked) completed++;
    });
    updateBadge(completed, checkboxes.length);
  }

  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const parent = cb.closest('.checklist-item');
      if (parent) {
        if (cb.checked) parent.classList.add('checked');
        else parent.classList.remove('checked');
      }
      saveState();
      let completed = 0;
      checkboxes.forEach(c => {
        if (c.checked) completed++;
      });
      updateBadge(completed, checkboxes.length);
    });
  });

  loadState();
}
