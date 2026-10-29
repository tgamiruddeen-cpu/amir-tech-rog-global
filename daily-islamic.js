(() => {
  const hadiths = [
    { text: 'Nilai amalan bergantung pada niat di sebaliknya.', source: 'Sahih al-Bukhari 1', url: 'https://sunnah.com/bukhari:1' },
    { text: 'Muslim ialah orang yang kaum Muslimin selamat daripada lidah dan tangannya.', source: 'Sahih al-Bukhari 10', url: 'https://sunnah.com/bukhari:10' },
    { text: 'Permudahkanlah, jangan menyusahkan; sampaikan berita gembira dan jangan menjauhkan orang.', source: 'Sahih al-Bukhari 69', url: 'https://sunnah.com/bukhari:69' },
    { text: 'Berkatalah yang baik atau diam, dan jangan menyakiti jiran.', source: 'Sahih al-Bukhari 6018', url: 'https://sunnah.com/bukhari:6018' },
    { text: 'Jangan marah.', source: 'Sahih al-Bukhari 6116', url: 'https://sunnah.com/bukhari:6116' },
    { text: 'Amalan yang paling dicintai Allah ialah yang berterusan walaupun sedikit.', source: 'Sahih al-Bukhari 6464', url: 'https://sunnah.com/bukhari:6464' },
    { text: 'Allah memudahkan jalan ke syurga bagi orang yang menempuh jalan mencari ilmu.', source: 'Sahih Muslim 2699a', url: 'https://sunnah.com/muslim:2699a' }
  ];
  const byId = (id) => document.getElementById(id);
  const timeFields = {
    Fajr: 'prayerFajr',
    Dhuhr: 'prayerDhuhr',
    Asr: 'prayerAsr',
    Maghrib: 'prayerMaghrib',
    Isha: 'prayerIsha'
  };

  let selectedLocation = null;

  function updateHadithForToday() {
    const now = new Date();
    const dayOfYear = Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(now.getFullYear(), 0, 1)) / 86400000);
    const hadith = hadiths[dayOfYear % hadiths.length];
    const message = byId('liveMessage');
    const link = byId('liveHadithLink');
    if (message) message.textContent = hadith.text;
    if (link) {
      link.textContent = `${hadith.source} ↗`;
      link.href = hadith.url;
    }
  }

  function localDateForApi() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${day}-${month}-${now.getFullYear()}`;
  }

  function showLocationStatus(text, isError = false) {
    const status = byId('prayerStatus');
    if (!status) return;
    status.textContent = text;
    status.classList.toggle('is-error', isError);
  }

  function displayTime(value) {
    const match = String(value || '').match(/\d{1,2}:\d{2}/);
    return match ? match[0].padStart(5, '0') : '—';
  }

  async function loadTimings(url, locationLabel) {
    showLocationStatus('Sedang mendapatkan jadual waktu solat…');
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Prayer API returned ${response.status}`);
    const result = await response.json();
    if (result.code !== 200 || !result.data || !result.data.timings) throw new Error('Prayer times unavailable');

    for (const [apiName, elementId] of Object.entries(timeFields)) {
      const field = byId(elementId);
      if (field) field.textContent = displayTime(result.data.timings[apiName]);
    }
    const timezone = result.data.meta && result.data.meta.timezone;
    const method = result.data.meta && result.data.meta.method && result.data.meta.method.name;
    const details = [locationLabel, timezone ? `zon ${timezone}` : '', method ? `kaedah ${method}` : ''].filter(Boolean).join(' · ');
    showLocationStatus(`Waktu hari ini: ${details}.`);
    const manual = byId('prayerManual');
    if (manual) manual.open = false;
  }

  function requestGpsPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolokasi tidak disokong oleh pelayar ini.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 12000,
        maximumAge: 3600000
      });
    });
  }

  function readableLocationError(error) {
    if (error && error.code === 1) return 'Kebenaran lokasi ditolak. Masukkan bandar dan negara secara manual.';
    if (error && error.code === 2) return 'Lokasi tidak dapat dikenal pasti. Cuba lagi atau masukkan bandar dan negara.';
    if (error && error.code === 3) return 'Permintaan lokasi tamat masa. Cuba lagi atau masukkan bandar dan negara.';
    return 'Lokasi atau waktu solat tidak dapat dimuatkan. Cuba semula atau masukkan bandar dan negara.';
  }

  async function loadByGps() {
    const button = byId('prayerLocate');
    if (button) button.disabled = true;
    try {
      const position = await requestGpsPosition();
      const latitude = position.coords.latitude.toFixed(5);
      const longitude = position.coords.longitude.toFixed(5);
      selectedLocation = { type: 'gps', latitude, longitude };
      const date = localDateForApi();
      const url = `https://api.aladhan.com/v1/timings/${date}?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`;
      await loadTimings(url, 'lokasi GPS anda');
    } catch (error) {
      showLocationStatus(readableLocationError(error), true);
      const manual = byId('prayerManual');
      if (manual) manual.open = true;
    } finally {
      if (button) button.disabled = false;
    }
  }

  function bindPrayerControls() {
    const button = byId('prayerLocate');
    const form = byId('prayerCityForm');
    const cityInput = byId('prayerCity');
    const countryInput = byId('prayerCountry');
    if (button) button.addEventListener('click', loadByGps);
    if (form) form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const city = cityInput && cityInput.value.trim();
      const country = countryInput && countryInput.value.trim();
      if (!city || !country) return;
      selectedLocation = { type: 'city', city, country };
      const submit = form.querySelector('button[type="submit"]');
      if (submit) submit.disabled = true;
      try {
        const url = new URL(`https://api.aladhan.com/v1/timingsByCity/${localDateForApi()}`);
        url.searchParams.set('city', city);
        url.searchParams.set('country', country);
        await loadTimings(url.toString(), `${city}, ${country}`);
      } catch (error) {
        showLocationStatus('Waktu solat untuk bandar ini gagal dimuatkan. Semak ejaan bandar/negara atau cuba lokasi GPS.', true);
      } finally {
        if (submit) submit.disabled = false;
      }
    });

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((permission) => {
        if (permission.state === 'granted') loadByGps();
      }).catch(() => {});
    }
  }

  async function refreshPrayerTimesForNewDate() {
    if (!selectedLocation) return;
    const date = localDateForApi();
    try {
      if (selectedLocation.type === 'gps') {
        const url = 'https://api.aladhan.com/v1/timings/' + date + '?latitude=' + encodeURIComponent(selectedLocation.latitude) + '&longitude=' + encodeURIComponent(selectedLocation.longitude);
        await loadTimings(url, 'lokasi GPS anda');
      } else {
        const url = new URL('https://api.aladhan.com/v1/timingsByCity/' + date);
        url.searchParams.set('city', selectedLocation.city);
        url.searchParams.set('country', selectedLocation.country);
        await loadTimings(url.toString(), selectedLocation.city + ', ' + selectedLocation.country);
      }
    } catch (error) {
      showLocationStatus('Waktu solat untuk tarikh baharu gagal dimuatkan. Cuba muat semula halaman.', true);
    }
  }

  updateHadithForToday();
  let checkedDate = localDateForApi();
  setInterval(() => {
    updateHadithForToday();
    const today = localDateForApi();
    if (today !== checkedDate) {
      checkedDate = today;
      refreshPrayerTimesForNewDate();
    }
  }, 60000);
  bindPrayerControls();
})();
