/* AMIR TECH ROG GLOBAL — Analisis AI percuma
 * Memanggil Supabase Edge Function `ai-diagnosis`.
 * Kunci OpenRouter kekal di Supabase; fail ini hanya menggunakan publishable key.
 */
(function () {
  'use strict';

  if (window.__amirAiLoaded) return;
  window.__amirAiLoaded = true;

  const SUPABASE_URL = 'https://gubkcbnjknvhtntkyrqd.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_Qk4tgU4mN4k5p32lVN3I_w_1VAI7cJP';
  const DEFAULT_ENDPOINT = SUPABASE_URL + '/functions/v1/ai-diagnosis';
  const TIMEOUT_MS = 90000;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  let currentResult = null;
  let panel = null;
  let lastRunAt = 0;

  function injectStyle() {
    if (document.getElementById('amir-ai-style')) return;
    const style = document.createElement('style');
    style.id = 'amir-ai-style';
    style.textContent = `
      .amir-ai{margin:18px 0 0;padding:clamp(16px,2.6vw,22px);border:1px solid #82c9cc;border-radius:18px;background:linear-gradient(145deg,#f5fffd,#eaf7ff);color:#17384a;box-shadow:0 14px 34px rgba(16,68,84,.12);font-family:inherit;text-align:left}
      .amir-ai[hidden]{display:none!important}
      .amir-ai *{box-sizing:border-box}
      .amir-ai-head{display:flex;gap:12px;align-items:flex-start}
      .amir-ai-orb{width:11px;height:11px;flex:0 0 auto;margin-top:7px;border-radius:50%;background:#0a9aa4;box-shadow:0 0 0 0 rgba(10,154,164,.45);animation:amirAiPulse 2s infinite}
      @keyframes amirAiPulse{0%{box-shadow:0 0 0 0 rgba(10,154,164,.45)}70%{box-shadow:0 0 0 9px rgba(10,154,164,0)}100%{box-shadow:0 0 0 0 rgba(10,154,164,0)}}
      .amir-ai-eyebrow{margin:0 0 4px;font-size:.71rem;font-weight:900;letter-spacing:.12em;color:#087d86;text-transform:uppercase}
      .amir-ai h3{margin:0;font-size:clamp(1.08rem,2.2vw,1.32rem);line-height:1.3;color:#123e57}
      .amir-ai-help{margin:10px 0 0;color:#416273;font-size:.88rem;line-height:1.62}
      .amir-ai-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:15px}
      .amir-ai-run{border:0;border-radius:12px;padding:12px 18px;background:linear-gradient(135deg,#0a8790,#075f86);color:#fff;font:inherit;font-weight:850;cursor:pointer;box-shadow:0 8px 20px rgba(7,95,134,.22);transition:transform .15s ease,box-shadow .15s ease}
      .amir-ai-run:hover{transform:translateY(-1px);box-shadow:0 10px 24px rgba(7,95,134,.3)}
      .amir-ai-run[disabled]{opacity:.65;cursor:wait;transform:none}
      .amir-ai-output{margin-top:16px;border-top:1px solid #cfe5e8;padding-top:14px}
      .amir-ai-output[hidden]{display:none!important}
      .amir-ai-result-head{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-bottom:10px}
      .amir-ai-badge{display:inline-flex;align-items:center;min-height:26px;padding:3px 9px;border-radius:999px;background:#075f86;color:#fff;font-size:.7rem;font-weight:900;letter-spacing:.08em}
      .amir-ai-model{color:#416273;font-size:.78rem;font-weight:700}
      .amir-ai-copy,.amir-ai-retry{border:1px solid #9bc9ce;border-radius:9px;background:#fff;color:#075f74;font:inherit;font-size:.78rem;font-weight:800;padding:7px 11px;cursor:pointer}
      .amir-ai-copy:hover,.amir-ai-retry:hover{background:#e6f7f5}
      .amir-ai-body{font-size:.93rem;line-height:1.72;color:#23475b;max-height:68vh;overflow:auto;padding-right:6px;overscroll-behavior:contain}
      .amir-ai-body h4{margin:18px 0 6px;color:#075f74;font-size:1rem;line-height:1.35}
      .amir-ai-body h4:first-child{margin-top:0}
      .amir-ai-body p{margin:8px 0}
      .amir-ai-body ul,.amir-ai-body ol{margin:8px 0;padding-left:1.35rem}
      .amir-ai-body li{margin:4px 0}
      .amir-ai-body strong{color:#123e57}
      .amir-ai-body code{padding:1px 5px;border-radius:5px;background:#e2f1f3;color:#0b4f60;font-size:.86em}
      .amir-ai-body hr{border:0;border-top:1px solid #cfe5e8;margin:14px 0}
      .amir-ai-table-wrap{overflow:auto;margin:10px 0;border:1px solid #c7dde5;border-radius:10px}
      .amir-ai-body table{border-collapse:collapse;width:100%;min-width:520px;font-size:.83rem;background:#fff}
      .amir-ai-body th,.amir-ai-body td{border:1px solid #d4e6eb;padding:7px 9px;vertical-align:top;text-align:left}
      .amir-ai-body th{background:#e2f5f1;color:#075f61;font-weight:850}
      .amir-ai-body tr:nth-child(even) td{background:#f7fbfd}
      .amir-ai-note,.amir-ai-disclaimer{margin:12px 0 0;color:#5b7482;font-size:.76rem;line-height:1.55}
      .amir-ai-error{margin:12px 0 0;padding:11px 13px;border-left:3px solid #c18a1b;border-radius:0 9px 9px 0;background:#fff8e7;color:#674d11;font-size:.86rem;line-height:1.6}
      .amir-ai-spinner{display:inline-flex;align-items:center;gap:9px;color:#075f74;font-size:.86rem;font-weight:750}
      .amir-ai-spinner:before{content:"";width:15px;height:15px;border:2px solid #9bc9ce;border-top-color:#075f86;border-radius:50%;animation:amirAiSpin .8s linear infinite}
      @keyframes amirAiSpin{to{transform:rotate(360deg)}}
      @media(max-width:600px){.amir-ai{padding:15px;border-radius:14px}.amir-ai-body{max-height:none}.amir-ai-copy,.amir-ai-retry{flex:1 1 auto}}
    `;
    document.head.append(style);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[character]));
  }

  function inlineMarkdown(text) {
    return escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  function renderTable(rows) {
    if (!rows.length) return '';
    const cells = rows.map((row) => row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim()));
    const body = cells.filter((row, index) => !(index === 1 && row.every((cell) => /^:?-{2,}:?$/.test(cell))));
    if (!body.length) return '';
    let html = '<div class="amir-ai-table-wrap"><table>';
    body.forEach((row, index) => {
      const tag = index === 0 ? 'th' : 'td';
      html += '<tr>' + row.map((cell) => '<' + tag + '>' + inlineMarkdown(cell) + '</' + tag + '>').join('') + '</tr>';
    });
    return html + '</table></div>';
  }

  /* Minimal, safe Markdown renderer for the AI response (headings, bold, lists, tables). */
  function renderMarkdown(markdown) {
    const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
    const output = [];
    let list = null;
    let table = null;

    const closeList = () => {
      if (list) {
        output.push('</' + list + '>');
        list = null;
      }
    };
    const flushTable = () => {
      if (table) {
        output.push(renderTable(table));
        table = null;
      }
    };

    lines.forEach((rawLine) => {
      const line = rawLine.trimEnd();

      if (/^\|.*\|$/.test(line)) {
        closeList();
        if (!table) table = [];
        table.push(line);
        return;
      }
      flushTable();

      if (!line.trim()) {
        closeList();
        return;
      }

      const heading = line.match(/^#{1,6}\s+(.+)$/);
      if (heading) {
        closeList();
        output.push('<h4>' + inlineMarkdown(heading[1]) + '</h4>');
        return;
      }

      const boldHeading = line.match(/^\*\*(.+?)\*\*:?$/);
      if (boldHeading && boldHeading[1].length <= 90) {
        closeList();
        output.push('<h4>' + inlineMarkdown(boldHeading[1]) + '</h4>');
        return;
      }

      if (/^---+$/.test(line.trim())) {
        closeList();
        output.push('<hr>');
        return;
      }

      const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
      if (unordered) {
        if (list !== 'ul') {
          closeList();
          output.push('<ul>');
          list = 'ul';
        }
        output.push('<li>' + inlineMarkdown(unordered[1]) + '</li>');
        return;
      }

      const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
      if (ordered) {
        if (list !== 'ol') {
          closeList();
          output.push('<ol>');
          list = 'ol';
        }
        output.push('<li>' + inlineMarkdown(ordered[1]) + '</li>');
        return;
      }

      closeList();
      output.push('<p>' + inlineMarkdown(line) + '</p>');
    });

    closeList();
    flushTable();
    return output.join('');
  }

  function createPanel() {
    const element = document.createElement('section');
    element.className = 'amir-ai';
    element.hidden = true;
    element.innerHTML = `
      <div class="amir-ai-head">
        <span class="amir-ai-orb" aria-hidden="true"></span>
        <div>
          <p class="amir-ai-eyebrow">Analisis AI percuma · OpenRouter</p>
          <h3>Pandangan kedua daripada AI</h3>
        </div>
      </div>
      <p class="amir-ai-help">Dapatkan analisis tambahan selepas saringan tempatan. AI membaca data kenderaan dan bacaan yang anda isi, kemudian mencadangkan punca serta langkah ujian. Kuota percuma terhad; gunakan bila perlu.</p>
      <div class="amir-ai-actions">
        <button type="button" class="amir-ai-run">Tambah analisis AI percuma</button>
      </div>
      <div class="amir-ai-output" hidden></div>
      <p class="amir-ai-note">AI boleh tersilap dan tidak menggantikan pemeriksaan fizikal. Jangan tambah gas, tukar komponen atau buka sistem refrigerant berdasarkan jawapan AI sahaja.</p>
    `;
    $('.amir-ai-run', element).addEventListener('click', runAi);
    return element;
  }

  function ensurePanel() {
    const summary = document.getElementById('scanSummary');
    if (summary) {
      if (panel && panel.parentElement === summary) return panel;
      if (panel) panel.remove();
      panel = createPanel();
      summary.append(panel);
      return panel;
    }

    const resultBox = document.getElementById('diagnosisResult');
    if (resultBox && resultBox.parentElement) {
      if (panel && panel.parentElement === resultBox.parentElement && panel.previousElementSibling === resultBox) return panel;
      if (panel) panel.remove();
      panel = createPanel();
      resultBox.insertAdjacentElement('afterend', panel);
      return panel;
    }

    return null;
  }

  function resetOutput() {
    if (!panel) return;
    const output = $('.amir-ai-output', panel);
    if (output) {
      output.hidden = true;
      output.replaceChildren();
    }
    const runButton = $('.amir-ai-run', panel);
    if (runButton) {
      runButton.disabled = false;
      runButton.textContent = 'Tambah analisis AI percuma';
    }
  }

  function reveal(result) {
    if (result) currentResult = result;
    const element = ensurePanel();
    if (!element) return;
    element.hidden = false;
  }

  /* Field IDs used by the live diagnosis form. Reading them directly keeps this
     script independent from the page's internal analyse() function. */
  const FIELD_MAP = [
    ['brand', 'assistBrand'], ['model', 'assistModel'], ['year', 'assistYear'],
    ['engine', 'assistEngine'], ['systemType', 'assistSystemType'],
    ['meteringDevice', 'assistMeteringDevice'], ['evaporatorLayout', 'assistEvaporatorLayout'],
    ['issue', 'assistIssue'], ['symptomText', 'assistSymptomText'], ['when', 'assistWhen'],
    ['blower', 'assistBlower'], ['testMode', 'assistTestMode'], ['rpm', 'assistRpm'],
    ['vent', 'assistVentTemp'], ['ambient', 'assistAmbient'], ['engineTemp', 'assistEngineTemp'],
    ['engineTempSource', 'assistEngineTempSource'], ['lp', 'assistLP'], ['hp', 'assistHP'],
    ['sh', 'assistSH'], ['sc', 'assistSC'], ['ev', 'assistEV'], ['tlow', 'assistTLOW'],
    ['thigh', 'assistTHIGH'], ['gas', 'assistGas'], ['compressor', 'assistCompressor'],
    ['fan', 'assistFan'], ['lastGas', 'assistLastGas'], ['gasRefills', 'assistGasRefills'],
    ['leakEvidence', 'assistLeakEvidence'], ['gasGrams', 'assistGasGrams'],
    ['history', 'assistHistory'], ['notes', 'assistNotes']
  ];

  function readForm() {
    const data = {};
    FIELD_MAP.forEach((pair) => {
      const element = document.getElementById(pair[1]);
      const value = element && typeof element.value === 'string' ? element.value.trim() : '';
      if (value) data[pair[0]] = value;
    });
    return data;
  }

  function hasBasics(data) {
    return Boolean(data && data.brand && data.model && data.year && data.issue);
  }

  function readLocalReport() {
    const box = document.getElementById('diagnosisResult');
    const text = box ? String(box.textContent || '').trim() : '';
    return text.length >= 80 ? text : '';
  }

  function currentData() {
    if (currentResult && currentResult.data) return currentResult.data;
    if (typeof window.runAircondDiagnosis === 'function') {
      try {
        const result = window.runAircondDiagnosis();
        if (result && result.data) {
          currentResult = result;
          return result.data;
        }
      } catch (error) {
        /* fall through to the DOM */
      }
    }
    return readForm();
  }

  function buildPayload(result) {
    const data = (result && result.data) || currentData();
    const localText = String((result && result.text) || (currentResult && currentResult.text) || readLocalReport() || '').slice(0, 5000);
    const caseData = Object.assign({}, data, {
      symptom: data.issue,
      symptomText: data.symptomText,
      localScreening: localText
    });
    delete caseData.name;
    return {
      brand: data.brand,
      model: data.model,
      year: data.year,
      issue: data.issue,
      caseData: caseData,
      localFindings: localText
    };
  }

  async function requestAi(result) {
    const payload = buildPayload(result);
    const endpoint = window.AMIR_AI_ENDPOINT || DEFAULT_ENDPOINT;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(data.error || ('AI tidak dapat menjana analisis (HTTP ' + response.status + ').'));
        error.status = response.status;
        throw error;
      }
      if (!data.analysis) throw new Error('AI memberi respons kosong. Cuba lagi.');
      return data;
    } catch (error) {
      if (error && error.name === 'AbortError') throw new Error('AI mengambil masa terlalu lama. Cuba lagi.');
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  function friendlyError(error) {
    const message = String((error && error.message) || '');
    if (error && (error.status === 403 || /Origin tidak dibenarkan/i.test(message))) {
      return 'Analisis AI hanya tersedia di laman rasmi https://amirtechrog.my. Jika anda membuka fail secara lokal, uji melalui laman live.';
    }
    if (error && error.status === 429) {
      return 'Kuota analisis AI percuma sedang penuh. Cuba lagi selepas satu jam atau hubungi bengkel melalui WhatsApp.';
    }
    if (error && error.status === 502) {
      return 'Servis AI percuma sedang sibuk atau kuota hariannya telah digunakan. Cuba lagi selepas beberapa jam, atau hantar laporan saringan tempatan kepada bengkel melalui WhatsApp.';
    }
    if (error && error.status === 503) {
      return 'Perkhidmatan AI belum diaktifkan pada pelayan. Sila hubungi pentadbir laman.';
    }
    if (error instanceof TypeError || /failed to fetch|networkerror|load failed/i.test(message)) {
      return 'Sambungan ke pelayan AI gagal. Semak sambungan internet anda, kemudian cuba lagi.';
    }
    return message || 'Sambungan AI gagal. Semak internet dan cuba lagi.';
  }

  function renderError(element, error) {
    const output = $('.amir-ai-output', element);
    if (!output) return;
    output.hidden = false;
    output.innerHTML = '<p class="amir-ai-error">' + escapeHtml(friendlyError(error)) + '</p>' +
      '<div class="amir-ai-actions"><button type="button" class="amir-ai-run">Cuba lagi</button>' +
      '<a class="amir-ai-copy" href="https://wa.me/60133133519" target="_blank" rel="noopener" style="text-decoration:none;display:inline-flex;align-items:center">WhatsApp bengkel</a></div>';
    $('.amir-ai-run', output).addEventListener('click', runAi);
    const runButton = $('.amir-ai-run', element);
    if (runButton && runButton !== output.querySelector('.amir-ai-run')) {
      runButton.disabled = false;
      runButton.textContent = 'Tambah analisis AI percuma';
    }
  }

  function renderSuccess(element, data) {
    const output = $('.amir-ai-output', element);
    if (!output) return;
    output.hidden = false;
    output.innerHTML = `
      <div class="amir-ai-result-head">
        <span class="amir-ai-badge">AI</span>
        <span class="amir-ai-model">${escapeHtml(data.model || 'OpenRouter · model percuma')}</span>
        <button type="button" class="amir-ai-copy">Salin</button>
        <button type="button" class="amir-ai-retry">Ulang analisis</button>
      </div>
      <div class="amir-ai-body">${renderMarkdown(data.analysis)}</div>
      <p class="amir-ai-disclaimer">Analisis AI ini bersifat panduan. Pengesahan muktamad memerlukan pemeriksaan fizikal dan spesifikasi pengeluar (OEM).</p>
    `;
    const copyButton = $('.amir-ai-copy', output);
    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(data.analysis);
        copyButton.textContent = 'Disalin';
      } catch (error) {
        copyButton.textContent = 'Salin manual';
      }
      setTimeout(() => { copyButton.textContent = 'Salin'; }, 2200);
    });
    $('.amir-ai-retry', output).addEventListener('click', runAi);
    const runButton = $('.amir-ai-run', element);
    if (runButton) {
      runButton.disabled = false;
      runButton.textContent = 'Tambah analisis AI percuma';
    }
    output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async function runAi() {
    if (Date.now() - lastRunAt < 1200) return;
    lastRunAt = Date.now();

    const data = currentData();
    if (!hasBasics(data)) {
      const element = ensurePanel();
      if (!element) return;
      element.hidden = false;
      renderError(element, new Error('Lengkapkan jenama, model, tahun dan simptom utama dahulu.'));
      return;
    }

    const element = ensurePanel();
    if (!element) return;
    element.hidden = false;

    const output = $('.amir-ai-output', element);
    const runButton = $('.amir-ai-run', element);
    if (runButton) {
      runButton.disabled = true;
      runButton.textContent = 'Menganalisis…';
    }
    if (output) {
      output.hidden = false;
      output.innerHTML = '<p class="amir-ai-spinner">AI sedang menganalisis data kenderaan anda. Biasanya 10–30 saat.</p>';
    }

    try {
      const response = await requestAi(null);
      renderSuccess(element, response);
    } catch (error) {
      renderError(element, error);
    }
  }

  function bindSite() {
    const form = document.getElementById('assistForm');
    const runButton = document.getElementById('runDiagnosis');
    if (!form && !runButton) return;

    const revealIfReady = () => {
      const data = currentData();
      if (!hasBasics(data)) return;
      reveal(null);
    };

    // The site's own handler runs first, then this reveals the AI panel.
    document.addEventListener('click', (event) => {
      if (!event.target.closest('#runDiagnosis')) return;
      setTimeout(revealIfReady, 60);
    });

    document.addEventListener('submit', (event) => {
      if (event.target !== form) return;
      setTimeout(revealIfReady, 60);
    }, true);

    const reset = (event) => {
      if (!event.target.closest('#assistForm')) return;
      if (panel) {
        panel.hidden = true;
        resetOutput();
      }
      currentResult = null;
    };
    document.addEventListener('input', reset, true);
    document.addEventListener('change', reset, true);
  }

  function init() {
    injectStyle();
    bindSite();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  // Used by the optional scan wizard after it renders a fresh summary.
  window.AmirAi = {
    mount(result) {
      currentResult = result || currentResult;
      const element = ensurePanel();
      if (!element) return;
      element.hidden = false;
      resetOutput();
    },
    buildPayload: buildPayload,
    request: requestAi,
    run: runAi
  };
})();
