// Configure with Supabase Project URL and anon/public key.
// NEVER use a Supabase service_role key in browser code.
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

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
      method: "POST", headers, body: "{}"
    });
    if (!response.ok) throw new Error("Counter not configured");
    const stats = await response.json();
    totalEl.textContent = Number(stats.total || 0).toLocaleString("en-MY");
    todayEl.textContent = Number(stats.today || 0).toLocaleString("en-MY");
  } catch (e) {
    totalEl.textContent = "—";
    todayEl.textContent = "—";
    console.error("Visitor counter is not configured yet.", e);
  }
}
document.addEventListener("DOMContentLoaded", loadVisitorCounter);
