(() => {
  const button = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  const closeMenu = () => {
    if (!button || !nav) return;
    nav.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Buka menu');
    button.firstChild.textContent = '☰ ';
  };
  if (button && nav) {
    button.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
      button.firstChild.textContent = open ? '✕ ' : '☰ ';
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }
  const quoteForm = document.getElementById('quote');
  if (quoteForm) quoteForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('nama').value.trim();
    const car = document.getElementById('kereta').value.trim();
    const issue = document.getElementById('masalah').value;
    const text = `Assalamualaikum AMIR TECH ROG GLOBAL.\nNama: ${name}\nModel kereta: ${car}\nMasalah: ${issue}\nSaya ingin bertanya harga servis/repair aircond.`;
    window.location.href = `https://wa.me/60133133519?text=${encodeURIComponent(text)}`;
  });
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  const timeNode = document.getElementById('liveClock');
  const dateNode = document.getElementById('liveDate');
  const dayNode = document.getElementById('liveDayLabel');
  const messageNode = document.getElementById('liveMessage');
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
  function updateClock() {
    const now = new Date();
    const day = Number(new Intl.DateTimeFormat('en-US', {timeZone:'Asia/Kuala_Lumpur', weekday:'numeric'}).format(now));
    const dateParts = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Kuala_Lumpur',year:'numeric',month:'2-digit',day:'2-digit'}).format(now).split('-').map(Number);
    const dayOfYear = Math.floor((Date.UTC(dateParts[0],dateParts[1]-1,dateParts[2])-Date.UTC(dateParts[0],0,0))/86400000);
    if (timeNode) timeNode.textContent = new Intl.DateTimeFormat('ms-MY',{timeZone:'Asia/Kuala_Lumpur',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(now);
    if (dateNode) dateNode.textContent = new Intl.DateTimeFormat('ms-MY',{timeZone:'Asia/Kuala_Lumpur',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(now);
    if (dayNode) dayNode.textContent = day===5 ? 'Pesanan Hari Jumaat' : 'Pesanan Hari Ini';
    if (messageNode) messageNode.textContent = day===5 ? fridayMessages[Math.floor(dayOfYear/7)%fridayMessages.length] : dailyMessages[dayOfYear%dailyMessages.length];
  }
  updateClock();
  window.setInterval(updateClock, 1000);

  const answer = document.getElementById('assistAnswer');
  const answers = {
    kurang:'Punca boleh melibatkan aliran udara, penyejukan condenser, kawalan compressor atau jumlah refrigerant. Periksa simptom dan tekanan sistem sebelum membuat keputusan. Jangan tambah gas berdasarkan tekanan sahaja.',
    idle:'Jika sejuk ketika memandu tetapi kurang sejuk ketika berhenti, periksa operasi kipas condenser/radiator, aliran udara dan tekanan ketika idle. Bacaan perlu diambil mengikut prosedur servis.',
    bau:'Punca mungkin penapis kabin, kelembapan atau kotoran pada saluran/evaporator. Mulakan dengan pemeriksaan penapis dan keadaan saliran kondensat.',
    gas:'Gas R134a dicaj RM25 setiap 100g mengikut kuantiti sebenar yang diperlukan. Kuantiti tepat mesti ikut label spesifikasi kenderaan. Flushing RM150 tidak termasuk gas dan minyak compressor.',
    harga:'Harga rujukan: flushing RM150; gas R134a RM25/100g; minyak compressor RM30/50ml. Diagnosis asas RM50. Kos akhir bergantung model, simptom, bahan dan kerja yang dipersetujui.',
    lain:'Beritahu model/tahun kereta dan simptom melalui borang pertanyaan di bawah. Maklumat dalam talian hanya panduan awal; pemeriksaan fizikal diperlukan untuk mengesahkan punca.'
  };
  document.querySelectorAll('[data-assist]').forEach(el => el.addEventListener('click', () => {
    if (answer) answer.textContent = answers[el.getAttribute('data-assist')] || answers.lain;
  }));
  const assistForm = document.getElementById('assistForm');
  if (assistForm) assistForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('assistName').value.trim();
    const car = document.getElementById('assistCar').value.trim();
    const issue = document.getElementById('assistIssue').value;
    const message = `Assalamualaikum AMIR TECH ROG GLOBAL. Saya ingin bertanya tentang aircond kereta.\nNama: ${name}\nModel/tahun kereta: ${car}\nSimptom: ${issue}\nMohon panduan pemeriksaan dan anggaran kos. Saya faham punca sebenar perlu disahkan melalui pemeriksaan.`;
    window.open('https://wa.me/60133133519?text=' + encodeURIComponent(message), '_blank', 'noopener');
  });
})();
