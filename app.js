/**
 * easyfiscal - Oficjalny Portal Dokumentacji i Podręcznik Wdrożeniowy
 * Interaktywna logika aplikacji (app.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSidebar();
  initScrollSpy();
  initSearch();
  initCopyButtons();
  initPrinterTabs();
  initBaseLinkerSimulator();
  initReceiptPersonalizer();
  initChecklist();
  initRoiCalculator();
  initTerminalSimulator();
  initSellasistSimulator();
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

    // Zamknij sidebar po kliknięciu linku na urządzeniu mobilnym
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
    // Oblicz postęp czytania
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
    const clampedProgress = Math.min(Math.max(Math.round(progress), 0), 100);

    if (progressBar) progressBar.style.width = clampedProgress + '%';
    if (progressPercentText) progressPercentText.textContent = clampedProgress + '%';

    // ScrollSpy aktywnych sekcji
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

  // Skrót klawiszowy Ctrl+K / Cmd+K do fokusowania szukajki
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
      const targetId = btn.getAttribute('data-target');
      let textToCopy = '';

      if (targetId) {
        const targetEl = document.getElementById(targetId);
        if (targetEl) textToCopy = targetEl.innerText;
      } else {
        const pre = btn.closest('.code-block-wrap').querySelector('pre');
        if (pre) textToCopy = pre.innerText;
      }

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
   6. Przełączanie Zakładek Schematów Wyświetlacza Drukarek
   ========================================================================== */
