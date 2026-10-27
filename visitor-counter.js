// Kaunter pelawat AMIR TECH ROG GLOBAL
// Gunakan publishable key sahaja. Jangan masukkan service_role key ke dalam browser.
const SUPABASE_URL = "https://gubkcbnjknvhtntkyrqd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Qk4tgU4mN4k5p32lVN3I_w_1VAI7cJP";

async function loadVisitorCounter() {
  const totalEl = document.getElementById("visitor-total");
  const todayEl = document.getElementById("visitor-today");
  if (!totalEl || !todayEl) return;

  const headers = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
  };

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/record_site_visit`, {
      method: "POST",
      headers,
      body: "{}"
    });
    if (!response.ok) throw new Error(`Supabase error: ${response.status}`);
    const stats = await response.json();
    totalEl.textContent = Number(stats.total ?? 0).toLocaleString("en-MY");
    todayEl.textContent = Number(stats.today ?? 0).toLocaleString("en-MY");
  } catch (error) {
    totalEl.textContent = "Tidak tersedia";
    todayEl.textContent = "Tidak tersedia";
    console.error("Kaunter pelawat gagal dimuatkan:", error);
  }
}
document.addEventListener("DOMContentLoaded", loadVisitorCounter);
