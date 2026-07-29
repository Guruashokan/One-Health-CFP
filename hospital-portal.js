/* ═══════════════════════════════════════════════════
   ONE HEALTH PLATFORM — Hospital Staff Portal Logic
   ═══════════════════════════════════════════════════ */

/* ── Demo credentials ── */
const DEMO_STAFF_ID = "staff";
const DEMO_PASSWORD = "health123";
const HOSPITAL_STORAGE_KEY = "ohp_location_hospitals";

/* ── Hospital default data ── */
const HOSPITAL_DATA = {
  "CityCare Hospital": {
    beds: 42, totalBeds: 120, icu: 8, oxygen: true,
    resources: [
      { name:"General Beds", current:42, total:120 },
      { name:"ICU Beds",     current:8,  total:20  },
      { name:"Oxygen Beds",  current:12, total:30  },
      { name:"Ventilators",  current:5,  total:10  },
    ],
    inventory: [
      { name:"Paracetamol 500mg",  category:"Analgesic",    stock:320, threshold:50  },
      { name:"Insulin (vials)",    category:"Diabetes",      stock:18,  threshold:25  },
      { name:"Amoxicillin 500mg",  category:"Antibiotic",    stock:145, threshold:40  },
      { name:"Salbutamol Inhaler", category:"Respiratory",   stock:9,   threshold:15  },
      { name:"ORS Sachets",        category:"Hydration",     stock:7,   threshold:20  },
      { name:"Oxygen Cylinders",   category:"Respiratory",   stock:3,   threshold:10  },
      { name:"IV Saline 500ml",    category:"IV Fluid",      stock:80,  threshold:30  },
      { name:"Metformin 500mg",    category:"Diabetes",      stock:210, threshold:50  },
    ],
    staff: [
      { name:"Dr. Asha Menon",    role:"Cardiologist",   color:"#1a56db", on:true  },
      { name:"Dr. Raj Kumar",     role:"Emergency",      color:"#ef4444", on:true  },
      { name:"Nurse Priya",       role:"Head Nurse",     color:"#059669", on:true  },
      { name:"Nurse Arun",        role:"ICU Nurse",      color:"#059669", on:false },
      { name:"Dr. Sushma",        role:"General Medicine",color:"#7c3aed", on:true  },
      { name:"Admin Leena",       role:"Receptionist",   color:"#f59e0b", on:true  },
    ],
  },
  "GreenLine Clinic": {
    beds:11, totalBeds:40, icu:0, oxygen:true,
    resources: [
      { name:"General Beds", current:11, total:40 },
      { name:"Oxygen Beds",  current:4,  total:10 },
    ],
    inventory: [
      { name:"Paracetamol 500mg",  category:"Analgesic",   stock:150, threshold:30 },
      { name:"ORS Sachets",        category:"Hydration",    stock:45,  threshold:20 },
      { name:"Amoxicillin 500mg",  category:"Antibiotic",   stock:60,  threshold:20 },
    ],
    staff: [
      { name:"Dr. Kiran Rao",   role:"General Medicine", color:"#1a56db", on:true  },
      { name:"Dr. Meera Shah",  role:"Pediatrics",       color:"#7c3aed", on:true  },
      { name:"Nurse Divya",     role:"Staff Nurse",      color:"#059669", on:false },
    ],
  },
  "Hope Multispeciality": {
    beds:28, totalBeds:85, icu:5, oxygen:true,
    resources: [
      { name:"General Beds", current:28, total:85 },
      { name:"ICU Beds",     current:5,  total:12 },
      { name:"OT Available", current:2,  total:4  },
    ],
    inventory: [
      { name:"Paracetamol 500mg",  category:"Analgesic",    stock:200, threshold:40 },
      { name:"Metformin 500mg",    category:"Diabetes",      stock:90,  threshold:30 },
      { name:"IV Saline 500ml",    category:"IV Fluid",      stock:55,  threshold:20 },
      { name:"Oxygen Cylinders",   category:"Respiratory",   stock:6,   threshold:8  },
    ],
    staff: [
      { name:"Dr. Farhan Ali",  role:"Orthopedics",    color:"#1a56db", on:true  },
      { name:"Dr. Nisha Patel", role:"Neurology",      color:"#7c3aed", on:true  },
      { name:"Nurse Kavitha",   role:"OT Nurse",       color:"#059669", on:true  },
      { name:"Admin Ravi",      role:"Receptionist",   color:"#f59e0b", on:false },
    ],
  },
  "Sunrise Senior Care": {
    beds:19, totalBeds:60, icu:3, oxygen:false,
    resources: [
      { name:"General Beds",     current:19, total:60 },
      { name:"ICU Beds",         current:3,  total:8  },
      { name:"Wheelchair Units", current:10, total:15 },
    ],
    inventory: [
      { name:"Paracetamol 500mg",  category:"Analgesic",    stock:180, threshold:40 },
      { name:"Metformin 500mg",    category:"Diabetes",      stock:120, threshold:35 },
      { name:"Amlodipine 5mg",     category:"Cardiology",    stock:85,  threshold:30 },
    ],
    staff: [
      { name:"Dr. Priya Suresh", role:"Geriatrics",     color:"#1a56db", on:true  },
      { name:"Nurse Kamala",     role:"Senior Care",    color:"#059669", on:true  },
      { name:"Physio Ram",       role:"Physiotherapy",  color:"#f59e0b", on:false },
    ],
  },
};

