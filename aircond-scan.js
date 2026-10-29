(function () {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const section = $('#pembantu-digital');
  const form = $('#assistForm');
  const runButton = $('#runDiagnosis');
  if (!section || !form || !runButton) return;

  const liveHeading = $('.live-head h2', section);
  const liveDescription = $('.live-head > p:not(.eyebrow)', section);
  if (liveHeading) liveHeading.innerHTML = 'Saringan aircond<br><em>bermula dengan simptom.</em>';
  if (liveDescription) liveDescription.textContent = 'Jawab tiga langkah ringkas untuk melihat punca yang mungkin dan pemeriksaan seterusnya. Saringan ini panduan awal, bukan diagnosis muktamad.';

  const assistant = $('.live-grid .live-card:nth-child(2)', section);
  const clockCard = $('.live-grid .live-card:first-child', section);
  const liveGrid = $('.live-grid', section);
  if (assistant && clockCard && liveGrid) {
    assistant.classList.add('live-diagnostic-card');
    clockCard.classList.add('live-clock-card');
    liveGrid.insertBefore(assistant, clockCard);
  }

  const title = $('.assistant-title', assistant || section);
  if (title) title.textContent = 'Semak masalah aircond kereta';
  const intro = $('.assistant-title + .live-note', assistant || section);
  if (intro) intro.textContent = 'Pilih simptom dan keadaan ia berlaku. Bacaan meter tidak diperlukan untuk saringan awal.';

  const quickOptions = $('.assist-options', assistant || section);
  const quickAnswer = $('#assistAnswer');
  if (quickOptions && quickAnswer) {
    const tips = document.createElement('details');
    tips.className = 'scan-tips';
    const summary = document.createElement('summary');
    summary.textContent = 'Tip ringkas dan pertanyaan servis';
    tips.append(summary, quickOptions, quickAnswer);
    form.parentElement.insertBefore(tips, form);
  }

  const grids = $$('.field-grid', form).filter((grid) => !grid.classList.contains('single'));
  const vehicleGrid = grids[0];
  const symptomGrid = grids[1];
  const timingGrid = grids[2];
  if (!vehicleGrid || !symptomGrid || !timingGrid) return;

  const issueSelect = $('#assistIssue');
  const whenSelect = $('#assistWhen');
  const blowerSelect = $('#assistBlower');
  const technicalDetails = $(':scope > details', form);
  const optionalGrid = $(':scope > .field-grid.single', form);
  const resultBox = $('#diagnosisResult');
  const whatsappButton = $('.whatsapp-submit', form);
  const brandLabel = $('#assistBrand')?.closest('label');
  const modelLabel = $('#assistModel')?.closest('label');
  const yearLabel = $('#assistYear')?.closest('label');

  const wizard = document.createElement('div');
  wizard.className = 'scan-wizard';
  wizard.id = 'scanWizard';
  const progress = document.createElement('div');
  progress.className = 'scan-progress';
  progress.setAttribute('aria-live', 'polite');
  const progressLabel = document.createElement('span');
  progressLabel.className = 'scan-progress-label';
  const progressTrack = document.createElement('span');
  progressTrack.className = 'scan-progress-track';
  const progressValue = document.createElement('span');
  progressValue.className = 'scan-progress-value';
  progressTrack.append(progressValue);
  progress.append(progressLabel, progressTrack);

  const stepOne = document.createElement('section');
  stepOne.className = 'scan-step';
  stepOne.dataset.step = '1';
  const stepTwo = document.createElement('section');
  stepTwo.className = 'scan-step';
  stepTwo.dataset.step = '2';
  const stepThree = document.createElement('section');
  stepThree.className = 'scan-step';
  stepThree.dataset.step = '3';
  wizard.append(progress, stepOne, stepTwo, stepThree);
  form.insertBefore(wizard, vehicleGrid);

  const addStepHeading = (parent, eyebrow, heading, help) => {
    const label = document.createElement('p');
    label.className = 'scan-eyebrow';
    label.textContent = eyebrow;
    const h = document.createElement('h4');
    h.textContent = heading;
    const p = document.createElement('p');
    p.className = 'scan-help';
    p.textContent = help;
    parent.append(label, h, p);
  };
  addStepHeading(stepOne, 'LANGKAH 1', 'Apa simptom utama?', 'Pilih yang paling hampir dengan keadaan kereta anda.');
  addStepHeading(stepTwo, 'LANGKAH 2', 'Bila ia berlaku?', 'Jika tidak pasti, anda boleh teruskan tanpa memilih.');
  addStepHeading(stepThree, 'LANGKAH 3', 'Kereta anda', 'Maklumat ini membantu kami padankan panduan dengan kenderaan.');

  const errorOne = document.createElement('p');
  errorOne.className = 'scan-error';
  errorOne.setAttribute('role', 'alert');
  errorOne.hidden = true;
  errorOne.textContent = 'Pilih satu simptom untuk teruskan.';
  const symptomCards = document.createElement('div');
  symptomCards.className = 'scan-choice-grid scan-symptom-choices';
  const symptomChoices = [
    ['kurang-sejuk', 'Kurang sejuk', 'Angin keluar tetapi kabin tidak cukup sejuk'],
    ['sejuk-gerak', 'Panas bila berhenti', 'Lebih sejuk ketika kereta bergerak'],
    ['langsung-panas', 'Tidak sejuk langsung', 'Angin keluar tetapi terasa panas'],
    ['sejuk-sekejap', 'Sejuk sekejap', 'Kemudian kembali panas'],
    ['blower-lemah', 'Angin lemah atau tiada', 'Aliran blower perlahan atau berhenti'],
    ['bau', 'Bau tidak menyenangkan', 'Bau datang dari saluran aircond'],
    ['bunyi', 'Bunyi luar biasa', 'Bunyi muncul apabila aircond dihidupkan'],
    ['lain', 'Lain-lain / tidak pasti', 'Pilih simptom khusus dalam senarai di bawah']
  ];
  const makeChoice = (value, label, help, select, className) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'scan-choice ' + (className || '');
    button.dataset.value = value;
    button.setAttribute('aria-pressed', 'false');
    const strong = document.createElement('strong');
    strong.textContent = label;
    const small = document.createElement('small');
    small.textContent = help;
    button.append(strong, small);
    button.addEventListener('click', () => {
      select.value = value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      $$('.scan-choice', button.parentElement).forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    });
    return button;
  };
  symptomChoices.forEach(([value, label, help]) => symptomCards.append(makeChoice(value, label, help, issueSelect, 'scan-choice--symptom')));
  stepOne.append(symptomCards, errorOne);

  const symptomExtra = document.createElement('details');
  symptomExtra.className = 'scan-extra';
  const symptomSummary = document.createElement('summary');
  symptomSummary.textContent = 'Atau pilih simptom khusus';
  const issueLabel = issueSelect.closest('label');
  if (issueLabel) {
    const textNode = Array.from(issueLabel.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    if (textNode) textNode.textContent = 'Pilih simptom utama: ';
    symptomExtra.append(symptomSummary, issueLabel);
  }
  stepOne.append(symptomExtra);
  const symptomTextLabel = $('#assistSymptomText')?.closest('label');
  const symptomNotes = document.createElement('details');
  symptomNotes.className = 'scan-extra';
  const symptomNotesSummary = document.createElement('summary');
  symptomNotesSummary.textContent = 'Tambah penerangan (pilihan)';
  if (symptomTextLabel) symptomNotes.append(symptomNotesSummary, symptomTextLabel);
  stepOne.append(symptomNotes);

  const timeCard = document.createElement('div');
  timeCard.className = 'scan-question';
  const timeTitle = document.createElement('h5');
  timeTitle.textContent = 'Bila simptom paling ketara?';
  const timeChoices = document.createElement('div');
  timeChoices.className = 'scan-choice-grid scan-small-choices';
  timeCard.append(timeTitle, timeChoices);
  Array.from(whenSelect.options).forEach((option) => {
    timeChoices.append(makeChoice(option.value, option.value ? option.textContent : 'Tidak pasti', option.value ? '' : 'Pilih jika belum dapat dipastikan', whenSelect, 'scan-choice--small'));
  });
  const blowerCard = document.createElement('div');
  blowerCard.className = 'scan-question';
  const blowerTitle = document.createElement('h5');
  blowerTitle.textContent = 'Bagaimana aliran angin dari blower?';
  const blowerChoices = document.createElement('div');
  blowerChoices.className = 'scan-choice-grid scan-small-choices';
  blowerCard.append(blowerTitle, blowerChoices);
  Array.from(blowerSelect.options).forEach((option) => {
    blowerChoices.append(makeChoice(option.value, option.value ? option.textContent : 'Belum diperiksa', option.value ? '' : 'Tidak perlu buka bonet atau sentuh kipas', blowerSelect, 'scan-choice--small'));
  });
  stepTwo.append(timeCard, blowerCard);
  const timingExtra = document.createElement('details');
  timingExtra.className = 'scan-extra';
  const timingSummary = document.createElement('summary');
  timingSummary.textContent = 'Maklumat masa ujian (pilihan)';
  timingExtra.append(timingSummary);
  timingGrid.querySelectorAll('label').forEach((label) => {
    if (label.contains(whenSelect) || label.contains(blowerSelect)) {
      const select = label.querySelector('select');
      if (select) select.setAttribute('aria-label', label.childNodes[0]?.textContent.trim() || 'Pilihan');
      timingExtra.append(label);
    }
  });
  stepTwo.append(timingExtra);

  const vehicleInfo = document.createElement('div');
  vehicleInfo.className = 'scan-vehicle-grid';
  [brandLabel, modelLabel, yearLabel].filter(Boolean).forEach((label) => vehicleInfo.append(label));
  stepThree.append(vehicleInfo);

  const advanced = document.createElement('details');
  advanced.className = 'scan-extra scan-advanced';
  const advancedSummary = document.createElement('summary');
  advancedSummary.textContent = 'Ada bacaan meter atau maklumat tambahan? (pilihan)';
  const advancedIntro = document.createElement('p');
  advancedIntro.className = 'scan-help';
  advancedIntro.textContent = 'Jika ada, masukkan bacaan sebenar. Jangan buka sistem refrigerant atau sentuh kipas untuk mengambil bacaan sendiri.';
  advanced.append(advancedSummary, advancedIntro);
  Array.from(vehicleGrid.querySelectorAll('label')).forEach((label) => {
    if (![brandLabel, modelLabel, yearLabel].includes(label)) advanced.append(label);
  });
  timingGrid.querySelectorAll('label').forEach((label) => {
    if (!label.contains(whenSelect) && !label.contains(blowerSelect)) advanced.append(label);
  });
  if (technicalDetails) {
    technicalDetails.removeAttribute('open');
    advanced.append(technicalDetails);
  }
  if (optionalGrid) {
    optionalGrid.classList.add('scan-optional-grid');
    advanced.append(optionalGrid);
  }
  stepThree.append(advanced);
  vehicleGrid.remove();
  symptomGrid.remove();
  timingGrid.remove();

  const stepNav = (back, next, label) => {
    const nav = document.createElement('div');
    nav.className = 'scan-step-nav';
    if (back) {
      const backButton = document.createElement('button');
      backButton.type = 'button';
      backButton.className = 'scan-back';
      backButton.textContent = '← Kembali';
      backButton.addEventListener('click', () => showStep(back));
      nav.append(backButton);
    }
    if (next) {
      const nextButton = document.createElement('button');
      nextButton.type = 'button';
      nextButton.className = 'btn gold scan-next';
      nextButton.textContent = label;
      nextButton.addEventListener('click', () => {
        if (!issueSelect.value) {
          errorOne.hidden = false;
          symptomCards.querySelector('.scan-choice')?.focus();
          return;
        }
        errorOne.hidden = true;
        showStep(next);
      });
      nav.append(nextButton);
    }
    return nav;
  };
  stepOne.append(stepNav(null, 2, 'Seterusnya'));
  stepTwo.append(stepNav(1, 3, 'Butiran kereta'));
  stepThree.append(stepNav(2, null, ''));
  stepThree.append(runButton);
  if (whatsappButton) whatsappButton.remove();

  const summaryPanel = document.createElement('section');
  summaryPanel.className = 'scan-summary';
  summaryPanel.id = 'scanSummary';
  summaryPanel.hidden = true;
  form.insertBefore(summaryPanel, resultBox);
  const reportDetails = document.createElement('details');
  reportDetails.className = 'scan-full-report';
  reportDetails.hidden = true;
  const reportTitle = document.createElement('summary');
  reportTitle.textContent = 'Lihat laporan teknikal penuh';
  if (resultBox) {
    form.insertBefore(reportDetails, resultBox);
    reportDetails.append(reportTitle, resultBox);
  }
  runButton.textContent = 'Lihat saringan awal';
  runButton.classList.add('scan-analyze-button');
  const formNote = $('.live-note', form);
  if (formNote) formNote.textContent = 'Semakan ini ialah panduan awal berdasarkan jawapan anda. Pemeriksaan bengkel dan spesifikasi pengeluar diperlukan untuk mengesahkan punca.';

  let latestResult = null;
  form.addEventListener('input', () => { latestResult = null; }, true);
  form.addEventListener('change', () => { latestResult = null; }, true);
  const showStep = (number) => {
    $$('.scan-step', wizard).forEach((item) => {
      item.hidden = Number(item.dataset.step) !== number;
    });
    progressLabel.textContent = 'Langkah ' + number + ' daripada 3';
    progressValue.style.width = (number * 100 / 3) + '%';
    summaryPanel.hidden = true;
    reportDetails.hidden = true;
    wizard.hidden = false;
    if (number === 3) brandLabel?.querySelector('input')?.focus({ preventScroll: true });
  };
  showStep(1);

  issueSelect.addEventListener('change', () => {
    $$('.scan-choice', symptomCards).forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.value === issueSelect.value)));
    errorOne.hidden = Boolean(issueSelect.value);
  });
  [whenSelect, blowerSelect].forEach((select) => select.addEventListener('change', () => {
    const choices = select === whenSelect ? timeChoices : blowerChoices;
    const matching = $$('.scan-choice', choices).find((button) => button.dataset.value === select.value);
    $$('.scan-choice', choices).forEach((button) => button.setAttribute('aria-pressed', String(button === matching)));
  }));
  whenSelect.dispatchEvent(new Event('change'));
  blowerSelect.dispatchEvent(new Event('change'));

  function appendText(parent, tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = text;
    parent.append(element);
    return element;
  }

  function renderSummary(result) {
    summaryPanel.replaceChildren();
    appendText(summaryPanel, 'p', 'scan-eyebrow', 'SARINGAN AWAL · SEMAKAN BENGKEL DIPERLUKAN');
    appendText(summaryPanel, 'h3', '', 'Hasil saringan anda');
    const d = result.data;
    const vehicle = [d.brand, d.model, d.year].filter(Boolean).join(' ');
    appendText(summaryPanel, 'p', 'scan-summary-intro', vehicle + ' · ' + result.assessment.title);
    appendText(summaryPanel, 'h4', '', 'Punca yang mungkin');
    const causeList = document.createElement('ol');
    (result.assessment.causes || []).slice(0, 3).forEach((item) => appendText(causeList, 'li', '', item));
    summaryPanel.append(causeList);
    appendText(summaryPanel, 'h4', '', 'Pemeriksaan yang disyorkan');
    const checks = document.createElement('ol');
    (result.assessment.checks || []).slice(0, 3).forEach((item) => appendText(checks, 'li', '', item));
    summaryPanel.append(checks);
    if (result.technical && result.technical.priorities && result.technical.priorities.length) {
      const hasMeasurements = [d.vent, d.ambient, d.engineTemp, d.lp, d.hp, d.sh, d.sc, d.ev, d.tlow, d.thigh].some(Boolean);
      appendText(summaryPanel, 'h4', '', hasMeasurements ? 'Keutamaan berdasarkan bacaan yang diberi' : 'Bacaan tambahan yang boleh membantu');
      const priorities = document.createElement('ul');
      result.technical.priorities.slice(0, 2).forEach((item) => appendText(priorities, 'li', '', item));
      summaryPanel.append(priorities);
    }
    appendText(summaryPanel, 'p', 'scan-safety-note', 'Ini saringan awal, bukan pengesahan kerosakan. Jangan tambah gas atau tukar komponen berdasarkan satu bacaan sahaja; ikut spesifikasi pengeluar dan hentikan pemeriksaan jika keadaan tidak selamat.');
    const actions = document.createElement('div');
    actions.className = 'scan-result-actions';
    const revise = document.createElement('button');
    revise.type = 'button';
    revise.className = 'scan-back';
    revise.textContent = 'Ubah jawapan';
    revise.addEventListener('click', () => showStep(3));
    const preview = document.createElement('button');
    preview.type = 'button';
    preview.className = 'btn gold';
    preview.textContent = 'Pratonton untuk WhatsApp';
    preview.addEventListener('click', openWhatsAppPreview);
    actions.append(revise, preview);
    summaryPanel.append(actions);
    reportDetails.hidden = false;
    summaryPanel.hidden = false;
    wizard.hidden = true;
  }

  function checkRequired() {
    if (!issueSelect.value) {
      showStep(1);
      errorOne.hidden = false;
      return false;
    }
    const missing = [$('#assistBrand'), $('#assistModel'), $('#assistYear')].find((field) => !field || !field.value.trim());
    if (missing) {
      showStep(3);
      missing?.focus();
      missing?.reportValidity();
      return false;
    }
    return true;
  }

  runButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!checkRequired()) return;
    latestResult = typeof window.runAircondDiagnosis === 'function' ? window.runAircondDiagnosis() : null;
    if (latestResult) {
      renderSummary(latestResult);
      summaryPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, true);

  function openWhatsAppPreview() {
    if (!latestResult) {
      if (!checkRequired()) return;
      latestResult = typeof window.runAircondDiagnosis === 'function' ? window.runAircondDiagnosis() : null;
      if (!latestResult) return;
    }
    const dialog = $('#scanWhatsAppDialog');
    const textArea = $('#scanWhatsAppText');
    const continueLink = $('#scanWhatsAppContinue');
    textArea.value = latestResult.text;
    continueLink.href = 'https://wa.me/60133133519?text=' + encodeURIComponent(latestResult.text);
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    openWhatsAppPreview();
  }, true);

  const dialog = document.createElement('dialog');
  dialog.className = 'scan-whatsapp-dialog';
  dialog.id = 'scanWhatsAppDialog';
  dialog.setAttribute('aria-labelledby', 'scanWhatsAppTitle');
  dialog.innerHTML = '<form method="dialog" class="scan-dialog-shell"><button class="scan-dialog-close" aria-label="Tutup pratonton">×</button><p class="scan-eyebrow">PRATONTON</p><h3 id="scanWhatsAppTitle">Semak laporan sebelum WhatsApp</h3><p class="scan-help">Laporan ini hanya dihantar selepas anda menekan butang WhatsApp.</p><textarea id="scanWhatsAppText" readonly aria-label="Pratonton laporan"></textarea><div class="scan-result-actions"><button class="scan-back" value="cancel">Kembali ke hasil</button><a class="btn gold" id="scanWhatsAppContinue" href="#" target="_blank" rel="noopener">Teruskan ke WhatsApp ↗</a></div></form>';
  assistant.append(dialog);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  const heroActions = $('.hero .actions');
  if (heroActions && !$('.scan-hero-link', heroActions)) {
    const anchor = document.createElement('a');
    anchor.className = 'btn outline scan-hero-link';
    anchor.href = '#pembantu-digital';
    anchor.textContent = 'Semak masalah aircond ↓';
    heroActions.append(anchor);
  }

  const floatWa = $('.floatwa');
  if (floatWa && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      document.body.classList.toggle('scan-is-visible', entries.some((entry) => entry.isIntersecting));
    }, { threshold: 0.12 });
    observer.observe(section);
  }
})();