function initPrinterTabs() {
  const tabBtns = document.querySelectorAll('.printer-tab-btn');
  const tabPanes = document.querySelectorAll('.printer-tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   7. Interaktywny Generator Reguł BaseLinker
   ========================================================================== */
function initBaseLinkerSimulator() {
  const eventSelect = document.getElementById('blEventSelect');
  const statusSelect = document.getElementById('blStatusSelect');
  const invoiceCondition = document.getElementById('blInvoiceCondition');
  const previewBox = document.getElementById('blRulePreview');

  function updateRule() {
    if (!previewBox) return;
    const evt = eventSelect ? eventSelect.value : 'Zmiana statusu zamówienia';
    const st = statusSelect ? statusSelect.value : 'Spakowane';
    const inv = invoiceCondition && invoiceCondition.checked ? 'TAK (Tylko B2C: Chce fakturę = NIE)' : 'Dla wszystkich zamówień';

    previewBox.innerHTML = `
<span style="color: var(--primary);">[ZDARZENIE]:</span> ${evt} -> "${st}"
<span style="color: var(--primary);">[WARUNEK]:</span> ${inv}
<span style="color: var(--primary);">[AKCJA WYWOŁANA]:</span> Wyślij Webhook do agenta easyfiscal
<span style="color: var(--primary);">[PAYLOAD]:</span> { "order_id": "[id_zamowienia]", "action": "fiscalize_receipt" }
<span style="color: var(--success);">[ZWROT DO BASE]:</span> Zapis linku e-paragonu w polu dodatkowym: [pole_dodatkowe_eparagon_url]
    `;
  }

  if (eventSelect) eventSelect.addEventListener('change', updateRule);
  if (statusSelect) statusSelect.addEventListener('change', updateRule);
  if (invoiceCondition) invoiceCondition.addEventListener('change', updateRule);
}

/* ==========================================================================
   8. Interaktywny Live Preview Personalizacji E-Paragonu
   ========================================================================== */
function initReceiptPersonalizer() {
  const brandInput = document.getElementById('inputReceiptBrand');
  const promoInput = document.getElementById('inputReceiptPromo');
  const previewBrand = document.getElementById('previewReceiptBrand');
  const previewPromo = document.getElementById('previewReceiptPromo');
  const toggleLogo = document.getElementById('toggleReceiptLogo');
  const receiptLogo = document.getElementById('previewReceiptLogo');

  if (brandInput && previewBrand) {
    brandInput.addEventListener('input', () => {
      previewBrand.textContent = brandInput.value || 'TWÓJ SKLEP INTERNETOWY';
    });
  }

  if (promoInput && previewPromo) {
    promoInput.addEventListener('input', () => {
      previewPromo.textContent = promoInput.value || '10% RABATU NA KOLEJNE ZAKUPY Z KODEM: BIPE10';
    });
  }

  if (toggleLogo && receiptLogo) {
    toggleLogo.addEventListener('change', () => {
      receiptLogo.style.display = toggleLogo.checked ? 'inline-block' : 'none';
    });
  }
}

/* ==========================================================================
   9. Wdrożeniowa Lista Kontrolna (Checklist w localStorage)
   ========================================================================== */
function initChecklist() {
  const checkboxes = document.querySelectorAll('.checklist-checkbox');
  const countBadge = document.getElementById('checklistCompletedCount');
  const totalCount = checkboxes.length;

  function loadState() {
    let completed = 0;
    checkboxes.forEach((cb, idx) => {
      const isChecked = localStorage.getItem('ef_chk_' + idx) === 'true';
      cb.checked = isChecked;
      const parent = cb.closest('.checklist-item');
      if (parent) {
        if (isChecked) parent.classList.add('checked');
        else parent.classList.remove('checked');
      }
      if (isChecked) completed++;
    });

    if (countBadge) {
      countBadge.textContent = `${completed}/${totalCount}`;
    }
  }

  checkboxes.forEach((cb, idx) => {
    cb.addEventListener('change', () => {
      localStorage.setItem('ef_chk_' + idx, cb.checked ? 'true' : 'false');
      const parent = cb.closest('.checklist-item');
      if (parent) {
        if (cb.checked) parent.classList.add('checked');
        else parent.classList.remove('checked');
      }
      loadState();
    });
  });

  loadState();
}

/* ==========================================================================
   10. Kalkulator Oszczędności Księgowych (ROI)
   ========================================================================== */
function initRoiCalculator() {
  const volumeInput = document.getElementById('calcOrderVolume');
  const costPerDocInput = document.getElementById('calcCostPerDoc');
  const resultSavedEl = document.getElementById('calcResultSaved');
  const resultHoursEl = document.getElementById('calcResultHours');

  function calculate() {
    if (!volumeInput || !resultSavedEl) return;
    const orders = parseInt(volumeInput.value, 10) || 1000;
    const costPerDoc = parseFloat(costPerDocInput.value) || 1.20;

    // Koszt tradycyjnego księgowania = zamówienia * koszt
    // Z easyfiscal = 30 raportów dobowych miesięcznie * koszt
    const traditionalCost = orders * costPerDoc;
    const easyfiscalCost = 30 * costPerDoc;
    const savedMoney = Math.max(traditionalCost - easyfiscalCost, 0);

    // Oszczędność czasu na pakowaniu (ok. 20 sek na paragon fizyczny)
    const hoursSaved = Math.round((orders * 20) / 3600);

    resultSavedEl.textContent = savedMoney.toLocaleString('pl-PL', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' zł';
    if (resultHoursEl) {
      resultHoursEl.textContent = hoursSaved + ' godz.';
    }
  }

  if (volumeInput) volumeInput.addEventListener('input', calculate);
  if (costPerDocInput) costPerDocInput.addEventListener('input', calculate);
  calculate();
}

/* ==========================================================================
   11. Interaktywny Symulator Terminala easyfiscal (First-run CLI)
   ========================================================================== */
function initTerminalSimulator() {
  const container = document.getElementById('terminalStepsContainer');
  if (!container) return;

  const btnStep1 = document.getElementById('termBtnStep1');
  const btnStep2 = document.getElementById('termBtnStep2');
  const btnStep3 = document.getElementById('termBtnStep3');
  const btnStep4 = document.getElementById('termBtnStep4');
  const btnStep5 = document.getElementById('termBtnStep5');
  const btnReset = document.getElementById('termBtnReset');

  const baseLogs = `
<div><span class="t-info">[INFO]</span> Uruchamianie wersji aplikacji easyfiscal 1.2.1</div>
<div><span class="t-info">[INFO]</span> Baza danych znaleziona</div>
<div><span class="t-info">[INFO]</span> Sprawdzanie katalogu konfiguracji ................... <span class="t-ok">OK!</span></div>
<div><span class="t-warn">[WARN]</span> Sprawdzanie, czy plik konfiguracyjny istnieje ......... <span class="t-warn">BRAKUJĄCE ELEMENTY - TWORZENIE W TOKU</span></div>
<div><span class="t-info">[INFO]</span> Rozpoczęcie konfiguracji easyfiscal</div>
<div style="margin: 6px 0; color: #94A3B8;">Wygląda na to, że to nasze pierwsze spotkanie. Zanim przejdziemy dalej, muszę Ci zadać kilka pytań.</div>
`;

  const stepsHtml = {
    1: `
${baseLogs}
<div><span class="t-prompt">Podaj swój token easyfiscal którego dostałaś(-eś) drogą mailową:</span> <span class="t-input">ef_live_8f93a1c904e284b23d</span> █</div>
`,
    2: `
${baseLogs}
<div><span class="t-prompt">Podaj swój token easyfiscal:</span> <span class="t-input">ef_live_8f93a1c904e284b23d</span> <span class="t-ok">✓ OK</span></div>
<div style="margin-top:4px;"><span class="t-prompt">? Wybierz źródło danych:</span></div>
<div style="color: #34D399; font-weight:700;">❯ baselinker</div>
<div style="color: #64748B;">  sellasist</div>
`,
    3: `
${baseLogs}
<div><span class="t-prompt">Podaj swój token easyfiscal:</span> <span class="t-input">ef_live_8f93a1c904e284b23d</span> <span class="t-ok">✓ OK</span></div>
<div><span class="t-ok">✔ Wybierz źródło danych:</span> <span class="t-input">baselinker</span></div>
<div style="margin-top:4px;"><span class="t-prompt">Podaj swój token BaseLinker, który jest potrzebny do sprawdzenia dokumentów w BaseLinker:</span> <span class="t-input">4002891-3004812-XXXXXXXXXXXXXXXX</span> █</div>
`,
    4: `
${baseLogs}
<div><span class="t-prompt">Podaj swój token easyfiscal:</span> <span class="t-input">ef_live_8f93a1c904e284b23d</span> <span class="t-ok">✓ OK</span></div>
<div><span class="t-ok">✔ Wybierz źródło danych:</span> <span class="t-input">baselinker</span></div>
<div><span class="t-prompt">Podaj swój token BaseLinker:</span> <span class="t-input">4002891-3004812-XXXXXXXXXXXXXXXX</span> <span class="t-ok">✓ OK</span></div>
<div style="margin-top:4px;"><span class="t-prompt">? Wybierz producenta drukarki:</span></div>
<div style="color: #34D399; font-weight:700;">❯ NOVITUS</div>
<div style="color: #64748B;">  POSNET</div>
`,
    5: `
${baseLogs}
<div><span class="t-prompt">Podaj swój token easyfiscal:</span> <span class="t-input">ef_live_8f93a1c904e284b23d</span> <span class="t-ok">✓ OK</span></div>
<div><span class="t-ok">✔ Wybierz źródło danych:</span> <span class="t-input">baselinker</span></div>
<div><span class="t-prompt">Podaj swój token BaseLinker:</span> <span class="t-input">4002891-3004812-XXXXXXXXXXXXXXXX</span> <span class="t-ok">✓ OK</span></div>
<div><span class="t-ok">✔ Wybierz producenta drukarki:</span> <span class="t-input">NOVITUS</span></div>
<div style="margin-top:4px;"><span class="t-prompt">? Czy chcesz szukać IP drukarki automatycznie czy manualnie?</span></div>
<div style="color: #34D399; font-weight:700;">❯ auto</div>
<div style="color: #64748B;">  manual</div>
<div style="margin-top:8px;"><span class="t-info">[INFO]</span> Szukam drukarki w sieci LAN ........................ <span class="t-ok">ZNALEZIONO (192.168.1.150:8000)</span></div>
<div><span class="t-info">[INFO]</span> Zapisano konfigurację do easyfiscal.cfg .......... <span class="t-ok">OK!</span></div>
<div style="color: #34D399; font-weight: 700; margin-top: 6px;">✨ easyfiscal jest gotowy do wystawiania e-paragonów! Kolejka aktywna.</div>
`
  };

  function renderStep(stepNum) {
    container.innerHTML = stepsHtml[stepNum] || stepsHtml[1];
    const termBody = document.getElementById('terminalOutput');
    if (termBody) termBody.scrollTop = termBody.scrollHeight;
  }

  if (btnStep1) btnStep1.addEventListener('click', () => renderStep(1));
  if (btnStep2) btnStep2.addEventListener('click', () => renderStep(2));
  if (btnStep3) btnStep3.addEventListener('click', () => renderStep(3));
  if (btnStep4) btnStep4.addEventListener('click', () => renderStep(4));
  if (btnStep5) btnStep5.addEventListener('click', () => renderStep(5));
  if (btnReset) btnReset.addEventListener('click', () => renderStep(1));

  renderStep(1);
}

/* ==========================================================================
   12. Interaktywny Generator Klucza API Sellasist
   ========================================================================== */
function initSellasistSimulator() {
  const btn = document.getElementById('btnGenSellasistKey');
  const resultBox = document.getElementById('sellasistKeyResult');
  const nameInput = document.getElementById('sellasistKeyName');

  if (!btn || !resultBox) return;

  btn.addEventListener('click', () => {
    const keyName = nameInput ? (nameInput.value.trim() || 'API easyfiscal') : 'API easyfiscal';
    const randKey = 'sec_' + Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join('');

    resultBox.innerHTML = `
<span style="color: var(--success); font-weight:700;">✓ Klucz API dla Sellasist został pomyślnie wygenerowany!</span>
<div style="margin-top: 6px; line-height: 1.5;">
  <div><strong>Wyświetlana nazwa:</strong> ${keyName}</div>
  <div><strong>Status:</strong> <span style="color:#34D399;">Aktywny (Pełne uprawnienia do zamówień i paragonów)</span></div>
  <div style="margin-top:4px;"><strong>Wygenerowany Klucz API (Token):</strong></div>
  <code style="display:block; padding: 6px 8px; background: rgba(0,0,0,0.4); border-radius: 4px; color: #FDE047; word-break: break-all; margin: 4px 0;">${randKey}</code>
  <span style="font-size: 0.8rem; color: var(--text-muted);">Skopiuj powyższy klucz i wklej go w aplikacji easyfiscal przy wyborze integratora <code>sellasist</code>.</span>
</div>
    `;
  });
}
