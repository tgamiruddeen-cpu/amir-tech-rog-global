/* AMIR TECH ROG GLOBAL 

  function updateClimateNotice() {
    const setTempSelect = document.getElementById('assistSetTemp');
    const notice = document.getElementById('amirClimateNotice');
    if (!setTempSelect || !notice) return;
    const val = setTempSelect.value;
    if (val === 'LO') {
      notice.className = 'amir-climate-notice is-lo';
      notice.innerHTML = `⚠️ <strong>AMARAN TEKNIKAL KOMPRESOR (SETTING 'LO'):</strong> Pada tetapan 'LO', ECU iklim mengunci kompresor pada beban maksimum 100% (clutch sentiasa engage atau injap ECV 100%) dan membatalkan kitaran cut-off automatik. Ketiadaan kitaran pemotongan ini menyebabkan suhu pelepasan meningkat melampau (>110°C), minyak pelincir terurai (viscosity breakdown), dan merupakan punca utama kompresor cepat jem (seizure) atau rosak pramatang. Nasihat juruteknik: Guna 'LO' 5–10 minit sahaja untuk sejukkan awal, kemudian laraskan semula ke 23°C–25°C.`;
    } else if (['22', '23', '24', '25'].includes(val)) {
      notice.className = 'amir-climate-notice is-optimal';
      notice.innerHTML = `✅ <strong>TETAPAN OPTIMUM (${val}°C):</strong> Tetapan terbaik bagi iklim tropika Malaysia. Sistem iklim akan melakukan kitaran cut-off atau modulasi strok rendah secara berkala sebaik kabin sejuk. Ini melindungi minyak pelincir kompresor, mengurangkan beban enjin, dan memanjangkan jangka hayat kompresor.`;
    } else if (val) {
      notice.className = 'amir-climate-notice is-info';
      notice.innerHTML = `ℹ️ <strong>Tetapan ${val}°C:</strong> Sistem iklim akan memantau penderia suhu kabin dan penyejat untuk mengawal kitaran operasi kompresor secara automatik.`;
    } else {
      notice.className = 'amir-climate-notice is-info';
      notice.innerHTML = `ℹ️ <strong>Kajian Kejuruteraan Kompresor:</strong> Pada tetapan <strong>LO</strong>, kebanyakan kereta tidak menjalankan kitaran cut-off kompresor (100% continuous duty cycle), menyebabkan kompresor mengalami beban melampau dan kepanasan. Tetapan <strong>23°C – 25°C</strong> membolehkan cut-off berkala dan memanjangkan jangka hayat kompresor.`;
    }
  }

  function injectClimatePanelSelector() {
    if (document.getElementById('assistClimatePanel')) return;
    const ventInput = document.getElementById('assistVentTemp');
    if (!ventInput) return;

    const parentLabel = ventInput.closest('label');
    if (!parentLabel || !parentLabel.parentElement) return;

    const wrap = document.createElement('div');
    wrap.id = 'amirClimateWrap';
    wrap.className = 'amir-climate-wrap';
    wrap.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;font-size:0.86rem;font-weight:800;color:#075f74">
        <span>🎛️ Panel Kawalan Suhu & Tetapan Digital (Climate Control)</span>
        <span style="font-size:0.68rem;padding:2px 7px;border-radius:6px;background:#0284c7;color:#fff;font-weight:900">KAJIAN TEKNIKAL</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:4px">
        <label style="font-size:0.82rem;font-weight:700;color:#1e40af">
          Jenis Panel Kawalan
          <select id="assistClimatePanel" name="climatePanel">
            <option value="digital" selected>Digital / Auto Climate Control (Suhu Boleh Laras °C)</option>
            <option value="manual">Manual (Tombol Pusingan Biru / Merah)</option>
          </select>
        </label>
        <label style="font-size:0.82rem;font-weight:700;color:#1e40af">
          Tetapan Suhu pada Panel (Set Temp)
          <select id="assistSetTemp" name="setTemp">
            <option value="">-- Pilih Suhu Tetapan Panel --</option>
            <option value="LO">❄️ LO (Maksimum Sejuk / ~16°C ke bawah) [Risiko Tiada Cut-off]</option>
            <option value="18">18 °C (Sangat Sejuk)</option>
            <option value="20">20 °C (Sejuk)</option>
            <option value="22">22 °C (Nyaman)</option>
            <option value="23">23 °C (Optimum Kitaran/Jimat Kompresor)</option>
            <option value="24">24 °C (Optimum Standard Malaysia / Jimat Petrol)</option>
            <option value="25">25 °C (Optimum Standard Tropika)</option>
            <option value="26">26 °C (Sederhana)</option>
            <option value="28">28 °C (Hangat / Jimat Tenaga)</option>
            <option value="30">30 °C / HI (Pemanas / Minimum Sejuk)</option>
          </select>
        </label>
      </div>
      <div id="amirClimateNotice" class="amir-climate-notice is-info">
        ℹ️ <strong>Kajian Kejuruteraan Kompresor:</strong> Pada tetapan <strong>LO</strong>, kebanyakan kereta tidak menjalankan kitaran cut-off kompresor (100% continuous duty cycle), menyebabkan kompresor mengalami beban berterusan dan kepanasan lampau. Laraskan suhu ke <strong>23°C – 25°C</strong> untuk membolehkan cut-off berkala dan memanjangkan jangka hayat kompresor.
      </div>
    `;

    parentLabel.insertAdjacentElement('beforebegin', wrap);

    const setTempSelect = document.getElementById('assistSetTemp');
    if (setTempSelect) {
      setTempSelect.addEventListener('change', updateClimateNotice);
    }
  }
— Analisis AI percuma & Saringan Sistem OEM
 * Memanggil Supabase Edge Function `ai-diagnosis`.
 * Mengandungi pangkalan data jenis sistem OEM (Denso, Sanden, Patco, Hanon, Calsonic Kansei, Valeo, Keihin, dll).
 * Menambah analisis fitting port HP: Discharge Line (selepas kompresor) vs Liquid Line (selepas kondenser)
 * Menambah analisis panel digital suhu boleh laras (LO, 18, 20, 22, 23, 24, 25, 26, 28, 30°C) & kesan tiada cut-off kompresor pada tetapan LO
 * mengikut kajian kejuruteraan sistem pendingin hawa automotif (SAE / MACS / Denso Technical Standards).
 * Kunci API kekal di pelayan Supabase; fail ini hanya menggunakan publishable key.
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

  /* Pangkalan data jenis sistem & pengeluar aircond OEM kenderaan di Malaysia */
  const OEM_SYSTEM_DATABASE = {
    'Perodua': {
      defaultOem: 'Denso',
      compressor: 'Fixed displacement swash plate / rotary vane',
      oil: 'ND-OIL 8 (PAG 46)',
      hpPort: 'Discharge Line (Selepas Pemampat)',
      notes: 'Sistem standard Denso OEM Jepun/Malaysia. TXV jenis blok.',
      models: {
        'Myvi': { oem: 'Denso / Sanden', compressor: 'Gen 1-2: Denso 10S11C; Gen 3: Denso / Sanden rotary scroll', oil: 'ND-OIL 8 (PAG 46) / SP-10', hpPort: 'Gen 1-2: Discharge Line; Gen 3: Liquid Line (selepas kondenser)', notes: 'Sistem asal Denso. Model Gen 3 port HP di paip cecair berhampiran bulkhead/kondenser.' },
        'Axia': { oem: 'Denso', compressor: 'Denso SV07 / 10S08C padat', oil: 'ND-OIL 8 (PAG 46)', hpPort: 'Discharge Line', notes: 'Sistem Denso kompak (~300g gas). Sangat sensitif jika kuantiti minyak atau gas terlebih/kurang.' },
        'Bezza': { oem: 'Denso', compressor: 'Denso 10S08C / SV07', oil: 'ND-OIL 8 (PAG 46)', hpPort: 'Discharge Line', notes: 'Sistem Denso penjimatan tenaga dengan penderia suhu evaporator digital.' },
        'Alza': { oem: 'Denso', compressor: 'Denso 10S13C / 10S15C (Dual Evaporator)', oil: 'ND-OIL 8 (PAG 46)', hpPort: 'Discharge Line', notes: 'Sistem Denso dengan double cooling coil (depan & bumbung belakang). Kuantiti gas ~550g-600g.' },
        'Ativa': { oem: 'Denso', compressor: 'Denso variable displacement clutchless (DNGA)', oil: 'ND-OIL 8 (PAG 46)', hpPort: 'Discharge Line / Manifold kondenser', notes: 'Sistem kawalan elektronik pintar platform DNGA Daihatsu/Perodua.' },
        'Aruz': { oem: 'Denso', compressor: 'Denso 10S15C (Dual cooling)', oil: 'ND-OIL 8 (PAG 46)', hpPort: 'Discharge Line', notes: 'Sistem Denso kabin 7 tempat duduk dengan blower belakang berasingan.' },
        'Viva': { oem: 'Denso', compressor: 'Denso SV06 / 10P08', oil: 'ND-OIL 8 (PAG 46)', hpPort: 'Discharge Line', notes: 'Sistem Denso asas, TXV blok, receiver drier bersepadu pada kondenser.' },
        'Kelisa': { oem: 'Denso / Sanden', compressor: 'Denso SV06 / Sanden APM', oil: 'ND-OIL 8 (PAG 46)', hpPort: 'Discharge Line', notes: 'Sistem Denso atau Sanden APM tempatan.' },
        'Kenari': { oem: 'Denso', compressor: 'Denso SV06 / 10P08', oil: 'ND-OIL 8 (PAG 46)', hpPort: 'Discharge Line', notes: 'Sistem Denso kompak.' },
        'Kancil': { oem: 'Denso / Sanden', compressor: 'Denso 10P08 / Sanden SD505 / APM', oil: 'ND-OIL 8 / PAG 100', hpPort: 'Discharge Line', notes: 'Model lama R12/R134a conversion, expansion valve kotak/flare.' },
        'Kembara': { oem: 'Denso', compressor: 'Denso 10P08', oil: 'ND-OIL 8 (PAG 46)', hpPort: 'Discharge Line', notes: 'Sistem pacuan 4 roda kompak Daihatsu Taruna/Terios.' },
        'Rusa': { oem: 'Denso', compressor: 'Denso 10P / Dual Evaporator', oil: 'ND-OIL 8 (PAG 46)', hpPort: 'Discharge Line', notes: 'Sistem van komersial dual blower.' }
      }
    },
    'Proton': {
      defaultOem: 'Sanden / Patco',
      compressor: 'Rotary scroll / swash plate',
      oil: 'SP-10 (PAG 46) / PAG 100',
      hpPort: 'Discharge Line (Hos pelepasan pemampat)',
      notes: 'Sistem pembekal tempatan Patco atau Sanden OEM.',
      models: {
        'Saga': { oem: 'Patco / Sanden', compressor: 'Iswara: Patco/Sanden SD507; BLM/FLX: Sanden TRSA09/SD7V16; VVT: Patco/Hanon', oil: 'SP-10 / PAG 100', hpPort: 'Discharge Line (Hos gas panas)', notes: 'Saga lama menggunakan sistem Patco/Sanden. BLM/FLX guna Sanden TRSA09. Saga VVT menggunakan Patco/Hanon.' },
        'Wira': { oem: 'Patco / Sanden', compressor: 'Patco Rotary / Sanden SD709 / TR70 / SD7B10', oil: 'PAG 100 / SP-10', hpPort: 'Discharge Line', notes: 'Sistem OEM Patco Malaysia atau Sanden. Periksa receiver drier dan suis tekanan (pressure switch).' },
        'Waja': { oem: 'Sanden / Mitsubishi', compressor: 'Sanden TRS090 / TRSE07 (Campro) / Mitsubishi (4G18)', oil: 'SP-10 (PAG 46)', hpPort: 'Discharge Line', notes: 'Kompresor Sanden scroll. Lazim berlaku masalah clutch slipping apabila enjin panas.' },
        'Persona': { oem: 'Sanden / Patco', compressor: 'Persona lama: Sanden TRSE07; Persona VVT: Sanden/Hanon', oil: 'SP-10 (PAG 46)', hpPort: 'Discharge Line', notes: 'Sistem Sanden TRSE. Periksa thermal protector dan relay magnetik.' },
        'Gen-2': { oem: 'Sanden', compressor: 'Sanden TRSE07 / TRSA09 rotary scroll', oil: 'SP-10 (PAG 46)', hpPort: 'Discharge Line', notes: 'Kompresor Sanden scroll. Kelegaan clutch perlu tepat untuk elak cut-off ketika melahu.' },
        'Iriz': { oem: 'Sanden / Hanon', compressor: 'Sanden / Hanon variable displacement', oil: 'PAG 46', hpPort: 'Discharge Line', notes: 'Sistem moden dengan sensor suhu evaporator dan kawalan ECU.' },
        'Preve': { oem: 'Sanden', compressor: 'Sanden SD7V16 variable displacement', oil: 'SP-10 (PAG 46)', hpPort: 'Discharge Line', notes: 'Kompresor Sanden variable displacement dengan internal control valve.' },
        'Suprima S': { oem: 'Sanden', compressor: 'Sanden SD7V16 variable displacement', oil: 'SP-10 (PAG 46)', hpPort: 'Discharge Line', notes: 'Sistem Sanden sama seperti Preve CFE Turbo.' },
        'Exora': { oem: 'Sanden', compressor: 'Sanden SD7V16 / TRSE09 (Dual Evaporator)', oil: 'SP-10 (PAG 46)', hpPort: 'Discharge Line', notes: 'Sistem Sanden dua cooling coil (depan & belakang). Cas gas sekitar ~700-750g.' },
        'X50': { oem: 'Hanon Systems / Valeo', compressor: 'Hanon variable displacement clutchless ECV', oil: 'PAG 46 (ND-OIL 8)', hpPort: 'Liquid Line (Selepas kondenser)', notes: 'Sistem OEM Hanon / Valeo. Port HP terletak pada paip cecair (liquid line) selepas kondenser.' },
        'X70': { oem: 'Hanon Systems / Valeo', compressor: 'Hanon / Valeo clutchless variable displacement', oil: 'PAG 46', hpPort: 'Liquid Line (Selepas kondenser)', notes: 'Sistem Hanon / Valeo dual-zone climate control. Port HP pada liquid line.' },
        'X90': { oem: 'Hanon Systems', compressor: 'Hanon elektrik 48V MHEV / Variable', oil: 'POE / PAG khusus', hpPort: 'Liquid Line', notes: 'Sistem hibrid ringan 48V. Minyak pemampat mesti mengikut spesifikasi OEM.' },
        'S70': { oem: 'Hanon Systems / Valeo', compressor: 'Hanon variable displacement', oil: 'PAG 46', hpPort: 'Liquid Line (Selepas kondenser)', notes: 'Sistem kawalan elektronik terkini segmen sedan Proton.' },
        'Perdana': { oem: 'Denso / Sanden / Keihin', compressor: 'Perdana V6: Mitsubishi/Sanden; Perdana Accord: Denso/Keihin', oil: 'ND-OIL 8 / SP-10', hpPort: 'Accord platform: Liquid Line; V6: Discharge Line', notes: 'Varian berasaskan Honda menggunakan sistem Denso/Keihin dengan port HP di liquid line.' },
        'Savvy': { oem: 'Patco / Sanden', compressor: 'Sanden SD7B10 / Patco', oil: 'PAG 100 / SP-10', hpPort: 'Discharge Line', notes: 'Sistem kompak enjin Renault D4F.' }
      }
    },
    'Toyota': {
      defaultOem: 'Denso',
      compressor: 'Denso swash plate fixed / variable',
      oil: 'ND-OIL 8 (PAG 46)',
      hpPort: 'Discharge Line (Selepas Pemampat)',
      notes: '100% sistem Denso OEM Jepun. Ketahanan tinggi dan TXV blok.',
      models: {
        'Vios': { oem: 'Denso', compressor: 'NCP42/93: 10S11C (fixed); NCP150: 5SE09C (variable); NGC102: Denso ECV', oil: 'ND-OIL 8 (PAG 46)', hpPort: 'Discharge Line', notes: 'Sistem 100% Denso OEM. Generasi baharu menggunakan variable displacement dengan solenoid valve.' },
        'Yaris': { oem: 'Denso', compressor: 'Denso 5SE09C / 10S11C', oil: 'ND-OIL 8 (PAG 46)', hpPort: 'Discharge Line', notes: 'Sistem Denso OEM. Ketahanan tinggi jika diservis flushing berkala.' },
        'Corolla Altis': { oem: 'Denso', compressor: 'Denso 6SEU16 / 5SE12 variable clutchless', oil: 'ND-OIL 8 (PAG 46)', hpPort: 'Discharge Line / Liquid Line', notes: 'Sistem Denso clutchless dengan injap kawalan elektronik ECV.' },
        'Camry': { oem: 'Denso', compressor: 'Denso 6SEU16C / 7SEU17C variable displacement', oil: 'ND-OIL 8 (PAG 46)', hpPort: 'Discharge Line / Liquid Line', notes: 'Sistem Denso luxury dual-zone climate control.' },
        'Avanza': { oem: 'Denso', compressor: 'Denso 10S11C / 10S13C (Dual Blower)', oil: 'ND-OIL 8 (PAG 46)', hpPort: 'Discharge Line', notes: 'Sistem Denso dua blower (depan & bumbung belakang). Kuantiti gas ~550g.' },
        'Innova': { oem: 'Denso', compressor: 'Denso 10S15C / 10S17C (Dual Evaporator)', oil: 'ND-OIL 8 (PAG 46)', hpPort: 'Discharge Line', notes: 'Sistem Denso tahan lasak kabin besar, kuantiti gas ~650g.' },
        'Hilux': { oem: 'Denso', compressor: 'Denso 10S15C / 10S17C heavy duty swash plate', oil: 'ND-OIL 8 (PAG 46)', hpPort: 'Discharge Line', notes: 'Sistem Denso heavy duty untuk pacuan 4 roda.' },
        'Fortuner': { oem: 'Denso', compressor: 'Denso 10S17C / 10S20C (Dual Evaporator)', oil: 'ND-OIL 8 (PAG 46)', hpPort: 'Discharge Line', notes: 'Sistem Denso dual cooling coil kabin 7 penumpang.' },
        'Alphard': { oem: 'Denso', compressor: 'Denso 7SEU17C (Petrol) / Denso Inverter Electric (Hybrid)', oil: 'ND-OIL 8 / ND-OIL 11 (Hybrid)', hpPort: 'Discharge Line (Depan) / Liquid Line', notes: 'Sistem Denso multi-zone triple cooling coil. Model Hybrid wajib guna minyak ND-OIL 11 POE dielektrik.' },
        'Vellfire': { oem: 'Denso', compressor: 'Denso 7SEU17C / Denso Inverter Electric', oil: 'ND-OIL 8 / ND-OIL 11 (Hybrid)', hpPort: 'Discharge Line (Depan) / Liquid Line', notes: 'Sistem Denso multi-zone. Jangan campur minyak PAG pada varian Hybrid.' },
        'Rush': { oem: 'Denso', compressor: 'Denso 10S13C (Dual Evaporator)', oil: 'ND-OIL 8 (PAG 46)', hpPort: 'Discharge Line', notes: 'Sistem Denso double blower.' },
        'Wish': { oem: 'Denso', compressor: 'Denso 6SEU16C variable', oil: 'ND-OIL 8 (PAG 46)', hpPort: 'Discharge Line', notes: 'Sistem Denso variable clutchless.' }
      }
    },
    'Honda': {
      defaultOem: 'Sanden / Keihin / Denso',
      compressor: 'Scroll / swash plate',
      oil: 'SP-10 (PAG 46) / SE-10Y',
      hpPort: 'Liquid Line (Selepas Kondenser / Sebelum TXV)',
      notes: 'Sistem gabungan Sanden, Keihin atau Denso. Port HP kebiasaannya pada Liquid Line.',
      models: {
        'City': { oem: 'Sanden / Keihin / Denso', compressor: 'GD8/GM2: Sanden TRS090/TRSE07; GM6/GN2: Sanden / Denso', oil: 'SP-10 / Denso ND-OIL 8', hpPort: 'Liquid Line (Paip cecair aluminium selepas kondenser ke firewall)', notes: 'Port HP terletak pada paip cecair (liquid line). Bacaan tolok normal 15-25 psi lebih rendah daripada discharge line.' },
        'Civic': { oem: 'Sanden / Keihin', compressor: 'FD/FB: Sanden TRSE07/TRSA09; FC/FE: Sanden variable / Keihin', oil: 'SP-10 (PAG 46)', hpPort: 'Liquid Line (Selepas kondenser)', notes: 'Port HP di liquid line. Jangan terkeliru dengan bacaan tekanan yang lebih rendah berbanding discharge line.' },
        'Jazz / Fit': { oem: 'Sanden / Keihin', compressor: 'Sanden TRSE07 / TRS090 / Keihin', oil: 'SP-10 (PAG 46)', hpPort: 'Liquid Line (Selepas kondenser)', notes: 'Sistem Sanden scroll padat. Port HP di liquid line.' },
        'CR-V': { oem: 'Keihin / Sanden / Denso', compressor: 'Keihin / Sanden scroll', oil: 'SP-10 / SE-10Y', hpPort: 'Liquid Line (Selepas kondenser)', notes: 'Sistem kabin sederhana. Port HP di liquid line.' },
        'HR-V': { oem: 'Sanden / Denso', compressor: 'Sanden / Denso variable', oil: 'SP-10 / ND-OIL 8', hpPort: 'Liquid Line (Selepas kondenser)', notes: 'Sistem Sanden/Denso moden dengan port HP di liquid line.' },
        'Accord': { oem: 'Denso / Keihin', compressor: 'Denso 10S17C / Keihin scroll', oil: 'ND-OIL 8 (PAG 46)', hpPort: 'Liquid Line (Selepas kondenser)', notes: 'Sistem Denso dual-zone kapasiti tinggi.' }
      }
    },
    'Nissan': {
      defaultOem: 'Calsonic Kansei / Marelli / Valeo',
      compressor: 'Variable displacement swash plate with ECV',
      oil: 'PAG 46 (Nissan Type S)',
      hpPort: 'Discharge Line (Selepas Pemampat)',
      notes: 'Sistem Calsonic Kansei / Marelli atau Valeo.',
      models: {
        'Almera': { oem: 'Calsonic Kansei / Valeo', compressor: 'Calsonic CR08 / CSV613 variable displacement with ECV', oil: 'PAG 46 (Type S)', hpPort: 'Discharge Line', notes: 'Sangat terkenal dengan kerosakan Electronic Control Valve (ECV). Gejala: panas ketika berhenti/idle, sejuk semula bila kereta bergerak laju.' },
        'Grand Livina': { oem: 'Calsonic Kansei / Valeo', compressor: 'Calsonic CR14 / CSV613 (Dual Blower)', oil: 'PAG 46', hpPort: 'Discharge Line', notes: 'Sistem Calsonic dua blower. Injap kawalan ECV dan magnetic clutch perlu diperiksa teliti.' },
        'Serena': { oem: 'Calsonic Kansei / Marelli', compressor: 'Calsonic CSV613 (Dual Evaporator)', oil: 'PAG 46 (Nissan Type S)', hpPort: 'Discharge Line', notes: 'Sistem Calsonic dua evaporator (kabin besar). Model S-Hybrid mempunyai prosedur khas.' },
        'X-Trail': { oem: 'Calsonic Kansei / Valeo', compressor: 'Calsonic DCS17 / CSV613', oil: 'PAG 46', hpPort: 'Discharge Line', notes: 'Sistem Calsonic variable displacement.' },
        'Navara': { oem: 'Calsonic Kansei / Valeo', compressor: 'Calsonic DKS17D heavy duty', oil: 'PAG 46 / PAG 100', hpPort: 'Discharge Line', notes: 'Sistem Calsonic trak pikap tahan lasak.' },
        'Sylphy': { oem: 'Calsonic Kansei', compressor: 'Calsonic CR14 / CSV613', oil: 'PAG 46', hpPort: 'Discharge Line', notes: 'Sistem Calsonic dual-zone climate control.' }
      }
    },
    'Mazda': {
      defaultOem: 'Panasonic / Denso / Sanden',
      compressor: 'Variable scroll / swash plate',
      oil: 'PAG 46 (Mazda ATM / ND-OIL 8)',
      hpPort: 'Discharge Line',
      notes: 'Sistem SkyActiv Panasonic atau Denso.',
      models: {
        'Mazda 2': { oem: 'Panasonic / Denso', compressor: 'Panasonic / Denso variable', oil: 'PAG 46', hpPort: 'Discharge Line', notes: 'Sistem Panasonic / Denso kompak.' },
        'Mazda 3': { oem: 'Panasonic / Denso', compressor: 'Panasonic scroll / Denso 6SEU', oil: 'PAG 46', hpPort: 'Discharge Line', notes: 'Sistem SkyActiv kawalan elektronik.' },
        'CX-5': { oem: 'Panasonic / Denso', compressor: 'Panasonic / Denso variable swash plate', oil: 'PAG 46', hpPort: 'Discharge Line', notes: 'Sistem SkyActiv dual-zone. Sensitif kepada kebersihan kondenser.' }
      }
    },
    'Mitsubishi': {
      defaultOem: 'Mitsubishi Heavy Industries (MHI) / Denso',
      compressor: 'MHI scroll / Denso 10PA',
      oil: 'PAG 46 / PAG 100',
      hpPort: 'Discharge Line',
      notes: 'Sistem MHI atau Denso Jepun.',
      models: {
        'Triton': { oem: 'Mitsubishi Heavy Industries (MHI)', compressor: 'MHI scroll / Denso 10PA17C', oil: 'PAG 46 / PAG 100', hpPort: 'Discharge Line', notes: 'Sistem MHI heavy duty pacuan 4 roda.' },
        'Lancer': { oem: 'Mitsubishi / Denso', compressor: 'MHI QS90 / Denso 10S', oil: 'PAG 46', hpPort: 'Discharge Line', notes: 'Sistem MHI / Denso.' },
        'ASX': { oem: 'Mitsubishi / Denso', compressor: 'MHI scroll variable', oil: 'PAG 46', hpPort: 'Discharge Line', notes: 'Sistem MHI padat.' },
        'Xpander': { oem: 'Denso / Mitsubishi', compressor: 'Denso 10S (Dual Blower)', oil: 'ND-OIL 8 (PAG 46)', hpPort: 'Discharge Line', notes: 'Sistem Denso dua blower untuk kabin 7 tempat duduk.' }
      }
    },
    'Hyundai': {
      defaultOem: 'Hanon Systems (HCC / Halla) / Doowon',
      compressor: 'VS16 / DVE16 variable swash plate',
      oil: 'PAG 46',
      hpPort: 'Discharge Line / Liquid Line',
      notes: 'Sistem Hanon (Halla) Korea dengan injap kawalan elektronik ECV.',
      models: {
        'Elantra': { oem: 'Hanon Systems (HCC)', compressor: 'Hanon VS16 variable with ECV', oil: 'PAG 46', hpPort: 'Discharge Line', notes: 'Sistem Hanon Korea dengan injap kawalan elektronik ECV.' },
        'Tucson': { oem: 'Hanon Systems (HCC)', compressor: 'Hanon VS16 / RS18', oil: 'PAG 46', hpPort: 'Discharge Line', notes: 'Sistem Hanon SUV dual climate.' },
        'Starex': { oem: 'Hanon Systems / Doowon', compressor: 'Doowon / Hanon 10PA / DVE18 (Dual Evaporator)', oil: 'PAG 46 / PAG 46', hpPort: 'Discharge Line', notes: 'Sistem kapasiti tinggi 11 tempat duduk, kuantiti gas ~850g.' }
      }
    },
    'Kia': {
      defaultOem: 'Hanon Systems (HCC / Halla) / Doowon',
      compressor: 'VS16 / DVE16 variable',
      oil: 'PAG 46',
      hpPort: 'Discharge Line / Liquid Line',
      notes: 'Sistem Hanon / Doowon Korea.',
      models: {
        'Cerato': { oem: 'Hanon Systems (HCC)', compressor: 'Hanon VS16 variable with ECV', oil: 'PAG 46', hpPort: 'Discharge Line', notes: 'Sistem Hanon ECV solenoid valve.' },
        'Sportage': { oem: 'Hanon Systems', compressor: 'Hanon VS16 variable', oil: 'PAG 46', hpPort: 'Discharge Line', notes: 'Sistem Hanon SUV.' },
        'Carnival': { oem: 'Hanon Systems / Doowon', compressor: 'Doowon / Hanon dual cooling coil', oil: 'PAG 46', hpPort: 'Discharge Line', notes: 'Sistem kabin besar multi-zone.' }
      }
    }
  };

  function lookupOemSystem(brand, model) {
    const b = String(brand || '').trim();
    const m = String(model || '').trim().toLowerCase();
    if (!b) return null;

    const brandEntry = Object.keys(OEM_SYSTEM_DATABASE).find((key) => key.toLowerCase() === b.toLowerCase());
    if (brandEntry) {
      const data = OEM_SYSTEM_DATABASE[brandEntry];
      if (m && data.models) {
        const matchedModelKey = Object.keys(data.models).find((k) => m.includes(k.toLowerCase()) || k.toLowerCase().includes(m));
        if (matchedModelKey) {
          const spec = data.models[matchedModelKey];
          return {
            brand: spec.oem,
            compressor: spec.compressor,
            oil: spec.oil,
            hpPort: spec.hpPort || data.hpPort || 'Discharge Line (Selepas Pemampat)',
            notes: spec.notes
          };
        }
      }
      return {
        brand: data.defaultOem,
        compressor: data.compressor,
        oil: data.oil,
        hpPort: data.hpPort || 'Discharge Line (Selepas Pemampat)',
        notes: data.notes
      };
    }

    const lowerB = b.toLowerCase();
    if (lowerB.includes('mercedes') || lowerB.includes('bmw') || lowerB.includes('volkswagen') || lowerB.includes('audi') || lowerB.includes('volvo')) {
      return { brand: 'Denso / Valeo / Mahle-Behr', compressor: 'Clutchless variable displacement', oil: 'PAG 46 / POE', hpPort: 'Liquid Line (Selepas Kondenser / Drier)', notes: 'Sistem kawalan elektronik kenderaan Eropah dengan port HP di liquid line.' };
    }
    if (lowerB.includes('ford')) {
      return { brand: 'Hanon Systems / Visteon', compressor: 'Variable displacement swash plate', oil: 'PAG 46', hpPort: 'Discharge Line / Liquid Line', notes: 'Sistem Hanon/Visteon.' };
    }
    if (lowerB.includes('isuzu')) {
      return { brand: 'Denso / Zexel / Valeo', compressor: 'Heavy duty swash plate', oil: 'PAG 46 / PAG 100', hpPort: 'Discharge Line', notes: 'Sistem pacuan lasak Denso / Zexel.' };
    }
    if (lowerB.includes('suzuki')) {
      return { brand: 'Denso / Seiko Seiki', compressor: 'Denso padat', oil: 'ND-OIL 8 (PAG 46)', hpPort: 'Discharge Line', notes: 'Sistem Denso Jepun.' };
    }
    if (lowerB.includes('byd') || lowerB.includes('tesla') || lowerB.includes('ora')) {
      return { brand: 'Electric Heat Pump / Inverter (Hanon/Denso)', compressor: 'Electric high-voltage scroll inverter', oil: 'POE Dielectric sahaja (ND-OIL 11)', hpPort: 'High Pressure Line (Heat Pump Chiller)', notes: 'Sistem EV Voltan Tinggi. Wajib minyak POE dielektrik tanpa sebarang pencemaran PAG.' };
    }

    return {
      brand: 'Sistem OEM / Pasaran Tempatan (Denso / Sanden / Patco)',
      compressor: 'Fixed / variable displacement',
      oil: 'PAG 46 / PAG 100',
      hpPort: 'Discharge Line (Standard)',
      notes: 'Disahkan melalui label spesifikasi atau nombor siri pemampat.'
    };
  }

  function injectStyle() {
    if (document.getElementById('amir-ai-style')) return;
    const style = document.createElement('style');
    style.id = 'amir-ai-style';
    style.textContent = `
      .amir-ai{margin:18px 0 0;padding:clamp(16px,2.6vw,22px);border:1px solid #4fb3bd;border-radius:18px;background:linear-gradient(145deg,#f2fffd,#e6f4ff);color:#17384a;box-shadow:0 16px 38px rgba(16,68,84,.16);font-family:inherit;text-align:left}
      .amir-ai[hidden]{display:none!important}
      .amir-ai *{box-sizing:border-box}
      .amir-ai-head{display:flex;gap:12px;align-items:flex-start}
      .amir-ai-orb{width:11px;height:11px;flex:0 0 auto;margin-top:7px;border-radius:50%;background:#0a9aa4;box-shadow:0 0 0 0 rgba(10,154,164,.45);animation:amirAiPulse 2s infinite}
      @keyframes amirAiPulse{0%{box-shadow:0 0 0 0 rgba(10,154,164,.45)}70%{box-shadow:0 0 0 9px rgba(10,154,164,0)}100%{box-shadow:0 0 0 0 rgba(10,154,164,0)}}
      .amir-ai-eyebrow{margin:0 0 4px;font-size:.71rem;font-weight:900;letter-spacing:.12em;color:#087d86;text-transform:uppercase}
      .amir-ai h3{margin:0;font-size:clamp(1.08rem,2.2vw,1.32rem);line-height:1.3;color:#123e57}
      .amir-ai-free{display:inline-flex;align-items:center;margin-left:auto;padding:4px 10px;border-radius:999px;background:#0a9aa4;color:#fff;font-size:.66rem;font-weight:900;letter-spacing:.1em;white-space:nowrap;box-shadow:0 6px 16px rgba(10,154,164,.3)}
      .amir-ai-help{margin:10px 0 0;color:#416273;font-size:.88rem;line-height:1.62}
      .amir-ai-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:15px}
      .amir-ai-run{border:0;border-radius:12px;padding:12px 18px;background:linear-gradient(135deg,#0a8790,#075f86);color:#fff;font:inherit;font-weight:850;cursor:pointer;box-shadow:0 8px 20px rgba(7,95,134,.22);transition:transform .15s ease,box-shadow .15s ease}
      .amir-ai-run:hover{transform:translateY(-1px);box-shadow:0 10px 24px rgba(7,95,134,.3)}
      .amir-ai-run[disabled]{opacity:.65;cursor:wait;transform:none}
      .amir-ai-cta{width:100%;font-size:1rem;padding:15px 22px;border-radius:13px;box-shadow:0 12px 26px rgba(7,95,134,.28)}
      .amir-ai-cta:hover{box-shadow:0 14px 30px rgba(7,95,134,.36)}
      .amir-ai-meta{display:flex;align-items:center;justify-content:center;gap:7px;margin:9px 0 0;color:#5b7482;font-size:.75rem;font-weight:700}
      .amir-ai-output{margin-top:16px;border-top:1px solid #cfe5e8;padding-top:14px}
      .amir-ai-output[hidden]{display:none!important}
      .amir-ai-result-head{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-bottom:10px}
      .amir-ai-badge{display:inline-flex;align-items:center;min-height:26px;padding:3px 9px;border-radius:999px;background:#075f86;color:#fff;font-size:.7rem;font-weight:900;letter-spacing:.08em}
      .amir-ai-oem-chip{display:inline-flex;align-items:center;min-height:26px;padding:3px 10px;border-radius:999px;background:#0a8790;color:#fff;font-size:.72rem;font-weight:850;letter-spacing:.04em}
      .amir-ai-model{color:#416273;font-size:.78rem;font-weight:700}
      .amir-ai-copy,.amir-ai-retry{border:1px solid #9bc9ce;border-radius:999px;background:#fff;color:#075f74;font:inherit;font-size:.78rem;font-weight:800;padding:6px 14px;cursor:pointer}
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

      /* Lencana & Kad Maklumat Sistem OEM di borang */
      .amir-oem-badge{margin:10px 0 12px;padding:10px 14px;border-radius:12px;background:linear-gradient(135deg,#e8f8f7,#f3fbff);border:1px solid #7dc7cc;color:#094e5b;font-size:.82rem;line-height:1.55;display:flex;flex-direction:column;gap:4px;box-shadow:0 3px 10px rgba(10,135,144,.08)}
      .amir-oem-badge-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
      .amir-oem-tag{display:inline-flex;align-items:center;padding:2px 8px;border-radius:6px;background:#0a8790;color:#fff;font-size:.7rem;font-weight:900;letter-spacing:.05em}
      .amir-oem-name{font-weight:850;color:#064d57;font-size:.9rem}
      .amir-oem-detail{color:#355c68;font-size:.79rem;margin:0}
      .amir-oem-detail strong{color:#08636b}
      .amir-hp-port-wrap{grid-column:1/-1;margin-top:6px;display:block;background:linear-gradient(135deg,#f0f9fa,#f8fdfe);border:1px solid #7dc7cc;border-radius:10px;padding:10px 13px;box-shadow:0 3px 10px rgba(10,135,144,.06)}

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
          <p class="amir-ai-eyebrow">AI percuma · analisis mendalam</p>
          <h3>Mahu pendapat kedua daripada AI?</h3>
        </div>
        <span class="amir-ai-free">PERCUMA</span>
      </div>
      <p class="amir-ai-help">Tekan butang di bawah untuk analisis tambahan: kemungkinan punca, spesifikasi sistem OEM (Denso/Sanden/Patco/dll), analisis port fitting HP (Discharge vs Liquid Line mengikut kajian MACS/Denso), langkah ujian dan apa yang patut disemak dahulu — berdasarkan data kenderaan anda.</p>
      <div class="amir-ai-actions">
        <button type="button" class="amir-ai-run amir-ai-cta">Dapatkan analisis AI percuma</button>
      </div>
      <p class="amir-ai-meta">Biasanya 5–30 saat · kuota percuma terhad</p>
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
      runButton.textContent = 'Dapatkan analisis AI percuma';
    }
  }

  function reveal(result) {
    if (result) currentResult = result;
    const element = ensurePanel();
    if (!element) return;
    element.hidden = false;
  }

  /* Field IDs used by the live diagnosis form */
  const FIELD_MAP = [
    ['brand', 'assistBrand'], ['model', 'assistModel'], ['year', 'assistYear'],
    ['engine', 'assistEngine'], ['systemType', 'assistSystemType'], ['systemBrand', 'assistSystemBrand'],
    ['hpPortLocation', 'assistHpPortLocation'],
    ['climatePanel', 'assistClimatePanel'],
    ['setTemp', 'assistSetTemp'],
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
    const oem = lookupOemSystem(data.brand, data.model) || { brand: 'Universal', compressor: '', oil: '', hpPort: 'Discharge Line', notes: '' };
    const effectiveSystemBrand = data.systemBrand || oem.brand;

    const hpPortVal = data.hpPortLocation || 'auto';
    const isLiquid = hpPortVal === 'liquid' || (hpPortVal === 'auto' && String(oem.hpPort || '').toLowerCase().includes('liquid line'));
    const portDesc = isLiquid ? 'Liquid Line (Selepas Kondenser / Salur Cecair)' : 'Discharge Line (Selepas Pemampat / Salur Pelepasan Gas Panas)';

    const caseData = Object.assign({}, data, {
      systemBrand: effectiveSystemBrand,
      oemCompressor: oem.compressor,
      oemOil: oem.oil,
      oemNotes: oem.notes,
      oemHpPort: oem.hpPort,
      hpPortFittingLocation: portDesc,
      hpPortType: isLiquid ? 'Liquid Line' : 'Discharge Line',
      condenserDeltaPNote: isLiquid
        ? 'Port HP diukur di Liquid Line (selepas kondenser). Mengikut kajian kejuruteraan HVAC (MACS/Denso), tolok membaca 15-25 psi lebih rendah daripada mampatan pemampat sebenar kerana kejatuhan tekanan dinamik merentasi kondenser (Condenser Pressure Drop). Julat normal pada ambien panas: 150-205 psi.'
        : 'Port HP diukur di Discharge Line (selepas kompresor). Bacaan mengukur tekanan langsung pelepasan gas panas silinder pemampat. Julat normal pada ambien panas: 175-230 psi (Maksimum had selamat: 250 psi).',
      symptom: data.issue,
      symptomText: data.symptomText,
      localScreening: localText + `\n\n[SISTEM AIRCOND OEM: ${effectiveSystemBrand} | Pemampat: ${oem.compressor} | Minyak: ${oem.oil} | Port HP Fitting: ${portDesc} | ${oem.notes}]`
    });
    delete caseData.name;

    return {
      brand: data.brand,
      model: data.model,
      year: data.year,
      issue: data.issue,
      caseData: caseData,
      localFindings: caseData.localScreening
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
    const status = error && error.status;
    const serverMessage = message && !/^AI tidak dapat menjana analisis/i.test(message);
    if (status === 403 || /Origin tidak dibenarkan/i.test(message)) {
      return 'Analisis AI hanya tersedia di laman rasmi https://amirtechrog.my. Jika anda membuka fail secara lokal, uji melalui laman live.';
    }
    if (status === 429) {
      return 'Kuota analisis AI percuma sedang penuh. Cuba lagi selepas satu jam atau hubungi bengkel melalui WhatsApp.';
    }
    if (status === 503) {
      if (/belum diaktifkan/i.test(message)) {
        return 'Perkhidmatan AI belum diaktifkan pada pelayan. Sila hubungi pentadbir laman.';
      }
      return 'Kuota AI percuma untuk hari ini telah digunakan. Cuba lagi kemudian, atau hantar laporan saringan tempatan kepada bengkel melalui WhatsApp.';
    }
    if (status === 502 || status === 504 || status === 546) {
      if (serverMessage && /sibuk|masa terlalu lama|respons kosong/i.test(message)) return message;
      return 'Servis AI percuma sedang sibuk. Cuba lagi sebentar, atau hantar laporan saringan tempatan kepada bengkel melalui WhatsApp.';
    }
    if (typeof status === 'number' && status >= 500) {
      return 'Pelayan AI sedang sibuk. Cuba lagi sebentar.';
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
      runButton.textContent = 'Dapatkan analisis AI percuma';
    }
  }

  function modelLabel(model) {
    const raw = String(model || '').trim();
    if (!raw) return 'AI percuma';
    if (raw.startsWith('groq:')) return 'AI percuma · Groq';
    if (raw.startsWith('gemini:')) return 'AI percuma · Google';
    const short = raw.replace(/:free$/, '').split('/').pop();
    return 'AI percuma · ' + short;
  }

  function renderSuccess(element, data) {
    const output = $('.amir-ai-output', element);
    if (!output) return;
    output.hidden = false;
    const formVals = readForm();
    const oem = lookupOemSystem(formVals.brand, formVals.model) || { brand: 'Sistem OEM', hpPort: 'Discharge Line' };
    const systemBrandDisplay = formVals.systemBrand || oem.brand;

    const hpPortChoice = formVals.hpPortLocation || 'auto';
    const isLiquid = hpPortChoice === 'liquid' || (hpPortChoice === 'auto' && String(oem.hpPort || '').toLowerCase().includes('liquid line'));
    const hpPortLabel = isLiquid ? 'Liquid Line' : 'Discharge Line';

    output.innerHTML = `
      <div class="amir-ai-result-head">
        <span class="amir-ai-badge">AI</span>
        <span class="amir-ai-oem-chip">⚙️ ${escapeHtml(systemBrandDisplay)}</span>
        <span class="amir-ai-oem-chip" style="background:#075f86">📍 Port HP: ${escapeHtml(hpPortLabel)}</span>
        <span class="amir-ai-model">${escapeHtml(modelLabel(data.model))}</span>
        <button type="button" class="amir-ai-copy">Salin</button>
        <button type="button" class="amir-ai-retry">Ulang analisis</button>
      </div>
      <div class="amir-ai-body">${renderMarkdown(data.analysis)}</div>
      <p class="amir-ai-disclaimer">Analisis AI ini bersifat panduan dan mengambil kira spesifikasi pengeluar sistem (Denso, Sanden, Patco, Hanon, dll) lokasi port fitting HP (Discharge Line vs Liquid Line), serta impak tetapan suhu panel digital (LO vs 23°C–25°C terhadap kitaran cut-off kompresor mengikut kajian kejuruteraan automotif). Pengesahan muktamad memerlukan pemeriksaan fizikal.</p>
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
      runButton.textContent = 'Dapatkan analisis AI percuma';
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
      output.innerHTML = '<p class="amir-ai-spinner">AI sedang menganalisis data kenderaan anda mengikut spesifikasi OEM & lokasi fitting HP (Discharge / Liquid Line). Biasanya 5–30 saat.</p>';
    }

    try {
      const response = await requestAi(null);
      renderSuccess(element, response);
    } catch (error) {
      renderError(element, error);
    }
  }

  /* Kemas kini paparan maklumat sistem OEM & Lokasi Fitting HP di borang */
  function updateOemUi() {
    const brandInput = document.getElementById('assistBrand');
    const modelInput = document.getElementById('assistModel');
    if (!brandInput) return;

    const brand = brandInput.value ? brandInput.value.trim() : '';
    const model = modelInput && modelInput.value ? modelInput.value.trim() : '';
    if (!brand) {
      const existingBadge = document.getElementById('amirOemBadge');
      if (existingBadge) existingBadge.remove();
      return;
    }

    const oem = lookupOemSystem(brand, model);
    if (!oem) return;

    let badge = document.getElementById('amirOemBadge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'amirOemBadge';
      badge.className = 'amir-oem-badge';
      const targetContainer = modelInput?.closest('label') || brandInput.closest('label');
      if (targetContainer && targetContainer.parentElement) {
        targetContainer.insertAdjacentElement('afterend', badge);
      }
    }

    badge.innerHTML = `
      <div class="amir-oem-badge-head">
        <span class="amir-oem-tag">SISTEM AIRCOND OEM</span>
        <span class="amir-oem-name">${escapeHtml(oem.brand)}</span>
      </div>
      <p class="amir-oem-detail"><strong>Pemampat:</strong> ${escapeHtml(oem.compressor)}</p>
      <p class="amir-oem-detail"><strong>Minyak Pelincir:</strong> <code>${escapeHtml(oem.oil)}</code></p>
      <p class="amir-oem-detail"><strong>Lokasi Port Fitting HP Asal:</strong> <code style="background:#e8f4f7;color:#075f74">${escapeHtml(oem.hpPort || 'Discharge Line')}</code></p>
      <p class="amir-oem-detail" style="color:#08636b;font-style:italic">${escapeHtml(oem.notes)}</p>
    `;

    // Pastikan nilai assistSystemBrand selaras jika dropdown wujud
    const systemBrandSelect = document.getElementById('assistSystemBrand');
    if (systemBrandSelect && !systemBrandSelect.dataset.userModified) {
      const matchOpt = Array.from(systemBrandSelect.options).find((opt) =>
        opt.value.toLowerCase().includes(oem.brand.toLowerCase()) ||
        oem.brand.toLowerCase().includes(opt.value.toLowerCase())
      );
      if (matchOpt) systemBrandSelect.value = matchOpt.value;
    }

    // Selaraskan assistHpPortLocation jika pengguna belum memilih secara manual
    const portSelect = document.getElementById('assistHpPortLocation');
    if (portSelect && !portSelect.dataset.userModified) {
      const hpPortStr = String(oem.hpPort || '').toLowerCase();
      if (hpPortStr.includes('liquid line') && !hpPortStr.includes('gen 1-2')) {
        portSelect.value = 'liquid';
      } else if (hpPortStr.includes('discharge line')) {
        portSelect.value = 'discharge';
      } else {
        portSelect.value = 'auto';
      }
    }
  }

  function injectSystemBrandSelector() {
    if (document.getElementById('assistSystemBrand')) return;
    const systemTypeSelect = document.getElementById('assistSystemType');
    if (!systemTypeSelect || !systemTypeSelect.parentElement) return;

    const label = document.createElement('label');
    label.innerHTML = `Jenama sistem A/C (OEM)
      <select id="assistSystemBrand" name="systemBrand">
        <option value="">Padankan automatik mengikut model</option>
        <option value="Denso">Denso (Jepun / Perodua, Toyota, Honda)</option>
        <option value="Sanden">Sanden (Jepun / Proton, Perodua, Honda)</option>
        <option value="Patco">Patco (Malaysia OEM / Proton Saga, Wira, Satria, Iswara)</option>
        <option value="Hanon Systems">Hanon Systems / HCC (Proton X50, X70, Hyundai, Kia, Ford)</option>
        <option value="Valeo">Valeo (Perancis / Proton X50/X70, Eropah, Nissan)</option>
        <option value="Calsonic Kansei">Calsonic Kansei / Marelli (Nissan Almera, Livina, Serena)</option>
        <option value="Keihin">Keihin (Jepun / Honda City, Civic, Jazz)</option>
        <option value="Mitsubishi (MHI)">Mitsubishi Heavy Industries / MHI</option>
        <option value="Delphi / Mahle">Delphi / Mahle / Behr (Continental / Universal)</option>
        <option value="Lain-lain / Khas">Lain-lain / Sistem Khas</option>
      </select>
      <small class="hint">Dipadankan automatik bila jenama/model dipilih, atau pilih manual jika pernah ditukar.</small>`;

    systemTypeSelect.parentElement.insertAdjacentElement('beforebegin', label);

    const newSelect = document.getElementById('assistSystemBrand');
    newSelect?.addEventListener('change', () => {
      newSelect.dataset.userModified = '1';
    });
  }

  /* Sisip pemilih kedudukan fitting High Pressure (Discharge vs Liquid Line) */
  function injectHpPortSelector() {
    if (document.getElementById('assistHpPortLocation')) return;
    const hpInput = document.getElementById('assistHP');
    if (!hpInput) return;

    const parentLabel = hpInput.closest('label');
    if (!parentLabel || !parentLabel.parentElement) return;

    const wrap = document.createElement('label');
    wrap.className = 'amir-hp-port-wrap';
    wrap.innerHTML = `
      <span style="font-size:0.84rem;font-weight:800;color:#075f74;display:flex;align-items:center;gap:6px">
        📍 Kedudukan Fitting HP (Tolok Tekanan Tinggi)
        <span style="font-size:0.68rem;padding:2px 6px;border-radius:4px;background:#0a8790;color:#fff;font-weight:900">KAJIAN HVAC</span>
      </span>
      <select id="assistHpPortLocation" name="hpPortLocation" style="width:100%;margin-top:5px;padding:8px 10px;border:1px solid #95ccd0;border-radius:7px;background:#fff;font:inherit;font-size:0.86rem;font-weight:750;color:#134354">
        <option value="auto">⚡ Padankan Automatik mengikut Model & Jenama</option>
        <option value="discharge">🔴 Discharge Line (Selepas Kompresor / Hos Pelepasan Gas Panas) [Standard]</option>
        <option value="liquid">🔵 Liquid Line (Selepas Kondenser / Paip Cecair ke Drier & TXV) [Honda, Eropah, X50/X70]</option>
      </select>
      <small style="display:block;margin-top:4px;color:#4c6e7a;font-size:0.75rem;line-height:1.4">
        ℹ️ <strong>Kajian Kejuruteraan (SAE/MACS):</strong> Port di <em>Liquid Line</em> membaca <strong>15–25 psi lebih rendah</strong> daripada <em>Discharge Line</em> kerana kejatuhan tekanan dinamik merentasi kondenser (Condenser Pressure Drop).
      </small>
    `;

    parentLabel.insertAdjacentElement('afterend', wrap);

    const sel = document.getElementById('assistHpPortLocation');
    if (sel) {
      sel.addEventListener('change', () => {
        sel.dataset.userModified = '1';
      });
    }
  }

  /* Perkayakan fungsi saringan tempatan laman untuk sertakan data sistem OEM & lokasi port HP */
  function patchLocalDiagnosis() {
    const origAnalyse = window.runAircondDiagnosis;
    if (typeof origAnalyse !== 'function') return;

    window.runAircondDiagnosis = function () {
      const result = origAnalyse.apply(this, arguments);
      if (!result || !result.data) return result;

      const d = result.data;
      const oem = lookupOemSystem(d.brand, d.model);
      if (!oem) return result;

      const effectiveBrand = d.systemBrand || oem.brand;
      const hpPortVal = d.hpPortLocation || 'auto';
      let isLiquid = false;
      if (hpPortVal === 'liquid') {
        isLiquid = true;
      } else if (hpPortVal === 'discharge') {
        isLiquid = false;
      } else {
        isLiquid = String(oem.hpPort || '').toLowerCase().includes('liquid line');
      }

      const hpNum = parseFloat(d.hp) || 0;
      const portDesc = isLiquid ? 'Liquid Line (Selepas Kondenser / Salur Cecair)' : 'Discharge Line (Selepas Pemampat / Salur Pelepasan Gas Panas)';
      const portPhysics = isLiquid
        ? 'Bacaan tolok di Liquid Line biasanya 15–25 psi lebih rendah daripada mampatan silinder kompresor (Discharge) disebabkan kejatuhan tekanan dinamik merentasi kondenser (Condenser Pressure Drop). Julat normal ambien 30-35°C: 150–205 psi.'
        : 'Bacaan tolok di Discharge Line mengukur terus tekanan pelepasan gas panas lampau sebelum penyejukan kondenser. Julat normal ambien 30-35°C: 175–230 psi (Maksimum had selamat: 250 psi).';

      // Sisip maklumat OEM & Lokasi Fitting HP ke dalam teks laporan jika belum ada
      if (result.text && !result.text.includes('JENIS SISTEM / PENGELUAR OEM')) {
        const insertAnchor = 'KENDERAAN\n';
        
      const currentSetTemp = d.setTemp || (document.getElementById('assistSetTemp') ? document.getElementById('assistSetTemp').value : '');
      const currentClimatePanel = d.climatePanel || (document.getElementById('assistClimatePanel') ? document.getElementById('assistClimatePanel').value : 'digital');
      let climateSection = '';
      if (currentSetTemp === 'LO') {
        climateSection = `PANEL KAWALAN IKLIM: ${currentClimatePanel === 'manual' ? 'Manual' : 'Digital / Auto Climate Control'}\nTetapan Suhu (Set Temp): LO (Maksimum Sejuk)\nAMARAN KOMPRESOR (TIADA CUT-OFF): Tetapan 'LO' membatalkan cut-off automatik kompresor (100% beban berterusan). Ini punca utama kompresor overheat (>110°C), degradasi minyak pelincir, dan kerosakan mekanikal / jem pramatang. Disyorkan guna 23°C–25°C.\n`;
      } else if (currentSetTemp) {
        climateSection = `PANEL KAWALAN IKLIM: ${currentClimatePanel === 'manual' ? 'Manual' : 'Digital / Auto Climate Control'}\nTetapan Suhu (Set Temp): ${currentSetTemp}°C (Mod kitaran berkala aktif)\n`;
      }

        const oemSection = `JENIS SISTEM / PENGELUAR OEM: ${effectiveBrand}\nSpesifikasi Pemampat: ${oem.compressor} · Minyak: ${oem.oil}\nLokasi Port Fitting HP: ${portDesc}\nNota Kejuruteraan Port HP: ${portPhysics}\nNota Sistem: ${oem.notes}\n` + climateSection;
        if (result.text.includes(insertAnchor)) {
          result.text = result.text.replace(insertAnchor, insertAnchor + oemSection);
        } else {
          result.text = oemSection + '\n' + result.text;
        }

        const box = document.getElementById('diagnosisResult');
        if (box) box.textContent = result.text;
      }

      // Sisip petunjuk teknikal OEM & Port Fitting
      if (result.technical && result.technical.cues) {
        const oemCue = `Sistem ${effectiveBrand} dikesan: sahkan minyak pelincir ${oem.oil} dan pemampat ${oem.compressor}. Port HP: ${oem.hpPort || (isLiquid ? 'Liquid Line' : 'Discharge Line')}.`;
        if (!result.technical.cues.some((c) => c.includes(effectiveBrand))) {
          result.technical.cues.unshift(oemCue);
        }

        
        if (currentSetTemp === 'LO') {
          result.technical.cues.unshift("AMARAN KRITIKAL: TETAPAN SUHU 'LO' (Beban Kompresor 100% Berterusan): Tetapan 'LO' pada panel digital membatalkan kitaran cut-off kompresor automatik. Kompresor dipaksa berkendali tanpa henti. Ini punca utama kenaikan suhu pelepasan melebihi 110°C, pemusnahan kelikatan minyak pelincir (PAG breakdown), dan kompresor cepat jem/rosak pra-matang. Sila laraskan ke 23°C–25°C.");
          if (result.priorities) {
            result.priorities.unshift("TETAPAN SUHU 'LO' DIKESAN: Elakkan memandu dengan tetapan 'LO' sepanjang masa. Laraskan ke 23°C–25°C untuk membolehkan kitaran cut-off berkala bagi melindungi kompresor daripada overheat dan kehausan bearing/piston.");
          }
        } else if (['22', '23', '24', '25'].includes(currentSetTemp)) {
          result.technical.cues.push(`TETAPAN SUHU OPTIMUM (${currentSetTemp}°C): Suhu operasi yang ideal bagi iklim tropika Malaysia. Membolehkan kompresor beroperasi dalam mod kitaran sihat (cut-off berkala atau modulasi strok rendah) yang menjimatkan bahan api dan memanjangkan jangka hayat kompresor.`);
        }

        if (isLiquid) {
          result.technical.cues.push(`FITTING HP PADA LIQUID LINE (Selepas Kondenser): Bacaan HP ${hpNum} psi telah mengalami penurunan 15–25 psi merentasi kondenser normal. Jangan tambah gas secara membuta tuli jika bacaan 160–190 psi.`);
          if (hpNum > 220) {
            result.technical.cues.push(`AMARAN TEKANAN CECAIR TINGGI: Bacaan ${hpNum} psi di Liquid Line adalah sangat tinggi — semak kebersihan kondenser, fungsi kipas, atau risiko lebihan gas.`);
          }
        } else {
          result.technical.cues.push(`FITTING HP PADA DISCHARGE LINE (Selepas Pemampat): Bacaan HP ${hpNum} psi mengukur mampatan langsung silinder gas panas pemampat.`);
          if (hpNum > 240) {
            result.technical.cues.push(`AMARAN TEKANAN PELEPASAN TINGGI: Bacaan ${hpNum} psi pada Discharge Line melebihi had selamat pemampat — semak aliran udara kondenser atau sekatan sistem.`);
          }
        }
      }

      return result;
    };
  }

  function bindSite() {
    const form = document.getElementById('assistForm');
    const runButton = document.getElementById('runDiagnosis');
    if (!form && !runButton) return;

    injectSystemBrandSelector();
    injectHpPortSelector();
    injectClimatePanelSelector();
    patchLocalDiagnosis();

    // Pantau pertukaran jenama dan model untuk kemaskini sistem OEM & lokasi port HP
    const brandInput = document.getElementById('assistBrand');
    const modelInput = document.getElementById('assistModel');
    if (brandInput) {
      brandInput.addEventListener('input', updateOemUi);
      brandInput.addEventListener('change', updateOemUi);
    }
    if (modelInput) {
      modelInput.addEventListener('input', updateOemUi);
      modelInput.addEventListener('change', updateOemUi);
    }
    updateOemUi();

    const revealIfReady = () => {
      const data = currentData();
      if (!hasBasics(data)) return;
      reveal(null);
    };

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

  window.AmirAi = {
    mount(result) {
      currentResult = result || currentResult;
      const element = ensurePanel();
      if (!element) return;
      element.hidden = false;
      resetOutput();
    },
    lookupOem: lookupOemSystem,
    buildPayload: buildPayload,
    request: requestAi,
    run: runAi
  };
})();
