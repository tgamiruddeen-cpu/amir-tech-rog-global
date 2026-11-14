# Arahan pemasangan — AMIR TECH ROG GLOBAL

## Fail aset
Muat naik tiga fail di dalam folder `assets/` ke folder `assets/` pada repositori GitHub:
- `assets/hvac-3d.js`
- `assets/hvac-3d.css`
- `assets/hero-workshop.svg`

Fail ini memulihkan fail CSS/JS 3D yang dirujuk dalam `index.html` tetapi tiada, dan poster yang dirujuk oleh 10 video.

## Pembaikan keselamatan pada index.html
Dalam `index.html`, cari butang:
`<button class="btn outline" id="openProtectedVideoFolder" type="button" aria-haspopup="dialog">Update video kerja</button>`

Gantikan dengan:
`<a class="btn outline" href="https://github.com/tgamiruddeen-cpu/amir-tech-rog-global" target="_blank" rel="noopener noreferrer">Urus video di GitHub ↗</a>`

Kemudian cari dan buang keseluruhan blok bermula:
`<div class="video-gate-backdrop" id="videoGateBackdrop" hidden>`
hingga tamat skrip yang mengandungi:
`const target='https://github.com/tgamiruddeen-cpu/amir-tech-rog-global';`
dan `input.value==='amir5037'`.
Buang juga style `.video-gate-*` dan `@keyframes gateFadeIn` / `@keyframes gatePopIn` jika mahu kemaskan CSS.

PENTING: Kata laluan lama telah ditulis dalam kod laman awam. Jangan gunakan semula kata laluan itu. Jika ia digunakan di tempat lain, tukarkannya.

## AI Tech Scan
Kod pemeriksaan AI utama sebenarnya berada dalam skrip inline `index.html` melalui fungsi `analyse()`. Jangan tambah fail `aircond-scan.js` yang lama secara membuta tuli kerana ia bergantung pada nama fungsi/struktur DOM yang tidak sepadan dengan versi semasa. Uji borang, butang `runDiagnosis` dan penghantaran WhatsApp selepas deploy.

## Supabase counter
`visitor-counter.js` menggunakan RPC Supabase `record_site_visit` dan `get_site_visit_stats`. Pakej ini tidak mengubah database/RPC kerana akses projek Supabase tidak tersedia dalam sesi ini. Jika kaunter kekal "Belum aktif", semak bahawa kedua-dua fungsi RPC wujud, pulangkan medan `total` dan `today`, serta polisi execute/grant untuk role `anon`.

## Ujian selepas upload
1. Buka laman dalam Chrome Android dan refresh tanpa cache.
2. Pergi ke bahagian Sistem 3D: pastikan model muncul, boleh diseret, slider X/Y/Z/Zum berfungsi dan butang sensor memaparkan maklumat.
3. Pergi ke Galeri: poster video sepatutnya muncul sebelum video dimainkan.
4. Tekan "Urus video di GitHub": pastikan GitHub terbuka dan minta log masuk GitHub seperti biasa.
5. Uji AI Tech Scan dengan simptom dan maklumat kereta, kemudian semak laporan dan pautan WhatsApp.
6. Semak kaunter pelawat selepas RPC Supabase disahkan.

## Skop yang belum dapat disahkan
Pakej ini membekalkan fail aset yang hilang dan arahan keselamatan. Ia tidak membuktikan status runtime laman sehingga fail dimuat naik dan diuji pada domain sebenar.
