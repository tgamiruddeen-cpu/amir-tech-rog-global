(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);

  // Navigation menu
  const button = $('menuToggle');
  const nav = $('nav');
  const closeMenu = () => {
    if (!button || !nav) return;
    nav.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Buka menu');
    if (button.firstChild) button.firstChild.textContent = '☰ ';
  };
  if (button && nav) {
    button.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
      if (button.firstChild) button.firstChild.textContent = open ? '✕ ' : '☰ ';
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }

  // Quote form sends a prepared message to WhatsApp
  const quoteForm = $('quote');
  if (quoteForm) quoteForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('nama')?.value.trim() || '';
    const car = $('kereta')?.value.trim() || '';
    const issue = $('masalah')?.value || '';
    const text = `Assalamualaikum AMIR TECH ROG GLOBAL.\nNama: ${name}\nModel kereta: ${car}\nMasalah: ${issue}\nSaya ingin bertanya harga servis/repair aircond.`;
    window.location.href = `https://wa.me/60133133519?text=${encodeURIComponent(text)}`;
  });
  const year = $('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Malaysia time/date: weekday is derived from the date, not Intl weekday:'numeric'
  // (which is invalid in some browsers and previously stopped the entire script).
  const timeNode = $('liveClock');
  const dateNode = $('liveDate');
  const dayNode = $('liveDayLabel');
  const messageNode = $('liveMessage');
  const dailyMessages = [
    'Aircond kurang sejuk? Perhatikan bila masalah berlaku—ketika idle, semasa memandu, atau sepanjang masa. Maklumat ini membantu pemeriksaan.',
    'Jangan tambah gas berulang kali tanpa mencari punca. Jika gas berkurang, minta sistem diperiksa untuk kemungkinan kebocoran.',
    'Penapis kabin yang kotor boleh mengurangkan aliran udara. Semak mengikut keadaan dan jadual penyelenggaraan kenderaan.',
    'Jika aircond berbau, puncanya mungkin penapis kabin, kelembapan atau kotoran pada sistem. Pemeriksaan membantu tentukan tindakan sesuai.',
    'Suhu vent sahaja tidak cukup untuk mengesahkan keadaan sistem. Suhu persekitaran, aliran udara dan tekanan perlu dinilai bersama.',
    'Gunakan tetapan aircond dengan betul dan pastikan aliran udara tidak terhalang. Jika prestasi berubah ketara, buat pemeriksaan.',
    'Jaga kenderaan dengan pemeriksaan berkala. Catat simptom dan bila ia berlaku supaya diagnosis lebih terarah.'
  ];
  const fridayMessages = [
    'Salam Jumaat Mubarak. Semoga Allah mengurniakan ketenangan, kesihatan, rezeki yang halal dan keberkatan dalam setiap urusan.',
    'Ya Allah, ampunilah dosa kami, rahmatilah keluarga kami dan permudahkan urusan kami. Kurniakan rezeki yang baik dan hati yang tenang. Amin.',
    'Peringatan Jumaat: perbanyakkan selawat, membaca Surah Al-Kahfi, berdoa, bersedekah dan melakukan kebaikan mengikut kemampuan.',
    'Semoga Jumaat ini membawa rahmat dan kebaikan. Peliharalah tutur kata, eratkan silaturahim dan doakan kesejahteraan keluarga serta sahabat.'
  ];
  const weekdayNames = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
  function updateClock() {
    try {
      const now = new Date();
      const timeZone = 'Asia/Kuala_Lumpur';
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone, year: 'numeric', month: '2-digit', day: '2-digit'
      }).formatToParts(now);
      const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
      const y = Number(values.year), m = Number(values.month), d = Number(values.day);
      const dayOfYear = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 86400000);
      const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
      if (timeNode) timeNode.textContent = new Intl.DateTimeFormat('ms-MY', {
        timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      }).format(now);
      if (dateNode) dateNode.textContent = `${weekdayNames[weekday]}, ` + new Intl.DateTimeFormat('ms-MY', {
        timeZone, day: 'numeric', month: 'long', year: 'numeric'
      }).format(now);
      if (dayNode) dayNode.textContent = weekday === 5 ? 'Pesanan Hari Jumaat' : 'Pesanan Hari Ini';
      if (messageNode) messageNode.textContent = weekday === 5
        ? fridayMessages[Math.floor(dayOfYear / 7) % fridayMessages.length]
        : dailyMessages[dayOfYear % dailyMessages.length];
    } catch (error) {
      // Keep a useful fallback visible instead of leaving a permanent loading label.
      const localNow = new Date();
      if (timeNode) timeNode.textContent = localNow.toLocaleTimeString('ms-MY', { hour12: false });
      if (dateNode) dateNode.textContent = localNow.toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + ' (masa peranti)';
      if (messageNode) messageNode.textContent = 'Jam menggunakan masa peranti kerana zon masa Malaysia tidak dapat dibaca pada pelayar ini.';
      console.error('Jam Malaysia gagal dimuatkan:', error);
    }
  }
  updateClock();
  window.setInterval(updateClock, 1000);

  // Quick-reference topics. This is a rule-based guide, not a remote generative AI service.
  const answer = $('assistAnswer');
  const answers = {
    kurang: 'Punca yang mungkin: aliran udara cabin lemah, condenser kurang dibuang haba, kipas condenser bermasalah, kuantiti refrigerant tidak tepat, sensor/kawalan atau prestasi compressor. Periksa blower/filter, kipas, suhu vent serta tekanan HP/LP mengikut prosedur. Jangan terus tambah gas berdasarkan tekanan sahaja.',
    idle: 'Jika sejuk semasa bergerak tetapi panas ketika berhenti, antara punca utama ialah kipas condenser/radiator atau aliran udara tidak mencukupi ketika idle. Periksa kelajuan kipas, arah aliran udara, kebersihan condenser dan bacaan HP ketika idle berbanding RPM dinaikkan.',
    bau: 'Punca mungkin penapis kabin, kelembapan/kotoran pada evaporator atau saliran kondensat tersumbat. Periksa penapis, saliran dan keadaan evaporator. Bau seperti hangit atau wayar terbakar: matikan sistem dan periksa segera.',
    gas: 'Gas R134a dicaj RM25 setiap 100g mengikut kuantiti sebenar yang diperlukan. Kuantiti tepat mesti ikut label spesifikasi kenderaan. Jika gas berkurang berulang kali, buat ujian kebocoran dahulu. Flushing RM150 tidak termasuk gas dan minyak compressor.',
    harga: 'Harga rujukan: flushing RM150; gas R134a RM25/100g; minyak compressor RM30/50ml; diagnosis asas RM50. Kos akhir bergantung model, bahan dan kerja yang dipersetujui. Kuantiti refrigerant dan minyak ikut spesifikasi kenderaan.',
    lain: 'Masukkan model/tahun kereta dan pilih simptom pada borang di bawah, kemudian tekan Analisis simptom sekarang. Panduan ini tidak boleh mengesahkan komponen rosak tanpa pemeriksaan dan ukuran sebenar.'
  };
  document.querySelectorAll('[data-assist]').forEach(el => el.addEventListener('click', () => {
    if (answer) answer.textContent = answers[el.getAttribute('data-assist')] || answers.lain;
  }));

  // Symptom triage: probable causes + physical checks, without claiming a definitive diagnosis.
  const diagnosisRules = {
    'Kurang sejuk sepanjang masa': {
      causes: 'Kuantiti refrigerant tidak tepat/kebocoran, condenser kotor atau kurang aliran udara, kipas lemah, expansion valve tersumbat, sensor kawalan atau compressor kurang prestasi.',
      checks: 'Periksa kipas dan kebersihan condenser; ukur suhu vent dan suhu persekitaran; semak tekanan HP/LP pada keadaan operasi yang ditetapkan; sahkan kuantiti refrigerant mengikut label. Buat leak test jika disyaki gas berkurang.',
      caution: 'Tekanan sahaja tidak cukup untuk memutuskan gas kurang atau compressor rosak.'
    },
    'Sejuk ketika memandu sahaja': {
      causes: 'Paling perlu disemak ialah kipas condenser/radiator, aliran udara condenser dan kenaikan tekanan ketika idle.',
      checks: 'Pastikan semua kipas beroperasi pada kelajuan yang sepatutnya; periksa relay, fius, motor kipas dan condenser tersumbat; bandingkan HP/LP serta suhu vent pada idle dan ketika RPM dinaikkan secara terkawal.',
      caution: 'Jangan terus menutup ruang aliran udara radiator atau menukar komponen tanpa bacaan.'
    },
    'Langsung tidak sejuk': {
      causes: 'Kemungkinan compressor tidak engage, masalah fius/relay/pendawaian, tekanan refrigerant di luar julat kawalan, kebocoran, masalah sensor atau kerosakan mekanikal.',
      checks: 'Periksa fius/relay dan arahan A/C melalui scanner jika ada; pastikan kipas bekerja; rekod sama ada compressor clutch/valve menerima arahan; ukur tekanan sistem dengan alat sesuai dan periksa kebocoran.',
      caution: 'Jangan pintaskan pressure switch atau membekalkan kuasa terus kepada compressor tanpa prosedur dan perlindungan.'
    },
    'Sejuk sekejap kemudian panas': {
      causes: 'Kemungkinan evaporator membeku, aliran blower lemah, sensor suhu/evaporator, expansion valve atau kawalan compressor berselang.',
      checks: 'Perhatikan sama ada angin blower makin perlahan selepas beberapa minit; periksa filter cabin, suhu paip/evaporator, sensor serta corak cut-in/cut-out compressor.',
      caution: 'Jangan terus menambah refrigerant sebelum punca kitaran suhu disahkan.'
    },
    'Kipas blower perlahan / tiada angin': {
      causes: 'Filter cabin tersumbat, blower motor/terminal lemah, resistor atau modul kawalan blower, fius atau saluran udara tersumbat.',
      checks: 'Uji semua tahap kelajuan blower; periksa filter cabin, fius, voltan dan ground motor; periksa soket panas/longgar serta modul kelajuan.',
      caution: 'Jika ada bau hangit atau soket cair, hentikan penggunaan blower dan periksa pendawaian.'
    },
    'Compressor tidak hidup / tidak engage': {
      causes: 'Arahan A/C tidak diterima, fius/relay/wayar, pressure switch/sensor, tekanan refrigerant tidak sesuai, coil clutch atau compressor; reka bentuk sesetengah kereta menggunakan compressor variable displacement yang tidak semestinya mempunyai clutch jelas.',
      checks: 'Baca data A/C request dan pressure sensor melalui scanner jika boleh; periksa fius/relay dan bekalan/ground mengikut wiring diagram; ukur tekanan sistem dan periksa litar clutch/valve mengikut spesifikasi.',
      caution: 'Jangan bypass sensor keselamatan atau uji litar tanpa wiring diagram model berkenaan.'
    },
    'Aircond sejuk waktu malam sahaja': {
      causes: 'Beban haba tinggi pada siang hari, condenser/kipas kurang cekap, aliran udara lemah atau keadaan refrigerant/kawalan tidak optimum.',
      checks: 'Bandingkan suhu sekitar, vent, tekanan HP/LP dan operasi kipas dalam keadaan yang sama; periksa condenser, shroud dan kelajuan kipas.',
      caution: 'Catat suhu sekitar dan keadaan ujian kerana perbandingan siang/malam sahaja belum cukup untuk diagnosis.'
    },
    'Aircond sejuk sebelah sahaja': {
      causes: 'Kemungkinan pintu campuran udara/actuator, sensor cabin, sekatan aliran atau pada sistem tertentu tekanan/kuantiti refrigerant tidak sesuai.',
      checks: 'Bandingkan suhu vent kiri/kanan dengan tetapan yang sama; periksa actuator blend door dan kod kerosakan; semak sistem refrigerant ikut spesifikasi model.',
      caution: 'Punca berbeza antara sistem single-zone dan dual-zone.'
    },
    'Paip atau evaporator berais': {
      causes: 'Aliran udara rendah, filter/evaporator tersumbat, kawalan suhu/sensor, expansion valve atau keadaan refrigerant tidak betul.',
      checks: 'Periksa aliran blower dan filter; rekod bila ais terbentuk dan sama ada aliran angin turun; semak bacaan sensor evaporator dan tekanan dengan prosedur pengeluar.',
      caution: 'Matikan A/C jika ais banyak terbentuk dan dapatkan pemeriksaan; jangan korek ais pada evaporator.'
    },
    'Aircond berair dalam kabin': {
      causes: 'Saliran kondensat tersumbat/tercabut, hos saliran salah kedudukan atau kebocoran air dari sistem badan kenderaan.',
      checks: 'Periksa sama ada air keluar dari drain bawah kereta ketika A/C beroperasi; periksa hos dan tray evaporator serta kesan air pada karpet.',
      caution: 'Jika air masuk dekat pendawaian atau modul elektronik, elakkan penggunaan sehingga diperiksa.'
    },
    'Aircond berbau': {
      causes: 'Filter cabin kotor, kelembapan/kotoran evaporator atau saliran kondensat tersumbat; bau hangit boleh menandakan isu elektrik.',
      checks: 'Periksa filter, saliran kondensat dan keadaan evaporator; kenal pasti sama ada bau masam/lembap atau hangit.',
      caution: 'Bau hangit atau asap memerlukan sistem dimatikan dan pemeriksaan segera.'
    },
    'Bunyi luar biasa': {
      causes: 'Bunyi boleh berpunca daripada blower, bearing/pulley compressor, clutch, kipas atau komponen yang longgar.',
      checks: 'Catat sama ada bunyi muncul bila A/C ON, berubah ikut RPM, atau datang dari dashboard/ruang enjin; pemeriksaan tali sawat, pulley dan kipas perlu dilakukan dengan selamat.',
      caution: 'Jika bunyi kuat, geseran logam atau tali sawat bergoyang, matikan A/C dan periksa segera.'
    },
    'Nak buat flushing / servis': {
      causes: 'Flushing bukan rawatan untuk semua masalah; keperluannya bergantung kepada pencemaran dan prosedur pengeluar.',
      checks: 'Sahkan sejarah kerosakan compressor, jenis sistem, jenis minyak dan prosedur flushing yang diluluskan; komponen yang tidak boleh diflush mungkin perlu diganti.',
      caution: 'Harga flushing asas RM150; gas R134a dan minyak compressor dikira berasingan.'
    },
    'Lain-lain / perlukan pemeriksaan': {
      causes: 'Maklumat simptom belum cukup untuk menyenaraikan punca yang lebih khusus.',
      checks: 'Catat bila berlaku, suhu vent, suhu luar, keadaan idle/memandu, operasi kipas, bunyi dan sebarang lampu amaran; lakukan pemeriksaan fizikal dan bacaan tekanan yang sesuai.',
      caution: 'Jangan membuat keputusan menukar komponen berdasarkan simptom tunggal.'
    }
  };

  const runDiagnosis = $('runDiagnosis');
  const diagnosisResult = $('diagnosisResult');
  if (runDiagnosis && diagnosisResult) runDiagnosis.addEventListener('click', () => {
    const car = $('assistCar')?.value.trim() || '';
    const issue = $('assistIssue')?.value || '';
    diagnosisResult.classList.add('show');
    if (!car || !issue) {
      diagnosisResult.textContent = 'Sila masukkan model/tahun kereta dan pilih simptom utama dahulu. Selepas itu tekan “Analisis simptom sekarang”.';
      return;
    }
    const rule = diagnosisRules[issue] || diagnosisRules['Lain-lain / perlukan pemeriksaan'];
    diagnosisResult.textContent = `SARINGAN SIMPTOM — ${car}\n\nSimptom dipilih: ${issue}\n\nPunca yang mungkin:\n${rule.causes}\n\nPemeriksaan dicadangkan:\n${rule.checks}\n\nPeringatan keselamatan:\n${rule.caution}\n\nKeputusan ini ialah kemungkinan awal, bukan pengesahan komponen rosak. Bengkel perlu mengesahkan dengan pemeriksaan dan bacaan sebenar.`;
  });

  const assistForm = $('assistForm');
  if (assistForm) assistForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('assistName')?.value.trim() || '';
    const car = $('assistCar')?.value.trim() || '';
    const issue = $('assistIssue')?.value || '';
    const message = `Assalamualaikum AMIR TECH ROG GLOBAL. Saya ingin bertanya tentang aircond kereta.\nNama: ${name}\nModel/tahun kereta: ${car}\nSimptom: ${issue}\nMohon panduan pemeriksaan dan anggaran kos. Saya faham punca sebenar perlu disahkan melalui pemeriksaan.`;
    window.location.href = 'https://wa.me/60133133519?text=' + encodeURIComponent(message);
  });

  // V7: password gate for the convenience upload button.
  // IMPORTANT: front-end passwords can be read from source and are not real security.
  const openVideoAdmin = $('openVideoAdmin');
  const videoAdminPanel = $('videoAdminPanel');
  const videoAdminPassword = $('videoAdminPassword');
  const unlockVideoUpload = $('unlockVideoUpload');
  const videoAdminMessage = $('videoAdminMessage');
  if (openVideoAdmin && videoAdminPanel) {
    openVideoAdmin.addEventListener('click', () => {
      videoAdminPanel.hidden = !videoAdminPanel.hidden;
      if (!videoAdminPanel.hidden) videoAdminPassword?.focus();
    });
  }
  if (unlockVideoUpload && videoAdminPassword) {
    unlockVideoUpload.addEventListener('click', () => {
      // User-selected UI passcode. This is only a convenience gate, not authentication.
      if (videoAdminPassword.value === 'Amir5037') {
        if (videoAdminMessage) videoAdminMessage.textContent = 'Kata laluan diterima. Membuka halaman GitHub...';
        window.open('https://github.com/tgamiruddeen-cpu/amir-tech-rog-global/upload/main/assets', '_blank', 'noopener');
      } else {
        if (videoAdminMessage) videoAdminMessage.textContent = 'Kata laluan tidak betul. Cuba semula.';
        videoAdminPassword.value = '';
        videoAdminPassword.focus();
      }
    });
    videoAdminPassword.addEventListener('keydown', event => {
      if (event.key === 'Enter') unlockVideoUpload.click();
    });
  }

})();