/* ── State ── */
let currentHospital = null;
let currentRole     = null;
let currentStaff    = null;
let patientQueue    = [];
let patientIdCounter = 1;
let toastTimer      = null;
let activeHospitalNames = new Set();

/* ── DOM helpers ── */
const $  = id  => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

function stableHash(value) {
  let hash = 2166136261;
  for (let i = 0; i < String(value).length; i++) {
    hash ^= String(value).charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function calculateDistanceKm(lat1, lng1, lat2, lng2) {
  const radius = 6371;
  const deltaLat = (lat2 - lat1) * Math.PI / 180;
  const deltaLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(deltaLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function createPortalHospitalData(hospital, linkedDoctors = []) {
  const seed = stableHash(`${hospital.name}|${hospital.lat}|${hospital.lng}`);
  const totalBeds = Math.max(20, Number(hospital.totalBeds) || 60 + (seed % 120));
  const beds = clamp(Number(hospital.beds) || 12 + (seed % Math.max(12, totalBeds - 12)), 0, totalBeds);
  const icuTotal = Math.max(4, Math.round(totalBeds * 0.16));
  const icu = clamp(Number(hospital.icu) || seed % (icuTotal + 1), 0, icuTotal);
  const oxygenTotal = Math.max(6, Math.round(totalBeds * 0.28));
  const oxygenBeds = hospital.oxygen === false ? 0 : clamp(Math.round(beds * 0.28), 1, oxygenTotal);
  const staff = linkedDoctors.map((doctor, index) => ({
    name: doctor.name,
    role: doctor.specialty || "24/7 doctor help",
    color: ["#1a56db", "#7c3aed", "#059669", "#ef4444"][index % 4],
    on: true
  }));

  if (!staff.length) {
    staff.push(
      { name: "24/7 Doctor Help", role: "Emergency support", color: "#ef4444", on: true },
      { name: "Nursing Desk", role: "Staff nurse", color: "#059669", on: true },
      { name: "Reception Desk", role: "Patient services", color: "#f59e0b", on: true }
    );
  }

  return {
    beds,
    totalBeds,
    icu,
    oxygen: hospital.oxygen !== false,
    resources: [
      { name: "General Beds", current: beds, total: totalBeds },
      { name: "ICU Beds", current: icu, total: icuTotal },
      { name: "Oxygen Beds", current: oxygenBeds, total: oxygenTotal },
      { name: "Ventilators", current: seed % 9, total: 10 }
    ],
    inventory: [
      { name: "Paracetamol 500mg", category: "Analgesic", stock: 70 + (seed % 220), threshold: 50 },
      { name: "IV Saline 500ml", category: "IV Fluid", stock: 25 + (seed % 90), threshold: 30 },
      { name: "Oxygen Cylinders", category: "Respiratory", stock: 4 + (seed % 14), threshold: 10 },
      { name: "ORS Sachets", category: "Hydration", stock: 15 + (seed % 80), threshold: 20 }
    ],
    staff
  };
}

function setHospitalLocationHint(message) {
  const hint = $("hospitalLocationHint");
  if (hint) hint.textContent = message;
}

function setHospitalOptions(hospitals, doctors = [], message) {
  const select = $("hospitalSelect");
  if (!select) return;

  activeHospitalNames = new Set();
  select.replaceChildren(new Option("Choose a hospital", ""));
  hospitals
    .filter(hospital => hospital && hospital.name && Number(hospital.distance) <= 50)
    .sort((a, b) => Number(a.distance) - Number(b.distance))
    .forEach(hospital => {
      const relatedDoctors = doctors.filter(doctor => doctor.hospital === hospital.name);
      HOSPITAL_DATA[hospital.name] = createPortalHospitalData(hospital, relatedDoctors);
      activeHospitalNames.add(hospital.name);
      const distance = Number(hospital.distance).toFixed(1);
      select.add(new Option(`${hospital.name} (${distance} km)`, hospital.name));
    });

  setHospitalLocationHint(message || (activeHospitalNames.size
    ? `Showing ${activeHospitalNames.size} hospitals within 50 km of your location.`
    : "No hospitals were found within 50 km. Set your location in the patient portal and try again."));
}

function loadSavedLocationHospitals() {
  try {
    const saved = JSON.parse(localStorage.getItem(HOSPITAL_STORAGE_KEY) || "null");
    if (!saved || !Array.isArray(saved.hospitals) || !saved.hospitals.length) return false;
    setHospitalOptions(saved.hospitals, Array.isArray(saved.doctors) ? saved.doctors : []);
    return activeHospitalNames.size > 0;
  } catch {
    localStorage.removeItem(HOSPITAL_STORAGE_KEY);
    return false;
  }
}

async function loadHospitalsFromCurrentLocation(coords) {
  setHospitalLocationHint("Finding hospitals within 50 km of your location...");
  const query = `[out:json][timeout:20];(nwr(around:50000,${coords.lat},${coords.lng})[amenity~"^(hospital|clinic)$"];);out center 40;`;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: query
    });
    if (!response.ok) throw new Error("Nearby hospital lookup failed");
    const result = await response.json();
    const facilities = (result.elements || [])
      .map((element, index) => {
        const lat = Number(element.lat ?? element.center?.lat);
        const lng = Number(element.lon ?? element.center?.lon);
        const name = element.tags?.name;
        if (!name || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        return {
          name,
          lat,
          lng,
          distance: Number(calculateDistanceKm(coords.lat, coords.lng, lat, lng).toFixed(1)),
          location: element.tags?.["addr:street"] || "Nearby location",
          phone: element.tags?.phone || "Contact hospital directly",
          totalBeds: 60 + (stableHash(`${element.id}|${index}`) % 120),
          beds: 20 + (stableHash(`${element.id}|beds`) % 35),
          icu: 3 + (stableHash(`${element.id}|icu`) % 12),
          oxygen: true
        };
      })
      .filter(Boolean)
      .filter(hospital => hospital.distance <= 50)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 12);

    if (!facilities.length) throw new Error("No nearby hospitals found");
    localStorage.setItem(HOSPITAL_STORAGE_KEY, JSON.stringify({
      source: "portal-location",
      updatedAt: new Date().toISOString(),
      location: coords,
      hospitals: facilities,
      doctors: []
    }));
    setHospitalOptions(facilities, []);
  } catch {
    setHospitalLocationHint("Unable to load nearby hospitals. Open the patient portal, allow location access, then return here.");
  }
}

function prepareLocationHospitalOptions() {
  if (loadSavedLocationHospitals()) return;
  if (!navigator.geolocation) {
    setHospitalLocationHint("Location is unavailable in this browser. Open the patient portal and set your location first.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    position => loadHospitalsFromCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
    () => setHospitalLocationHint("Allow location access to list hospitals within 50 km of you."),
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
  );
}

/* ═══════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  prepareLocationHospitalOptions();
  checkSavedSession();
  bindLoginEvents();
});

function checkSavedSession() {
  const saved = localStorage.getItem("ohp_portal_session");
  if (saved) {
    try {
      const sess = JSON.parse(saved);
      if (!activeHospitalNames.has(sess.hospital)) {
        localStorage.removeItem("ohp_portal_session");
        return;
      }
      currentHospital = sess.hospital;
      currentRole     = sess.role;
      currentStaff    = sess.staffId;
      showDashboard(sess.hospital, sess.role, sess.staffId);
    } catch {
      localStorage.removeItem("ohp_portal_session");
    }
  }
}

/* ═══════════════════════════════════════════════
   LOGIN
═══════════════════════════════════════════════ */
function bindLoginEvents() {
  $("loginForm")?.addEventListener("submit", e => {
    e.preventDefault();
    const hospital = $("hospitalSelect").value;
    const role     = $("roleSelect").value;
    const staffId  = $("staffId").value.trim();
    const password = $("staffPass").value.trim();
    const remember = $("rememberMe").checked;
    const errEl    = $("loginError");

    if (!hospital || !role || !staffId || !password) {
      errEl.textContent = "❌ Please fill in all fields.";
      errEl.classList.add("show");
      return;
    }
    if (staffId !== DEMO_STAFF_ID || password !== DEMO_PASSWORD) {
      errEl.textContent = "❌ Invalid Staff ID or password. Use demo credentials below.";
      errEl.classList.add("show");
      return;
    }
    errEl.classList.remove("show");
    if (remember) {
      localStorage.setItem("ohp_portal_session", JSON.stringify({ hospital, role, staffId }));
    }
    currentHospital = hospital;
    currentRole     = role;
    currentStaff    = staffId;
    showDashboard(hospital, role, staffId);
  });
}

/* ═══════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════ */
function showDashboard(hospital, role, staffId) {
  $("loginScreen").style.display  = "none";
  $("portalShell").style.display  = "grid";

  $("dashTitle").textContent       = `Welcome, ${role}`;
  $("hospitalBadge").textContent   = hospital;
  $("sidebarName").textContent     = `${role} — ${staffId.toUpperCase()}`;
  $("sidebarRole").textContent     = `${hospital}`;

  const data = HOSPITAL_DATA[hospital];
  if (!data) return;

  renderBedTable(data);
  renderInventory(data);
  renderStaff(data);
  renderAlerts(data);
  updateOverviewStats();

  bindDashboardEvents(data);
}

/* ── Bed / resource table ── */
function renderBedTable(data) {
  const tbody = $("bedTable");
  if (!tbody) return;
  tbody.innerHTML = data.resources.map((r, i) => {
    const pct    = Math.round((r.current / r.total) * 100);
    const status = pct > 80 ? `<span class="badge badge-red">High</span>` : pct > 50 ? `<span class="badge badge-amber">Moderate</span>` : `<span class="badge badge-green">Available</span>`;
    return `
    <tr>
      <td><strong>${r.name}</strong></td>
      <td><input type="number" class="inline-edit" value="${r.current}" min="0" max="${r.total}" data-res-idx="${i}" data-type="current" aria-label="${r.name} current"></td>
      <td>${r.total}</td>
      <td>${status}</td>
      <td>
        <div style="width:80px;height:6px;background:var(--surface-2);border-radius:999px;overflow:hidden;">
          <div style="height:100%;width:${pct}%;background:${pct>80?'var(--coral)':pct>50?'var(--amber)':'var(--cyan)'};border-radius:999px;transition:width .4s;"></div>
        </div>
      </td>
    </tr>`;
  }).join("");
}

/* ── Inventory ── */
function renderInventory(data) {
  const tbody = $("inventoryBody");
  if (!tbody) return;
  tbody.innerHTML = data.inventory.map((m, i) => {
    const low    = m.stock <= m.threshold;
    const status = m.stock === 0 ? `<span class="badge badge-red">Out of stock</span>`
                 : low            ? `<span class="badge badge-amber">Low stock</span>`
                 :                  `<span class="badge badge-green">In stock</span>`;
    return `
    <tr>
      <td><strong>${m.name}</strong></td>
      <td>${m.category}</td>
      <td><input type="number" class="inline-edit" value="${m.stock}" min="0" data-inv-idx="${i}" aria-label="${m.name} stock"></td>
      <td>${m.threshold}</td>
      <td>${status}</td>
      <td><button class="btn btn-ghost" style="min-height:30px;padding:0 10px;font-size:12px;" onclick="requestRestock('${m.name}')">Restock</button></td>
    </tr>`;
  }).join("");
}

window.requestRestock = function(name) {
  showPortalToast(`📦 Restock request sent for ${name}`);
};

/* ── Staff ── */
function renderStaff(data) {
  const grid = $("staffGrid");
  if (!grid) return;
  grid.innerHTML = data.staff.map((s, i) => {
    const initials = s.name.replace(/Dr\. |Nurse |Admin |Physio /,"").split(" ").map(p=>p[0]).join("");
    return `
    <div class="staff-card">
      <div class="staff-avatar" style="background:${s.color}">${initials}</div>
      <div style="flex:1;min-width:0;">
        <strong style="display:block;font-size:13px;color:var(--navy);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.name}</strong>
        <p>${s.role}</p>
      </div>
      <label class="staff-toggle" title="${s.on ? "On duty" : "Off duty"}" aria-label="Toggle duty status for ${s.name}">
        <input type="checkbox" ${s.on ? "checked" : ""} data-staff-idx="${i}" onchange="toggleStaff(${i}, this.checked)">
        <span class="staff-slider"></span>
      </label>
    </div>`;
  }).join("");
  updateStaffCount(data);
}

window.toggleStaff = function(idx, on) {
  const data = HOSPITAL_DATA[currentHospital];
  if (!data) return;
  data.staff[idx].on = on;
  showPortalToast(`${on ? "🟢 On duty" : "⚫ Off duty"}: ${data.staff[idx].name}`);
  updateStaffCount(data);
};

function updateStaffCount(data) {
  const onCount = data.staff.filter(s => s.on).length;
  $("staffOnCount").textContent = `${onCount} on duty`;
}

/* ── Alerts ── */
function renderAlerts(data) {
  const alerts = [];
  data.inventory.forEach(m => {
    if (m.stock === 0)         alerts.push({ type:"critical", msg:`🚨 ${m.name} is out of stock! Immediate reorder required.` });
    else if (m.stock <= m.threshold) alerts.push({ type:"warning",  msg:`⚠️ ${m.name} stock is low (${m.stock} units). Threshold: ${m.threshold}.` });
  });
  data.resources.forEach(r => {
    const pct = (r.current / r.total) * 100;
    if (pct > 90) alerts.push({ type:"critical", msg:`🚨 ${r.name}: ${r.current}/${r.total} — critically high occupancy!` });
    else if (pct > 75) alerts.push({ type:"warning", msg:`⚠️ ${r.name}: ${r.current}/${r.total} — high occupancy.` });
  });
  if (alerts.length === 0) alerts.push({ type:"info", msg:"✅ No critical alerts at this time. All systems operational." });

  $("alertList").innerHTML = alerts.map(a => `
    <div class="alert-item ${a.type}">
      <span class="alert-icon">${a.type==="critical"?"🔴":a.type==="warning"?"🟡":"🔵"}</span>
      <span>${a.msg}</span>
    </div>`).join("");

  $("dashAlerts").textContent = alerts.filter(a => a.type !== "info").length;
  updateOverviewStats();
}

/* ── Patient queue ── */
function renderQueue() {
  const tbody = $("queueBody");
  if (!tbody) return;
  const prioMap = { critical:"🔴 Critical", urgent:"🟡 Urgent", normal:"🟢 Normal" };
  tbody.innerHTML = patientQueue.length
    ? patientQueue.map((p, i) => `
      <tr>
        <td>${i+1}</td>
        <td><strong>${p.name}</strong></td>
        <td>${p.condition}</td>
        <td><span class="badge ${p.priority==="critical"?"badge-red":p.priority==="urgent"?"badge-amber":"badge-green"}">${prioMap[p.priority]}</span></td>
        <td>${getWaitTime(p.addedAt)}</td>
        <td><button class="btn btn-danger" style="min-height:28px;padding:0 10px;font-size:12px;" onclick="removePatient(${p.id})">Discharge</button></td>
      </tr>`).join("")
    : `<tr><td colspan="6" style="text-align:center;color:var(--ink-3);padding:24px">No patients in queue</td></tr>`;

  $("queueCount").textContent = `${patientQueue.length} patient${patientQueue.length !== 1 ? "s" : ""}`;
  $("dashQueue").textContent  = patientQueue.length;
}

window.removePatient = function(id) {
  patientQueue = patientQueue.filter(p => p.id !== id);
  renderQueue();
  showPortalToast("✅ Patient discharged from queue");
};

function getWaitTime(addedAt) {
  const mins = Math.round((Date.now() - addedAt) / 60000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins/60)}h ${mins%60}m`;
}

/* ── Overview stats ── */
function updateOverviewStats() {
  const data = HOSPITAL_DATA[currentHospital];
  if (!data) return;
  const bedRes = data.resources.find(r => r.name.includes("Bed") && !r.name.includes("ICU"));
  const icuRes = data.resources.find(r => r.name.includes("ICU"));
  $("dashBeds").textContent = bedRes ? bedRes.current : data.beds;
  $("dashICU").textContent  = icuRes ? icuRes.current : data.icu;
}

/* ═══════════════════════════════════════════════
   DASHBOARD EVENTS
═══════════════════════════════════════════════ */
function bindDashboardEvents(data) {

  /* section switching */
  $$(".portal-link[data-section]").forEach(btn => {
    btn.addEventListener("click", () => switchSection(btn.dataset.section));
  });

  /* logout */
  $("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("ohp_portal_session");
    $("portalShell").style.display = "none";
    $("loginScreen").style.display = "grid";
    $("staffPass").value = "";
    $("loginError").classList.remove("show");
    showPortalToast("👋 Logged out successfully");
  });

  /* dark mode */
  $("themeTogglePortal")?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const dark = document.body.classList.contains("dark");
    $("themeTogglePortal").textContent = dark ? "☀️ Light mode" : "🌙 Dark mode";
  });

  /* save beds */
  $("saveBedBtn")?.addEventListener("click", () => {
    $$("[data-res-idx]").forEach(input => {
      const idx = parseInt(input.dataset.resIdx);
      data.resources[idx].current = parseInt(input.value) || 0;
    });
    renderBedTable(data);
    updateOverviewStats();
    renderAlerts(data);
    showPortalToast("✅ Bed status saved");
  });

  /* save inventory */
  $("saveInvBtn")?.addEventListener("click", () => {
    $$("[data-inv-idx]").forEach(input => {
      const idx = parseInt(input.dataset.invIdx);
      data.inventory[idx].stock = parseInt(input.value) || 0;
    });
    renderInventory(data);
    renderAlerts(data);
    showPortalToast("✅ Inventory updated");
  });

  /* add patient */
  $("addPatientBtn")?.addEventListener("click", () => {
    const name      = $("patientName").value.trim();
    const condition = $("patientCondition").value.trim();
    const priority  = $("patientPriority").value;
    if (!name) { showPortalToast("⚠️ Please enter a patient name"); return; }
    patientQueue.push({ id: patientIdCounter++, name, condition: condition || "General", priority, addedAt: Date.now() });
    $("patientName").value = "";
    $("patientCondition").value = "";
    renderQueue();
    showPortalToast(`✅ Patient "${name}" added to queue`);
  });

  /* clear alerts */
  $("clearAlertsBtn")?.addEventListener("click", () => {
    $("alertList").innerHTML = `<div class="alert-item info"><span class="alert-icon">🔵</span><span>All alerts cleared. Monitoring active.</span></div>`;
    $("dashAlerts").textContent = "0";
    showPortalToast("🗑️ Alerts cleared");
  });

  /* Refresh wait times every 60s */
  setInterval(() => { if (patientQueue.length) renderQueue(); }, 60000);
}

/* ═══════════════════════════════════════════════
   SECTION SWITCHER
═══════════════════════════════════════════════ */
window.switchSection = function(sectionId) {
  $$(".dash-section").forEach(s => s.classList.remove("active"));
  $$(".portal-link[data-section]").forEach(b => b.classList.remove("active"));
  $(sectionId)?.classList.add("active");
  document.querySelector(`[data-section="${sectionId}"]`)?.classList.add("active");
  if (sectionId === "sec-queue") renderQueue();
};

/* ═══════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════ */
function showPortalToast(msg, duration = 3200) {
  const t = $("portalToast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), duration);
}
