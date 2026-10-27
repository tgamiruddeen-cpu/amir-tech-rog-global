// Kaunter lawatan AMIR TECH ROG GLOBAL
// Menggunakan Supabase publishable key sahaja. Jangan masukkan service_role key ke dalam browser.
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
    const alreadyCounted = sessionStorage.getItem("amirtech_visit_counted") === "1";
    const rpcName = alreadyCounted ? "get_site_visit_stats" : "record_site_visit";
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${rpcName}`, {
      method: "POST", headers, body: "{}"
    });
    if (!response.ok) throw new Error(`Supabase error: ${response.status}`);
    const data = await response.json();
    const stats = Array.isArray(data) ? data[0] : data;
    if (!alreadyCounted) sessionStorage.setItem("amirtech_visit_counted", "1");
    totalEl.textContent = Number(stats.total ?? 0).toLocaleString("ms-MY");
    todayEl.textContent = Number(stats.today ?? 0).toLocaleString("ms-MY");
  } catch (error) {
    totalEl.textContent = "Belum aktif";
    todayEl.textContent = "Belum aktif";
    console.error("Kaunter pelawat gagal dimuatkan:", error);
  }
}
document.addEventListener("DOMContentLoaded", loadVisitorCounter);
