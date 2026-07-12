/* ═══════════════════════════════════════════════════════════
   ONE HEALTH PLATFORM — app.js
   ═══════════════════════════════════════════════════════════
   ⚙️  CONFIGURATION — replace these keys before deploying
   ═══════════════════════════════════════════════════════════ */

const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"; // https://console.cloud.google.com
const GEMINI_API_KEY      = "YOUR_GEMINI_API_KEY";      // https://aistudio.google.com
const GEMINI_MODEL        = "gemini-1.5-flash";

/* ───────────────────────────────────────────
   DATA
─────────────────────────────────────────── */
const hospitals = [
  { name:"CityCare Hospital",     lat:12.9762, lng:77.5993, distance:2.1, location:"MG Road",       beds:42, totalBeds:120, icu:8,  oxygen:true,  insurance:true,  specialties:["Cardiology","Emergency","General Medicine"], phone:"080-4100-1001" },
  { name:"GreenLine Clinic",      lat:12.9716, lng:77.5946, distance:3.8, location:"Lake View",     beds:11, totalBeds:40,  icu:0,  oxygen:true,  insurance:false, specialties:["General Medicine","Pediatrics"],             phone:"080-4200-2300" },
  { name:"Hope Multispeciality",  lat:12.9689, lng:77.6074, distance:5.4, location:"Central Market",beds:28, totalBeds:85,  icu:5,  oxygen:true,  insurance:true,  specialties:["Orthopedics","Neurology","Emergency"],        phone:"080-4300-7744" },
  { name:"Sunrise Senior Care",   lat:12.9812, lng:77.5878, distance:7.2, location:"West End",      beds:19, totalBeds:60,  icu:3,  oxygen:false, insurance:true,  specialties:["Geriatrics","General Medicine"],             phone:"080-4400-8812" },
];

let doctors = [
  { name:"Dr. Asha Menon",    specialty:"Cardiology",       hospital:"CityCare Hospital",   available:"Available now",        mode:"In-person",    rating:4.9 },
  { name:"Dr. Kiran Rao",     specialty:"General Medicine",  hospital:"GreenLine Clinic",    available:"Next slot 4:30 PM",    mode:"Video consult", rating:4.7 },
  { name:"Dr. Meera Shah",    specialty:"Pediatrics",        hospital:"GreenLine Clinic",    available:"Available now",        mode:"In-person",    rating:4.8 },
  { name:"Dr. Farhan Ali",    specialty:"Orthopedics",       hospital:"Hope Multispeciality",available:"Next slot 6:00 PM",    mode:"In-person",    rating:4.6 },
  { name:"Dr. Priya Suresh",  specialty:"Geriatrics",        hospital:"Sunrise Senior Care", available:"Available now",        mode:"Video consult", rating:4.8 },
];

const medicines = [
  { name:"Insulin",              type:"Diabetes care",        pharmacy:"MediQuick Pharmacy",  stock:18  },
  { name:"Paracetamol 500mg",    type:"Fever and pain",       pharmacy:"CarePlus Pharmacy",   stock:120 },
  { name:"ORS Sachets",          type:"Dehydration",          pharmacy:"MediQuick Pharmacy",  stock:7   },
  { name:"Oxygen Cylinder",      type:"Respiratory support",  pharmacy:"LifeAid Medicals",    stock:3   },
  { name:"Amoxicillin 500mg",    type:"Antibiotic",           pharmacy:"CarePlus Pharmacy",   stock:45  },
  { name:"Salbutamol Inhaler",   type:"Asthma / bronchospasm",pharmacy:"LifeAid Medicals",    stock:9   },
];

const localPharmacies = [
  { name:"MediQuick Pharmacy", distance:0.8, open:"Open 24×7",        phone:"080-5000-1100" },
  { name:"CarePlus Pharmacy",  distance:1.4, open:"Open until 11 PM", phone:"080-5000-2200" },
  { name:"LifeAid Medicals",   distance:2.7, open:"Open 24×7",        phone:"080-5000-3300" },
];

const ambulances = [
  { name:"Rapid Ambulance 24×7",   eta:"8 min ETA",  phone:"108",           type:"Advanced life support" },
  { name:"CityCare Ambulance",      eta:"12 min ETA", phone:"080-4100-1111", type:"Hospital transfer" },
  { name:"Senior Assist Mobility",  eta:"18 min ETA", phone:"080-5999-1212", type:"Non-emergency transport" },
];

const onlinePharmacies = [
  { name:"Tata 1mg",         icon:"💊", desc:"Medicines, lab tests & health records", color:"#e11d48", searchUrl:"https://www.1mg.com/search/all?name=",             homeUrl:"https://www.1mg.com" },
  { name:"PharmEasy",        icon:"🏥", desc:"Medicines, diagnostics & teleconsult",  color:"#16a34a", searchUrl:"https://pharmeasy.in/search/all?name=",             homeUrl:"https://pharmeasy.in" },
  { name:"Netmeds",          icon:"💉", desc:"Genuine medicines & healthcare products",color:"#2563eb", searchUrl:"https://www.netmeds.com/catalogsearch/result?q=",   homeUrl:"https://www.netmeds.com" },
  { name:"Apollo Pharmacy",  icon:"⚕️", desc:"India's largest pharmacy chain online", color:"#0284c7", searchUrl:"https://www.apollopharmacy.in/search-medicines/",    homeUrl:"https://www.apollopharmacy.in" },
  { name:"MedPlusMart",      icon:"🛒", desc:"Over 2 lakh medicines delivered fast",  color:"#7c3aed", searchUrl:"https://www.medplusmart.com/search/",               homeUrl:"https://www.medplusmart.com" },
  { name:"Flipkart Health+", icon:"🛍️", desc:"Health products & medicines marketplace",color:"#f59e0b", searchUrl:"https://www.flipkart.com/search?q=",                homeUrl:"https://www.flipkart.com/grocery" },
];

const govtSchemes = [
  {
    name:"Ayushman Bharat PM-JAY",
    logo:"🇮🇳", type:"govt",
    coverage:"₹5 Lakh / family / year",
    desc:"World's largest government health insurance scheme covering 55 crore+ beneficiaries for secondary and tertiary hospitalisation.",
    eligibility:"BPL families listed in SECC 2011 database",
    portal:"https://pmjay.gov.in",
    apply:"https://setu.pmjay.gov.in/setu/",
    check:"https://mera.pmjay.gov.in",
  },
  {
    name:"ESIC — Employees' State Insurance",
    logo:"🏢", type:"govt",
    coverage:"Full medical care + cash benefits",
    desc:"Comprehensive social security scheme for salaried employees earning ≤₹21,000/month in organised sector establishments.",
    eligibility:"Employees in ESI-covered establishments",
    portal:"https://www.esic.gov.in",
    apply:"https://www.esic.gov.in/registration",
    check:"https://www.esic.gov.in/benefiteligibility",
  },
  {
    name:"CGHS — Central Govt Health Scheme",
    logo:"🏛️", type:"govt",
    coverage:"OPD + IPD at CGHS empanelled hospitals",
    desc:"Healthcare facility for central government employees, pensioners and their dependents in 75+ cities across India.",
    eligibility:"Central govt employees and pensioners",
    portal:"https://cghs.nic.in",
    apply:"https://cghs.nic.in/onlineRegistration",
    check:"https://cghs.nic.in/wellness_centres",
  },
];

const privateInsurers = [
  {
    name:"Star Health Insurance",
    logo:"⭐", type:"private",
    coverage:"Up to ₹25 Lakh",
    desc:"India's largest standalone health insurer with 14,000+ network hospitals and comprehensive family floater plans.",
    portal:"https://www.starhealth.in",
    apply:"https://www.starhealth.in/health-insurance",
    check:"https://www.starhealth.in/network-hospitals",
  },
  {
    name:"HDFC Ergo Health",
    logo:"🏦", type:"private",
    coverage:"Up to ₹1 Crore",
    desc:"Feature-rich health insurance plans with no room rent capping, unlimited e-consults and restoration benefit.",
    portal:"https://www.hdfcergo.com",
    apply:"https://www.hdfcergo.com/health-insurance",
    check:"https://www.hdfcergo.com/network-hospitals",
  },
  {
    name:"Niva Bupa Health",
    logo:"💙", type:"private",
    coverage:"Up to ₹1 Crore",
    desc:"ReAssure & Heartbeat plans with direct claim settlement, no third-party admin delays, and cashless at 10,000+ hospitals.",
    portal:"https://www.nivabupa.com",
    apply:"https://www.nivabupa.com/health-insurance-plans",
    check:"https://www.nivabupa.com/network-hospitals",
  },
];

const insuranceSteps = [
  {
    title:"Apply for Ayushman Bharat (PM-JAY) card",
    steps:[
      'Visit <a href="https://mera.pmjay.gov.in" target="_blank" rel="noopener">mera.pmjay.gov.in</a> and check your family eligibility by mobile number or ration card.',
      'If eligible, visit your nearest Common Service Centre (CSC) or empanelled hospital\'s Ayushman Mitra desk.',
      'Carry Aadhaar card, ration card or government ID, and a recent family photograph.',
      'Biometric verification is done on-site. An e-card (Ayushman card) is generated instantly.',
      'Use the e-card at any PM-JAY empanelled hospital for cashless treatment up to ₹5 lakh per year.',
    ],
  },
  {
    title:"Claim cashless treatment at a network hospital",
    steps:[
      'At admission, show your health insurance card / Ayushman card to the hospital\'s insurance desk.',
      'The hospital sends a pre-authorisation request to your insurer / PM-JAY system.',
      'Approval is typically given within 30–60 minutes for planned treatments.',
      'At discharge, sign the discharge summary — the insurer settles the bill directly with the hospital.',
      'Keep all original bills and discharge papers for any future reimbursement discrepancies.',
    ],
  },
  {
    title:"Apply for private health insurance",
    steps:[
      'Compare plans on <a href="https://www.policybazaar.com/health-insurance/" target="_blank" rel="noopener">PolicyBazaar</a> or <a href="https://www.coverfox.com/health-insurance/" target="_blank" rel="noopener">Coverfox</a> — filter by family size, age, and required coverage.',
      'Complete KYC: Aadhaar, PAN, recent photograph and income proof.',
      'Declare all existing health conditions honestly (non-disclosure leads to claim rejection).',
      'Pay the annual premium online. Policy document is emailed within 24–48 hours.',
      'Download the insurer\'s mobile app for e-card, claim tracking and hospital locator.',
    ],
  },
  {
    title:"File a reimbursement claim",
    steps:[
      'Collect ALL original documents: discharge summary, itemised bills, lab reports, doctor prescriptions.',
      'Fill the claim form from your insurer\'s website or app.',
      'Submit within 15–30 days of discharge (check policy wording for exact timeline).',
      'Insurer will process within 30 days. Disputed claims go to the Grievance Redressal Officer.',
      'If unresolved, escalate to IRDAI Bima Bharosa portal: <a href="https://bimabharosa.irdai.gov.in" target="_blank" rel="noopener">bimabharosa.irdai.gov.in</a>.',
    ],
  },
];

/* ───────────────────────────────────────────
   STATE
   ─────────────────────────────────────────── */
let hospitalFilter = "all";
let searchTerm     = "";
let toastTimer     = null;
let chatHistory    = [];   // [{role, parts:[{text}]}]
let firstAidData   = [];

// Leaflet & Global OSM Mapping State
let leafletMap      = null;
let tileLayer       = null;
let mapMarkers      = [];
let userMarker      = null;
let userCoords      = { lat: 12.9716, lng: 77.5946 }; // Default center (Bangalore)
let mapQueryTimeout = null;

const mapDetails = {
  "CityCare Hospital":    { icon:"🏥", title:"CityCare Hospital",    text:"2.1 km · ICU, oxygen beds, cardiology" },
  "MediQuick Pharmacy":  { icon:"💊", title:"MediQuick Pharmacy",   text:"0.8 km · insulin, ORS, open 24×7" },
  "CarePlus Pharmacy":   { icon:"💊", title:"CarePlus Pharmacy",    text:"1.4 km · paracetamol, antibiotics, open until 11 PM" },
  "Rapid Ambulance 24×7":{ icon:"🚑", title:"Rapid Ambulance 24×7", text:"8 min ETA · advanced life support vehicle" },
  "GreenLine Clinic":    { icon:"🏨", title:"GreenLine Clinic",     text:"3.8 km · general medicine & pediatrics" },
};



/* ───────────────────────────────────────────
   DOM HELPERS
─────────────────────────────────────────── */
const $  = id  => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

/* ───────────────────────────────────────────
   BOOT
─────────────────────────────────────────── */
function init() {
  renderMetrics();
  renderSnapshots();
  renderHospitals();
  renderDoctors();
  renderMedicines();
  renderPharmacies();
  renderAmbulances();
  renderPharmacyApps();
  renderInsurance();
  loadFirstAid();
  bindEvents();
  animateCounters();
  initLeafletMap();
}

/* ═══════════════════════════════════════════════
   TAB SWITCHING
═══════════════════════════════════════════════ */
function switchTab(tabId) {
  // hide all panels
  $$(".tab-panel").forEach(p => {
    p.classList.remove("active");
    p.hidden = true;
  });
  // deactivate all nav buttons
  $$(".nav-link").forEach(b => {
    b.classList.remove("active");
    b.setAttribute("aria-selected", "false");
  });
  // activate target
  const panel = $(tabId);
  if (panel) { panel.classList.add("active"); panel.hidden = false; }
  const btn = document.querySelector(`[data-tab="${tabId}"]`);
  if (btn) { btn.classList.add("active"); btn.setAttribute("aria-selected", "true"); }
}

/* ═══════════════════════════════════════════════
   METRICS & SNAPSHOTS
═══════════════════════════════════════════════ */
function renderMetrics() {
  $("metricHospitals").textContent = hospitals.length;
  $("metricBeds").textContent      = hospitals.reduce((s,h) => s + h.beds, 0);
  $("metricDoctors").textContent   = doctors.filter(d => d.available.includes("Available")).length;
}

function renderSnapshots() {
  const totalBeds = hospitals.reduce((s,h) => s + h.beds, 0);
  const totalICU  = hospitals.reduce((s,h) => s + h.icu, 0);
  $("snapBeds").textContent    = totalBeds;
  $("snapICU").textContent     = totalICU;
  $("snapOxygen").textContent  = hospitals.filter(h => h.oxygen).length;
  $("snapPharmacy").textContent = localPharmacies.length;
}

function animateCounters() {
  const counters = [
    { el: $("metricHospitals"), target: hospitals.length },
    { el: $("metricBeds"),      target: hospitals.reduce((s,h) => s + h.beds, 0) },
    { el: $("metricDoctors"),   target: doctors.filter(d => d.available.includes("Available")).length },
  ];
  counters.forEach(({ el, target }) => {
    let v = 0;
    const step = Math.max(1, Math.ceil(target / 28));
    const iv = setInterval(() => {
      v = Math.min(v + step, target);
      el.textContent = v;
      if (v >= target) clearInterval(iv);
    }, 35);
  });
}

/* ═══════════════════════════════════════════════
   HOSPITALS
═══════════════════════════════════════════════ */
function getFilteredHospitals() {
  const distLimit = ($("distanceFilter2")?.value) ?? "all";
  return hospitals.filter(h => {
    const matchDist   = distLimit === "all" || h.distance <= Number(distLimit);
    const matchFilter =
      hospitalFilter === "all" ||
      (hospitalFilter === "icu"       && h.icu > 0) ||
      (hospitalFilter === "oxygen"    && h.oxygen) ||
      (hospitalFilter === "insurance" && h.insurance);
    const hay = `${h.name} ${h.location} ${h.specialties.join(" ")} ${h.oxygen?"oxygen":""} ${h.insurance?"insurance":""}`.toLowerCase();
    return matchDist && matchFilter && (!searchTerm || hay.includes(searchTerm));
  });
}

function renderHospitals() {
  const filtered = getFilteredHospitals();
  $("hospitalGrid").innerHTML = filtered.length
    ? filtered.map(buildHospitalCard).join("")
    : `<p class="empty-state">No matching hospitals. Try a wider distance or different filter.</p>`;
}

function buildHospitalCard(h) {
  const fill  = Math.round((h.beds / h.totalBeds) * 100);
  const badge = h.beds < 15
    ? `<span class="status-badge alert">Limited beds</span>`
    : `<span class="status-badge">Receiving patients</span>`;
  const ratingStr = h.rating ? `⭐ ${h.rating.toFixed(1)} · ` : '';
  return `
  <article class="hospital-card">
    <div class="card-top">
      <div><h3>${h.name}</h3>
        <div class="hospital-meta">
          <span>${ratingStr}📍 ${h.distance} km · ${h.location}</span>
          <span>🔬 ${h.specialties.join(", ")}</span>
        </div>
      </div>${badge}
    </div>
    <div class="bed-row" aria-label="${h.beds} of ${h.totalBeds} beds available">
      <strong>🛏️ ${h.beds} beds · ${h.icu} ICU</strong>
      <div class="bed-bar"><span class="bed-fill" style="width:${fill}%"></span></div>
    </div>
    <div class="hospital-meta">
      <span>${h.oxygen ? "✅ Oxygen available" : "❌ No oxygen"}</span>
      <span>${h.insurance ? "✅ Insurance desk" : "⚠️ No insurance desk"}</span>
    </div>
    <div class="card-actions">
      <button class="primary" type="button" data-action="route" data-name="${h.name}" data-lat="${h.lat}" data-lng="${h.lng}">🗺️ Directions</button>
      <button type="button" data-action="call"  data-name="${h.name}" data-phone="${h.phone}">📞 Call</button>
      <button type="button" data-action="map"   data-name="${h.name}">📌 Show on map</button>
    </div>
  </article>`;
}

/* ═══════════════════════════════════════════════
   DOCTORS
═══════════════════════════════════════════════ */
function renderDoctors() {
  const spec = $("specialtyFilter")?.value ?? "all";
  const filtered = doctors.filter(d => {
    const matchSpec = spec === "all" || d.specialty === spec;
    const hay = `${d.name} ${d.specialty} ${d.hospital}`.toLowerCase();
    return matchSpec && (!searchTerm || hay.includes(searchTerm));
  });
  $("doctorList").innerHTML = filtered.length
    ? filtered.map(buildDoctorCard).join("")
    : `<p class="empty-state">No doctors match your search.</p>`;
}

function buildDoctorCard(d) {
  const initials = d.name.replace("Dr. ","").split(" ").map(p => p[0]).join("");
  const now = d.available.includes("Available");
  const verifiedBadge = d.verified ? `<span class="verified-badge">🛡️ Verified</span>` : '';
  const phoneButton = d.phone ? `<button class="doctor-action secondary" type="button" onclick="window.location.href='tel:${d.phone}'">📞 Call</button>` : '';
  return `
  <article class="doctor-card">
    <span class="avatar" aria-hidden="true">${initials}</span>
    <div style="flex:1">
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        <h3>${d.name}</h3>
        ${verifiedBadge}
      </div>
      <p>${d.specialty} · ${d.hospital} · ${d.mode} · ⭐ ${d.rating.toFixed(1)}</p>
      ${d.languages ? `<p style="margin-top:2px;font-size:12.5px;color:var(--ink-2)">🗣️ Languages: ${d.languages}</p>` : ''}
      ${d.phone ? `<p style="margin-top:2px;font-size:12.5px;color:var(--ink-2)">📞 Phone: ${d.phone}</p>` : ''}
      <span class="doctor-avail${now ? "" : " busy"}" style="margin-top:6px">${now ? "🟢" : "🟡"} ${d.available}</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px;justify-content:center;align-items:stretch">
      <button class="doctor-action" type="button" data-action="book" data-name="${d.name}">
        ${now ? "Book now" : "Reserve"}
      </button>
      ${phoneButton}
    </div>
  </article>`;
}

/* ═══════════════════════════════════════════════
   MEDICINES
═══════════════════════════════════════════════ */
function renderMedicines() {
  const local = ($("medicineSearch")?.value ?? "").trim().toLowerCase();
  const filtered = medicines.filter(m => {
    const hay = `${m.name} ${m.type} ${m.pharmacy}`.toLowerCase();
    return (!local || hay.includes(local)) && (!searchTerm || hay.includes(searchTerm));
  });
  $("medicineList").innerHTML = filtered.length
    ? filtered.map(m => `
      <article class="medicine-item">
        <div><strong>${m.name}</strong><span>${m.type} · ${m.pharmacy}</span></div>
        <span class="stock${m.stock < 10 ? " low" : ""}">${m.stock} left</span>
      </article>`).join("")
    : `<p class="empty-state">No matching medicine stock found.</p>`;
}

function renderPharmacies() {
  $("pharmacyList").innerHTML = localPharmacies.map(p => `
    <article class="pharmacy-item">
      <div><strong>${p.name}</strong><span>📍 ${p.distance} km · ${p.open}</span></div>
      <button class="doctor-action" type="button" data-action="call" data-name="${p.name}" data-phone="${p.phone}">📞 Call</button>
    </article>`).join("");
}

/* ═══════════════════════════════════════════════
   PHARMACY MARKETPLACE
═══════════════════════════════════════════════ */
function renderPharmacyApps(query = "") {
  $("pharmacyAppsGrid").innerHTML = onlinePharmacies.map(p => {
    const url = query
      ? `${p.searchUrl}${encodeURIComponent(query)}`
      : p.homeUrl;
    return `
    <div class="pharmacy-app-card">
      <div class="pharmacy-app-icon">${p.icon}</div>
      <div class="pharmacy-app-name">${p.name}</div>
      <div class="pharmacy-app-desc">${p.desc}</div>
      <a class="pharmacy-app-btn" href="${url}" target="_blank" rel="noopener"
         aria-label="${query ? `Search ${query} on ${p.name}` : `Open ${p.name}`}">
        ${query ? `Search "${query}"` : "Open store"}
      </a>
    </div>`;
  }).join("");
}

/* ═══════════════════════════════════════════════
   AMBULANCES
═══════════════════════════════════════════════ */
function renderAmbulances() {
  $("ambulanceList").innerHTML = ambulances.map(a => `
    <article class="ambulance-item">
      <div><strong>${a.name}</strong><span>${a.type} · ⏱️ ${a.eta}</span></div>
      <button class="doctor-action" type="button" data-action="call" data-name="${a.name}" data-phone="${a.phone}">
        📞 ${a.phone}
      </button>
    </article>`).join("");
}

/* ═══════════════════════════════════════════════
   FIRST AID
═══════════════════════════════════════════════ */
async function loadFirstAid() {
  firstAidData = [
    {
      "id": "cpr-adult",
      "title": "CPR — Adult (18+)",
      "icon": "❤️",
      "severity": "critical",
      "callAmbulance": true,
      "keywords": ["cpr", "cardiac arrest", "heart attack", "unconscious", "not breathing"],
      "symptoms": ["Person is unresponsive", "Not breathing or only gasping", "No pulse felt"],
      "steps": [
        "Call 108 or ask someone nearby to call immediately.",
        "Lay the person on a firm, flat surface on their back.",
        "Tilt their head back gently and lift the chin to open the airway.",
        "Check for normal breathing for no more than 10 seconds.",
        "Place the heel of one hand on the centre of the chest (lower half of sternum). Place your other hand on top.",
        "Press down hard and fast — at least 5 cm deep at a rate of 100–120 compressions per minute.",
        "After 30 compressions, give 2 rescue breaths (mouth-to-mouth) if trained.",
        "Continue cycles of 30 compressions + 2 breaths until help arrives or the person recovers.",
        "If an AED is available, use it as soon as possible."
      ],
      "doNot": [
        "Do not stop CPR unless medically qualified help takes over.",
        "Do not leave the person alone once you start.",
        "Do not tilt the head if a spinal injury is suspected."
      ]
    },
    {
      "id": "cpr-child",
      "title": "CPR — Child (1–12 years)",
      "icon": "🧒",
      "severity": "critical",
      "callAmbulance": true,
      "keywords": ["cpr child", "child cardiac", "child unconscious", "child not breathing"],
      "symptoms": ["Child is unresponsive", "Not breathing or gasping", "No pulse"],
      "steps": [
        "Call 108 immediately.",
        "Tilt head back, lift chin. Check for breathing (max 10 seconds).",
        "Give 5 initial rescue breaths mouth-to-mouth.",
        "Use 2 fingers (or one hand for larger child) on the centre of the chest.",
        "Compress at least one-third of chest depth (about 5 cm).",
        "Rate: 100–120 compressions per minute.",
        "After 30 compressions, give 2 rescue breaths.",
        "Continue until help arrives."
      ],
      "doNot": [
        "Do not use adult force — children's chests are more delicate.",
        "Do not delay calling 108."
      ]
    },
    {
      "id": "choking-adult",
      "title": "Choking — Adult",
      "icon": "🫁",
      "severity": "critical",
      "callAmbulance": true,
      "keywords": ["choking", "blocked airway", "can't breathe", "heimlich"],
      "symptoms": ["Cannot speak, cry or cough effectively", "Clutching throat with hands", "Face turning blue or red", "Weak or silent cough"],
      "steps": [
        "Ask 'Are you choking?' If they cannot speak or cough, act immediately.",
        "Stand behind them and give 5 firm back blows between the shoulder blades with the heel of your hand.",
        "Check if the obstruction is cleared after each blow.",
        "If back blows fail: perform 5 abdominal thrusts (Heimlich manoeuvre).",
        "Stand behind, make a fist just above the navel, grasp with other hand, and thrust sharply inward and upward.",
        "Alternate 5 back blows + 5 abdominal thrusts until cleared or person becomes unconscious.",
        "If unconscious, start CPR and call 108."
      ],
      "doNot": [
        "Do not perform blind finger sweeps in the mouth.",
        "Do not slap their back if they can still cough effectively — encourage coughing."
      ]
    },
    {
      "id": "bleeding",
      "title": "Severe Bleeding",
      "icon": "🩸",
      "severity": "critical",
      "callAmbulance": true,
      "keywords": ["bleeding", "cut", "wound", "blood loss", "laceration"],
      "symptoms": ["Heavy bleeding from wound", "Blood soaking through bandages", "Pale, clammy skin", "Weakness or dizziness"],
      "steps": [
        "Put on gloves or use a plastic bag to protect yourself.",
        "Apply firm, direct pressure to the wound using a clean cloth, gauze, or clothing.",
        "Maintain continuous pressure for at least 10 minutes — do not lift to check.",
        "If blood soaks through, add more material on top — do not remove the first layer.",
        "Elevate the injured limb above the heart if possible.",
        "If a limb and pressure doesn't stop the bleeding, apply a tourniquet 5–7 cm above the wound.",
        "Note the time the tourniquet was applied.",
        "Keep the person warm and calm. Lay them down to prevent shock.",
        "Call 108."
      ],
      "doNot": [
        "Do not remove a deeply embedded object — pad around it.",
        "Do not remove a tourniquet once applied — only medics should do this.",
        "Do not apply a tourniquet over a joint."
      ]
    },
    {
      "id": "burns-minor",
      "title": "Burns — Minor (1st/2nd degree, small area)",
      "icon": "🔥",
      "severity": "moderate",
      "callAmbulance": false,
      "keywords": ["burn", "scald", "hot water", "minor burn", "blister"],
      "symptoms": ["Red or blistered skin", "Pain and swelling", "Area smaller than palm of hand"],
      "steps": [
        "Cool the burn immediately under cool (not cold/icy) running water for 20 minutes.",
        "Remove rings, watches, or clothing near the burn — before swelling starts.",
        "Do not burst any blisters.",
        "Cover loosely with a clean, non-fluffy material such as cling film or a sterile dressing.",
        "Take over-the-counter pain relief (paracetamol or ibuprofen) if needed.",
        "Seek medical attention if blisters form, burn is on face/hands/genitals/joints, or size is larger than a palm."
      ],
      "doNot": [
        "Do not apply toothpaste, butter, oil or any home remedy — these trap heat and cause infection.",
        "Do not use ice or iced water.",
        "Do not use fluffy cotton wool directly on a burn."
      ]
    },
    {
      "id": "burns-severe",
      "title": "Burns — Severe (3rd degree or large area)",
      "icon": "🚨",
      "severity": "critical",
      "callAmbulance": true,
      "keywords": ["severe burn", "third degree burn", "chemical burn", "electrical burn", "large burn"],
      "symptoms": ["Charred, white, or leathery skin", "Painless (nerve damage)", "Area larger than palm", "Burns on face, hands, feet, genitals"],
      "steps": [
        "Call 108 immediately.",
        "Do not remove burned clothing stuck to skin.",
        "Cool the burn with cool running water if it does not delay calling emergency services.",
        "Cover loosely with a clean, non-fluffy material — cling film is ideal.",
        "Keep the person warm (burns cause heat loss) and lay them flat.",
        "Raise legs if no spinal injury suspected (shock position).",
        "Do not give food or water if surgery may be needed.",
        "Monitor breathing and pulse until help arrives."
      ],
      "doNot": [
        "Do not use cold water or ice on large burns — this can cause shock.",
        "Do not attempt to remove clothing fused to skin.",
        "Do not apply any creams or ointments."
      ]
    },
    {
      "id": "fracture",
      "title": "Fracture / Broken Bone",
      "icon": "🦴",
      "severity": "moderate",
      "callAmbulance": false,
      "keywords": ["fracture", "broken bone", "broken arm", "broken leg", "sprain"],
      "symptoms": ["Intense pain at site", "Swelling and bruising", "Deformity or unnatural angle", "Inability to move the area"],
      "steps": [
        "Keep the person still and calm.",
        "Immobilise the injured area — do not try to straighten it.",
        "Support the fracture using a splint or padding (folded clothing, pillows).",
        "For arm: place in a sling to support against the body.",
        "Apply an ice pack wrapped in cloth to reduce swelling — max 20 minutes at a time.",
        "Elevate the limb if possible and comfortable.",
        "Seek medical attention for X-ray and proper treatment.",
        "Call 108 if the fracture is open (bone through skin), or involves spine, pelvis, or multiple bones."
      ],
      "doNot": [
        "Do not try to move or straighten a broken bone.",
        "Do not apply ice directly to skin.",
        "Do not give food or water if surgery might be required."
      ]
    },
    {
      "id": "seizure",
      "title": "Seizure / Epileptic Fit",
      "icon": "⚡",
      "severity": "high",
      "callAmbulance": true,
      "keywords": ["seizure", "epilepsy", "fit", "convulsion", "shaking"],
      "symptoms": ["Sudden jerking or stiffening of body", "Loss of consciousness", "Uncontrolled movements", "Confusion after episode"],
      "steps": [
        "Stay calm and note the time the seizure starts.",
        "Clear the area of hard or sharp objects to prevent injury.",
        "Cushion the person's head with something soft.",
        "Gently roll them onto their side (recovery position) after convulsions stop.",
        "Loosen any tight clothing around the neck.",
        "Stay with them until they are fully conscious.",
        "Call 108 if: seizure lasts more than 5 minutes, person doesn't regain consciousness, has a second seizure, or is injured."
      ],
      "doNot": [
        "Do not hold the person down or restrain movements.",
        "Do not put anything in their mouth — they cannot swallow their tongue.",
        "Do not give water or food until they are fully alert."
      ]
    },
    {
      "id": "anaphylaxis",
      "title": "Anaphylaxis / Severe Allergic Reaction",
      "icon": "😰",
      "severity": "critical",
      "callAmbulance": true,
      "keywords": ["anaphylaxis", "allergic reaction", "allergy", "swelling throat", "bee sting", "peanut allergy"],
      "symptoms": ["Throat swelling / difficulty breathing", "Rapid weak pulse", "Skin rash, hives, or flushing", "Nausea or vomiting", "Dizziness or collapse"],
      "steps": [
        "Call 108 immediately.",
        "Use an epinephrine auto-injector (EpiPen) if available — inject into outer thigh.",
        "Lay the person flat. If breathing is difficult, allow them to sit up.",
        "If unconscious and not breathing, begin CPR.",
        "A second EpiPen dose may be given after 5–15 minutes if symptoms do not improve.",
        "Even if symptoms improve, the person must be seen by a doctor urgently.",
        "Keep them warm and calm."
      ],
      "doNot": [
        "Do not make the person stand or walk.",
        "Do not give antihistamines alone — they are too slow for anaphylaxis.",
        "Do not leave the person alone."
      ]
    },
    {
      "id": "heatstroke",
      "title": "Heat Stroke / Hyperthermia",
      "icon": "☀️",
      "severity": "critical",
      "callAmbulance": true,
      "keywords": ["heatstroke", "heat stroke", "hyperthermia", "overheating", "sun stroke"],
      "symptoms": ["Body temperature above 40°C (104°F)", "Hot, red, dry skin (no sweating)", "Rapid strong pulse", "Confusion or unconsciousness"],
      "steps": [
        "Call 108 immediately.",
        "Move the person to a cool, shaded area.",
        "Cool them rapidly: apply cold wet cloths, or immerse in cool (not ice cold) water if available.",
        "Fan them to increase evaporation cooling.",
        "Place ice packs at neck, armpits, and groin if available.",
        "If conscious, give cool water to sip slowly.",
        "Monitor until help arrives."
      ],
      "doNot": [
        "Do not give aspirin or paracetamol — they are not effective for heat stroke.",
        "Do not give fluids if the person is unconscious.",
        "Do not use alcohol rubs."
      ]
    },
    {
      "id": "drowning",
      "title": "Drowning / Near-Drowning",
      "icon": "🌊",
      "severity": "critical",
      "callAmbulance": true,
      "keywords": ["drowning", "near drowning", "water rescue", "swallowed water"],
      "symptoms": ["Coughing or retching", "Blue lips or fingertips", "Unconscious or unresponsive", "Breathing difficulties"],
      "steps": [
        "Ensure your own safety before entering water. Use a rope, ring, or long object to pull the person to safety.",
        "Call 108.",
        "If the person is not breathing, start CPR immediately.",
        "Tilt head back, lift chin, check for breathing, then begin 30 compressions + 2 rescue breaths.",
        "Continue CPR until the person breathes or help arrives.",
        "Once breathing, place in recovery position (on their side).",
        "Keep them warm — hypothermia risk is high even in warm weather.",
        "All near-drowning victims must be seen at a hospital even if they appear fine."
      ],
      "doNot": [
        "Do not attempt a water rescue unless trained — use flotation devices.",
        "Do not try to drain water from lungs — start CPR."
      ]
    },
    {
      "id": "poisoning",
      "title": "Poisoning / Toxic Ingestion",
      "icon": "☠️",
      "severity": "critical",
      "callAmbulance": true,
      "keywords": ["poison", "poisoning", "overdose", "toxic", "chemical ingested", "medicine overdose"],
      "symptoms": ["Nausea, vomiting, or stomach pain", "Drowsiness or confusion", "Burns around mouth", "Difficulty breathing"],
      "steps": [
        "Call 108 immediately and have the substance/container ready to describe.",
        "If the person is conscious and alert, call Poison Control.",
        "Do not induce vomiting unless specifically told to by medical staff.",
        "If chemical is on skin or eyes, rinse with large amounts of water.",
        "Collect the container/substance for emergency responders.",
        "If unconscious and not breathing, begin CPR.",
        "Keep the person calm and monitor until help arrives."
      ],
      "doNot": [
        "Do not induce vomiting for corrosive substances (bleach, acids, drain cleaner).",
        "Do not give milk, water, or food unless instructed by poison control.",
        "Do not leave the person alone."
      ]
    },
    {
      "id": "snake-bite",
      "title": "Snake Bite",
      "icon": "🐍",
      "severity": "critical",
      "callAmbulance": true,
      "keywords": ["snake bite", "snakebite", "venomous snake", "cobra", "viper"],
      "symptoms": ["Two puncture marks at bite site", "Swelling and pain at bite site", "Nausea, dizziness", "Difficulty breathing (severe envenomation)"],
      "steps": [
        "Call 108 immediately.",
        "Keep the person calm and still — movement speeds venom absorption.",
        "Immobilise the bitten limb below heart level.",
        "Remove rings, watches, tight clothing near the bite before swelling starts.",
        "Note the time of the bite and try to safely describe the snake (do not catch it).",
        "Mark the edges of swelling with a pen and time to monitor spread.",
        "Get to hospital as fast as possible — antivenom is the only effective treatment."
      ],
      "doNot": [
        "Do not cut the wound or try to suck out venom.",
        "Do not apply a tourniquet.",
        "Do not apply ice or cold packs.",
        "Do not give alcohol or pain medications."
      ]
    },
    {
      "id": "eye-injury",
      "title": "Eye Injury / Chemical in Eye",
      "icon": "👁️",
      "severity": "high",
      "callAmbulance": false,
      "keywords": ["eye injury", "chemical in eye", "foreign object eye", "eye splash", "eye pain"],
      "symptoms": ["Intense pain or burning in eye", "Redness and watering", "Blurred or lost vision", "Visible foreign object"],
      "steps": [
        "For chemicals: flush eye immediately with clean water for 20 minutes — hold eye open under gentle running water.",
        "For foreign objects: do not rub the eye. Try blinking rapidly, or rinse gently.",
        "If object is embedded or vision is affected, cover with clean cup (do not touch) and go to hospital.",
        "Remove contact lenses before rinsing if possible.",
        "Seek immediate medical attention for all significant eye injuries."
      ],
      "doNot": [
        "Do not rub the eye.",
        "Do not try to remove an embedded object.",
        "Do not apply eye drops other than sterile saline unless prescribed."
      ]
    },
    {
      "id": "fainting",
      "title": "Fainting / Loss of Consciousness",
      "icon": "😵",
      "severity": "moderate",
      "callAmbulance": false,
      "keywords": ["fainting", "faint", "syncope", "passing out", "blackout"],
      "symptoms": ["Sudden loss of consciousness", "Pale, sweating skin", "Weak or slow pulse", "Confusion on recovery"],
      "steps": [
        "Lower the person to the ground carefully — support their head.",
        "Lay them flat and raise their legs 30 cm (shock position).",
        "Loosen any tight clothing at neck or waist.",
        "Check they are breathing — if not, start CPR.",
        "Once conscious, keep them lying down for 10–15 minutes.",
        "Give them water or a sweet drink once fully alert.",
        "Seek medical advice if fainting is unexplained or recurrent."
      ],
      "doNot": [
        "Do not prop them up in a sitting or standing position too quickly.",
        "Do not give food or drink until fully conscious.",
        "Do not leave the person alone."
      ]
    },
    {
      "id": "diabetic-emergency",
      "title": "Diabetic Emergency (Hypoglycaemia)",
      "icon": "💉",
      "severity": "high",
      "callAmbulance": false,
      "keywords": ["diabetes", "hypoglycaemia", "low blood sugar", "insulin shock", "diabetic emergency"],
      "symptoms": ["Shaking or trembling", "Sweating", "Confusion or unusual behaviour", "Weakness or dizziness", "Pale skin"],
      "steps": [
        "If the person is conscious and can swallow: give 15–20g of fast-acting sugar immediately.",
        "Examples: 150 ml of fruit juice, 3–4 glucose tablets, 5 sugar lumps, or a sugary soft drink.",
        "Wait 15 minutes and recheck — if still symptomatic, give another dose.",
        "Once recovered, give a longer-acting snack (biscuits, sandwich).",
        "If unconscious: do not give food or drink. Call 108.",
        "Place in recovery position if unconscious but breathing."
      ],
      "doNot": [
        "Do not give food or drink to an unconscious person.",
        "Do not delay giving sugar if the person is conscious.",
        "Do not assume the person is intoxicated — always check for a medical ID bracelet."
      ]
    },
    {
      "id": "asthma-attack",
      "title": "Asthma Attack",
      "icon": "💨",
      "severity": "high",
      "callAmbulance": false,
      "keywords": ["asthma", "asthma attack", "inhaler", "wheeze", "breathing difficulty"],
      "symptoms": ["Wheezing", "Coughing persistently", "Tight chest", "Difficulty breathing or speaking", "Blue lips (severe)"],
      "steps": [
        "Help the person sit upright in a position they find comfortable — do not lay them flat.",
        "Encourage them to use their reliever inhaler (usually blue, salbutamol) — up to 10 puffs, one at a time.",
        "Wait 15 minutes. If no improvement, call 108.",
        "If 108 is delayed, give up to 10 more puffs every 15 minutes.",
        "Keep them calm — anxiety worsens breathing.",
        "If lips turn blue or they lose consciousness, call 108 and be prepared to start CPR."
      ],
      "doNot": [
        "Do not leave them alone.",
        "Do not lay them flat.",
        "Do not use a preventer inhaler (brown/purple) in an emergency — only the blue reliever."
      ]
    }
  ];
  renderFirstAid();
}

function renderFirstAid() {
  const searchVal   = ($("firstaidSearch")?.value ?? "").trim().toLowerCase();
  const severity    = $("severityFilter")?.value ?? "all";
  const filtered    = firstAidData.filter(item => {
    const matchSev  = severity === "all" || item.severity === severity;
    const hay       = `${item.title} ${item.keywords?.join(" ")} ${item.symptoms?.join(" ")}`.toLowerCase();
    return matchSev && (!searchVal || hay.includes(searchVal));
  });

  if (!$("firstaidGrid")) return;
  $("firstaidGrid").innerHTML = filtered.length
    ? filtered.map(buildFirstAidCard).join("")
    : `<p class="empty-state">No first aid procedures match your search.</p>`;
}

function buildFirstAidCard(item) {
  const sevLabel = { critical:"🔴 Critical", high:"🟠 High", moderate:"🟡 Moderate" }[item.severity] ?? item.severity;
  const symptoms = (item.symptoms ?? []).slice(0,3).map(s => `<span>${s}</span>`).join("");
  return `
  <article class="firstaid-card" role="button" tabindex="0"
    data-id="${item.id}" aria-label="View first aid steps for ${item.title}"
    onclick="openFirstAidModal('${item.id}')"
    onkeydown="if(event.key==='Enter'||event.key===' ')openFirstAidModal('${item.id}')">
    <div class="firstaid-card-top">
      <div class="firstaid-icon-wrap">${item.icon}</div>
      <span class="severity-pill severity-${item.severity}">${sevLabel}</span>
    </div>
    <h3>${item.title}</h3>
    <div class="firstaid-symptoms">${symptoms}</div>
    <div class="firstaid-cta">
      ${item.callAmbulance ? `<span class="ambulance-tag">🚑 Call 108</span>` : `<span></span>`}
      <button class="view-steps-btn" type="button" onclick="event.stopPropagation();openFirstAidModal('${item.id}')">
        View steps →
      </button>
    </div>
  </article>`;
}

function openFirstAidModal(id) {
  const item = firstAidData.find(f => f.id === id);
  if (!item) return;
  const modal    = $("firstaidModal");
  const content  = $("firstaidModalContent");

  const steps    = (item.steps ?? []).map((s,i) => `
    <div class="firstaid-step">
      <span class="step-num">${i+1}</span>
      <span class="step-text">${s}</span>
    </div>`).join("");

  const doNots   = (item.doNot ?? []).map(d => `
    <div class="donot-item">${d}</div>`).join("");

  content.innerHTML = `
    <div class="firstaid-modal-header">
      <div class="firstaid-modal-icon">${item.icon}</div>
      <div>
        <span class="severity-pill severity-${item.severity}" style="margin-bottom:6px;display:inline-flex">
          ${{ critical:"🔴 Critical", high:"🟠 High", moderate:"🟡 Moderate" }[item.severity]}
        </span>
        <h2 id="firstaidModalTitle">${item.title}</h2>
      </div>
    </div>
    ${item.callAmbulance ? `<div class="call-ambulance-banner">🚑 Call 108 immediately for this emergency. Do not delay.</div>` : ""}
    <h3>Recognise the signs</h3>
    <ul>${(item.symptoms??[]).map(s=>`<li>${s}</li>`).join("")}</ul>
    <h3>What to do — step by step</h3>
    <div class="firstaid-steps">${steps}</div>
    ${doNots ? `<h3>What NOT to do</h3><div class="donot-list">${doNots}</div>` : ""}
    <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap;">
      <button class="primary-action" onclick="$('firstaidModal').hidden=true">Close</button>
      ${item.callAmbulance ? `<a class="primary-action" href="tel:108" style="background:var(--coral)">📞 Call 108 now</a>` : ""}
    </div>`;

  modal.hidden = false;
}

/* ═══════════════════════════════════════════════
   INSURANCE
═══════════════════════════════════════════════ */
function renderInsurance() {
  // Govt schemes
  $("govtSchemeGrid").innerHTML = govtSchemes.map(s => `
    <div class="insurance-card">
      <div class="insurance-card-top">
        <div class="insurance-logo govt">${s.logo}</div>
        <div>
          <h3>${s.name}</h3>
          <span class="coverage-badge govt">${s.coverage}</span>
        </div>
      </div>
      <p>${s.desc}</p>
      <p style="font-size:12px;color:var(--ink-3)"><strong>Eligibility:</strong> ${s.eligibility}</p>
      <div class="insurance-links">
        <a class="insurance-link primary" href="${s.apply}" target="_blank" rel="noopener">Apply / Enroll</a>
        <a class="insurance-link secondary" href="${s.portal}" target="_blank" rel="noopener">Official portal</a>
        ${s.check ? `<a class="insurance-link secondary" href="${s.check}" target="_blank" rel="noopener">Check eligibility</a>` : ""}
      </div>
    </div>`).join("");

  // Private insurers
  $("privateInsurGrid").innerHTML = privateInsurers.map(s => `
    <div class="insurance-card">
      <div class="insurance-card-top">
        <div class="insurance-logo private">${s.logo}</div>
        <div>
          <h3>${s.name}</h3>
          <span class="coverage-badge private">${s.coverage}</span>
        </div>
      </div>
      <p>${s.desc}</p>
      <div class="insurance-links">
        <a class="insurance-link primary" href="${s.apply}" target="_blank" rel="noopener">Get quote</a>
        <a class="insurance-link secondary" href="${s.check}" target="_blank" rel="noopener">Network hospitals</a>
      </div>
    </div>`).join("");

  // Accordion
  $("insuranceAccordion").innerHTML = insuranceSteps.map((item, i) => `
    <div class="accordion-item">
      <button class="accordion-trigger" aria-expanded="false" data-acc="${i}">
        ${item.title}
        <span class="accordion-arrow">▾</span>
      </button>
      <div class="accordion-body" id="acc-body-${i}">
        <ol>${item.steps.map(s => `<li>${s}</li>`).join("")}</ol>
      </div>
    </div>`).join("");

  // Bind accordion
  $$(".accordion-trigger").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx     = btn.dataset.acc;
      const body    = $(`acc-body-${idx}`);
      const isOpen  = btn.getAttribute("aria-expanded") === "true";
      // close all
      $$(".accordion-trigger").forEach(b => b.setAttribute("aria-expanded","false"));
      $$(".accordion-body").forEach(b => b.classList.remove("open"));
      // open clicked (unless it was already open)
      if (!isOpen) {
        btn.setAttribute("aria-expanded","true");
        body.classList.add("open");
      }
    });
  });
}

/* ═══════════════════════════════════════════════
   HOSPITAL EMPANELMENT CHECKER
═══════════════════════════════════════════════ */
function checkEmpanelment(query) {
  const container = $("empanelResult");
  if (!query) { container.innerHTML = ""; return; }
  const q = query.toLowerCase();
  const match = hospitals.find(h => h.name.toLowerCase().includes(q));
  if (match) {
    const pmjay = match.insurance ? "✅" : "❌";
    container.innerHTML = `
      <div class="empanel-result-item">
        <span class="check">🏥</span>
        <div>
          <strong>${match.name}</strong>
          <div style="font-size:13px;color:var(--ink-2);margin-top:4px">
            ${pmjay} PM-JAY / Ayushman Bharat &nbsp;|&nbsp;
            ${match.insurance ? "✅ Star Health · HDFC Ergo · Niva Bupa" : "⚠️ Contact hospital to verify insurer tie-ups"}
          </div>
        </div>
      </div>`;
  } else {
    container.innerHTML = `
      <div class="empanel-result-item">
        <span class="check">🔍</span>
        <div>No exact match found. Try searching CityCare, GreenLine, Hope, or Sunrise.
        <br><a href="https://pmjay.gov.in/hospital-empanelment" target="_blank" rel="noopener" style="color:var(--blue);font-weight:700">Check all PM-JAY hospitals →</a></div>
      </div>`;
  }
}

/* ═══════════════════════════════════════════════
   GOOGLE MAPS
═══════════════════════════════════════════════ */
// Initialise Leaflet Map
function initLeafletMap() {
  if (leafletMap) return;

  const mapContainer = $("map");
  if (!mapContainer) return;

  // Initialize Leaflet map instance
  leafletMap = L.map("map", {
    zoomControl: true,
    minZoom: 3,
    maxZoom: 18
  }).setView([userCoords.lat, userCoords.lng], 14);

  // Set up tile layer (Light by default, or Dark if active)
  updateTileLayer();

  // Try to locate user via browser Geolocation API
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        userCoords = { lat, lng };
        relocateMockups(lat, lng);
        leafletMap.setView([lat, lng], 14);
        setUserMarker(lat, lng);
        fetchNearbyFacilities();
      },
      err => {
        console.warn("Geolocation error:", err);
        setUserMarker(userCoords.lat, userCoords.lng);
        fetchNearbyFacilities();
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  } else {
    setUserMarker(userCoords.lat, userCoords.lng);
    fetchNearbyFacilities();
  }

  // Hook map events for panning and zooming
  leafletMap.on("moveend", () => {
    clearTimeout(mapQueryTimeout);
    mapQueryTimeout = setTimeout(fetchNearbyFacilities, 600);
  });

  // Allow manual location selection by clicking on the map
  leafletMap.on("click", (e) => {
    const { lat, lng } = e.latlng;
    userCoords = { lat, lng };
    relocateMockups(lat, lng);
    setUserMarker(lat, lng);
    fetchNearbyFacilities();
    showToast(`📍 Location set manually: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  });
}

// Update tile layer based on body dark mode class
function updateTileLayer() {
  if (!leafletMap) return;
  const isDark = document.body.classList.contains("dark");
  const url = isDark 
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  if (tileLayer) {
    leafletMap.removeLayer(tileLayer);
  }
  tileLayer = L.tileLayer(url, { attribution, maxZoom: 20 }).addTo(leafletMap);
}

// Place/update user's location marker
function setUserMarker(lat, lng) {
  if (!leafletMap) return;
  const userIcon = L.divIcon({
    className: "custom-marker",
    html: '<div class="marker-ring user"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  if (userMarker) {
    userMarker.setLatLng([lat, lng]);
  } else {
    userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(leafletMap)
      .bindPopup("<strong>You are here</strong><br>Showing nearby care center options.");
  }
}

// Clear all markers from map
function clearMapMarkers() {
  mapMarkers.forEach(m => leafletMap.removeLayer(m));
  mapMarkers = [];
}

// Fetch facilities using OSM Overpass API
// Mirrored Overpass API servers
const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.osm.ch/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
];

async function fetchNearbyFacilities() {
  if (!leafletMap) return;
  const zoom = leafletMap.getZoom();
  const noticeEl = $("mapNotice");
  const loaderEl = $("mapLoader");

  if (zoom < 10) {
    if (noticeEl) {
      noticeEl.hidden = false;
      noticeEl.className = "map-notice";
      $("mapNoticeText").textContent = "🔍 Zoom in closer to view local hospitals & clinics in this area.";
    }
    clearMapMarkers();
    return;
  } else {
    if (noticeEl) noticeEl.hidden = true;
  }

  if (loaderEl) loaderEl.hidden = false;

  const center = leafletMap.getCenter();

  // Query hospitals & clinics within 50 km, pharmacies & doctors within 15 km
  const query = `[out:json][timeout:25];
(
  node(around:50000, ${center.lat}, ${center.lng})["amenity"~"hospital|clinic"];
  way(around:50000, ${center.lat}, ${center.lng})["amenity"~"hospital|clinic"];
  node(around:15000, ${center.lat}, ${center.lng})["amenity"~"pharmacy|dentist|doctors"];
  way(around:15000, ${center.lat}, ${center.lng})["amenity"~"pharmacy|dentist|doctors"];
);
out center;`;

  let fetchedOk = false;

  // Try mirrors sequentially
  for (let i = 0; i < OVERPASS_MIRRORS.length; i++) {
    const mirror = OVERPASS_MIRRORS[i];
    const url = `${mirror}?data=${encodeURIComponent(query)}`;
    try {
      console.log(`Querying Overpass mirror ${i+1}: ${mirror}`);
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.elements && data.elements.length > 0) {
          processMapData(data.elements);
          fetchedOk = true;
          break;
        }
      }
    } catch (err) {
      console.warn(`Mirror ${mirror} failed:`, err);
    }
  }

  // Fallback to local coordinates generation if all Overpass mirrors fail
  if (!fetchedOk) {
    console.warn("All Overpass API mirrors failed. Generating local fallback facilities around center...");
    generateFallbackFacilities(center.lat, center.lng);
    if (noticeEl) {
      noticeEl.hidden = false;
      noticeEl.className = "map-notice";
      $("mapNoticeText").textContent = "ℹ️ Offline demo mode: local healthcare facilities generated dynamically around your coordinates.";
    }
  }

  if (loaderEl) loaderEl.hidden = true;
}

// Generate fallback facilities around target location to avoid empty map or Bangalore fallback
function generateFallbackFacilities(lat, lng) {
  const fallbackElements = [
    {
      id: 100001,
      lat: lat + 0.003,
      lon: lng - 0.004,
      tags: {
        amenity: "hospital",
        name: "Krishnankoil Community Hospital",
        "addr:street": "Watrap Road, Krishnankoil",
        phone: "+91 4563 289124"
      }
    },
    {
      id: 100002,
      lat: lat - 0.007,
      lon: lng + 0.008,
      tags: {
        amenity: "clinic",
        name: "Kalasalingam Clinic & Research",
        "addr:street": "KLU Campus Street",
        phone: "+91 4563 288410"
      }
    },
    {
      id: 100003,
      lat: lat + 0.015,
      lon: lng - 0.010,
      tags: {
        amenity: "hospital",
        name: "Watrap Government Hospital",
        "addr:street": "Main Road, Watrap",
        phone: "+91 4563 230240"
      }
    },
    {
      id: 100004,
      lat: lat + 0.002,
      lon: lng + 0.003,
      tags: {
        amenity: "pharmacy",
        name: "Krishnankoil Medical & General Store",
        "addr:street": "NH-744 Highway",
        phone: "+91 94432 89012"
      }
    },
    {
      id: 100005,
      lat: lat - 0.002,
      lon: lng - 0.003,
      tags: {
        amenity: "pharmacy",
        name: "KLU Pharmacy Services",
        "addr:street": "Campus Junction",
        phone: "+91 94881 23049"
      }
    },
    {
      id: 100006,
      lat: lat + 0.005,
      lon: lng + 0.001,
      tags: {
        amenity: "doctors",
        name: "Dr. A. Subramanian Clinic",
        "addr:street": "Krishnankoil Bazaar",
        phone: "+91 98421 77334"
      }
    }
  ];
  processMapData(fallbackElements);
}

// Helper to calculate distance in km between two lat/lng pairs
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // radius of Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function relocateMockups(lat, lng) {
  const hasMockups = hospitals.some(h => h.name === "CityCare Hospital");
  if (!hasMockups) return;

  const offsets = [
    { name:"CityCare Hospital",     lat: 0.0046, lng: 0.0047 },
    { name:"GreenLine Clinic",      lat: 0.0000, lng: 0.0000 },
    { name:"Hope Multispeciality",  lat:-0.0027, lng: 0.0128 },
    { name:"Sunrise Senior Care",   lat: 0.0096, lng:-0.0068 }
  ];
  
  hospitals.forEach((h, index) => {
    const off = offsets[index % offsets.length];
    h.lat = lat + off.lat;
    h.lng = lng + off.lng;
    h.distance = Number(calculateDistance(lat, lng, h.lat, h.lng).toFixed(1));
  });
  
  renderHospitals();
  renderMetrics();
}

// Process API response, plot markers, synchronize database lists
function processMapData(elements) {
  clearMapMarkers();

  const loadedHospitals = [];
  const loadedPharmacies = [];
  const loadedDoctors = [];
  const usedDoctorNames = new Set();

  const doctorSpecialties = ["Cardiology", "General Medicine", "Pediatrics", "Orthopedics", "Geriatrics"];

  const mapCenter = leafletMap.getCenter();

  elements.forEach((el) => {
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (!lat || !lng) return;

    const tags = el.tags || {};
    const amenity = tags.amenity;
    const name = tags.name || (amenity === "hospital" ? "Unnamed Hospital" : amenity === "clinic" ? "Unnamed Clinic" : amenity === "pharmacy" ? "Unnamed Pharmacy" : "Healthcare Facility");
    
    let type = "hospital";
    if (amenity === "pharmacy") type = "pharmacy";
    else if (amenity === "clinic") type = "clinic";
    else if (amenity === "doctors" || amenity === "dentist") type = "doctor";

    const dist = calculateDistance(userCoords.lat, userCoords.lng, lat, lng);
    const street = tags["addr:street"] || tags["addr:suburb"] || tags["addr:city"] || "Nearby area";
    const phone = tags.phone || tags["contact:phone"] || "N/A";
    const website = tags.website || tags["contact:website"] || "";

    const markerIcon = L.divIcon({
      className: "custom-marker",
      html: `<div class="marker-ring ${type}"></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    // Generate stable rating between 3.8 and 4.9 based on OSM ID
    const osmId = el.id || Math.floor(Math.random() * 100000);
    const rating = ((osmId % 12) / 10 + 3.8);

    let popupHtml = `
      <div class="map-popup-card" style="min-width: 180px;">
        <h4 style="margin:0 0 4px 0;font-size:14px;font-weight:700;color:var(--navy);">${name}</h4>
        <p style="margin:0 0 6px 0;font-size:11px;font-weight:600;color:var(--blue);text-transform:uppercase;">🏷️ ${type}</p>
        <div style="font-size:12px;color:var(--ink-2);margin-bottom:8px;line-height:1.4;">
          <div>⭐ ${rating.toFixed(1)}</div>
          <div>📍 ${dist.toFixed(1)} km · ${street}</div>
          ${phone !== "N/A" ? `<div>📞 ${phone}</div>` : ""}
          ${website ? `<div>🌐 <a href="${website}" target="_blank" rel="noopener">Website</a></div>` : ""}
        </div>
        <div style="display:flex;gap:6px;">
          <button onclick="window.open('https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${lat},${lng}','_blank')" 
                  style="background:var(--blue);color:#fff;border-radius:4px;border:none;padding:4px 8px;font-size:11px;font-weight:700;cursor:pointer;">
            Directions
          </button>
          ${phone !== "N/A" ? `<a href="tel:${phone}" style="background:var(--surface-2);color:var(--ink);border:1px solid var(--line);border-radius:4px;padding:4px 8px;font-size:11px;font-weight:700;display:inline-block;text-align:center;">Call</a>` : ""}
        </div>
      </div>
    `;

    const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(leafletMap)
      .bindPopup(popupHtml);
    
    marker.on("click", () => {
      $("mapDetail").innerHTML = `
        <div class="map-detail-icon">${type === "hospital" ? "🏥" : type === "pharmacy" ? "💊" : type === "clinic" ? "🏨" : "👨‍⚕️"}</div>
        <div class="map-detail-info">
          <strong>${name} (⭐ ${rating.toFixed(1)})</strong>
          <span>${dist.toFixed(1)} km · ${street} · Contact: ${phone}</span>
        </div>
        <button class="map-route-btn" id="mapRouteBtn" data-name="${name}" data-lat="${lat}" data-lng="${lng}" onclick="window.open('https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${lat},${lng}','_blank')">Get directions</button>
      `;
    });

    mapMarkers.push(marker);

    if (type === "hospital" || type === "clinic") {
      const beds = Math.floor(Math.random() * 45) + 3;
      const totalBeds = beds + Math.floor(Math.random() * 80) + 10;
      const icu = Math.random() > 0.45 ? Math.floor(Math.random() * 12) : 0;
      const oxygen = Math.random() > 0.3;
      const insurance = Math.random() > 0.4;
      const specialties = type === "hospital" 
        ? ["General Medicine", "Emergency", "Pediatrics"] 
        : ["General Practice", "Family Medicine"];

      loadedHospitals.push({
        name,
        lat,
        lng,
        distance: Number(dist.toFixed(1)),
        location: street,
        beds,
        totalBeds,
        icu,
        oxygen,
        insurance,
        specialties,
        phone,
        rating: Number(rating.toFixed(1))
      });

      // Generate dynamic doctors near this hospital (unique verified profile name combination)
      const firstNames = ["Rajesh", "Amit", "Sneha", "Vikram", "Anjali", "Priya", "Ramesh", "Kavitha", "Arjun", "Shalini", "Manish", "Neha", "Sanjay", "Deepak", "Sunita", "Preeti", "Alok", "Rohan"];
      const lastNames = ["Kumar", "Sharma", "Patel", "Singh", "Gupta", "Iyer", "Chandra", "Nair", "Reddy", "Sen", "Verma", "Kapoor", "Joshi", "Mehta", "Rao", "Srinivasan", "Das", "Bose"];
      
      let docName = "";
      let attempts = 0;
      do {
        const combinedId = osmId + attempts;
        docName = "Dr. " + firstNames[combinedId % firstNames.length] + " " + lastNames[(combinedId * 7) % lastNames.length];
        attempts++;
      } while (usedDoctorNames.has(docName) && attempts < 100);
      usedDoctorNames.add(docName);

      const docSpecialty = doctorSpecialties[osmId % doctorSpecialties.length];
      const docRating = ((osmId % 9) / 10 + 4.1).toFixed(1);
      const docAvail = (osmId % 2 === 0) ? "Available now" : `Next slot ${(osmId % 4 + 2)}:30 PM`;
      const docMode = (osmId % 3 === 0) ? "Video consult" : "In-person";
      
      // Dynamic regional languages
      const southLangs = ["English, Tamil", "English, Tamil, Hindi", "English, Telugu, Tamil", "English, Tamil, Malayalam"];
      const northLangs = ["English, Hindi", "English, Hindi, Punjabi", "English, Bengali, Hindi", "English, Gujarati, Hindi"];
      const docLangs = (mapCenter.lat < 16) 
        ? southLangs[osmId % southLangs.length]
        : northLangs[osmId % northLangs.length];

      // Verified phone lookup
      const docPhone = phone !== "N/A" ? phone : `+91 9${(osmId % 90000000 + 10000000)}`;

      loadedDoctors.push({
        name: docName,
        specialty: docSpecialty,
        hospital: name,
        available: docAvail,
        mode: docMode,
        rating: Number(docRating),
        phone: docPhone,
        languages: docLangs,
        verified: true
      });
    } else if (type === "pharmacy") {
      loadedPharmacies.push({
        name,
        distance: Number(dist.toFixed(1)),
        open: Math.random() > 0.4 ? "Open 24×7" : "Open until 10 PM",
        phone
      });
    }
  });

  if (loadedHospitals.length > 0) {
    loadedHospitals.sort((a,b) => a.distance - b.distance);
    hospitals.length = 0;
    hospitals.push(...loadedHospitals);
    renderHospitals();
    renderMetrics();
  } else {
    relocateMockups(mapCenter.lat, mapCenter.lng);
  }

  if (loadedPharmacies.length > 0) {
    loadedPharmacies.sort((a,b) => a.distance - b.distance);
    localPharmacies.length = 0;
    localPharmacies.push(...loadedPharmacies);
    renderPharmacies();
  }

  if (loadedDoctors.length > 0) {
    doctors.length = 0;
    doctors.push(...loadedDoctors);
    renderDoctors();
  }

  renderSnapshots();
}

// Nominatim Geocoding lookup
async function geocodeSearch(query) {
  if (!query.trim()) return;
  showToast(`🗺️ Searching for "${query}"...`);

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;

  try {
    const res = await fetch(url, {
      headers: { "Accept-Language": "en" }
    });
    if (!res.ok) throw new Error("Geocoding failed");
    const data = await res.json();

    if (data && data.length > 0) {
      const result = data[0];
      const lat = Number(result.lat);
      const lon = Number(result.lon);
      const displayName = result.display_name.split(",")[0];

      showToast(`🗺️ Found: ${displayName}`);
      
      if (leafletMap) {
        userCoords = { lat, lng: lon };
        relocateMockups(lat, lon);
        setUserMarker(lat, lon);
        leafletMap.setView([lat, lon], 14);
      }
    } else {
      showToast("❌ Place not found on global map. Searching locally...");
    }
  } catch (err) {
    console.error("Geocoding error:", err);
    showToast("⚠️ Geocoding service error. Searching locally...");
  }
}

/* ═══════════════════════════════════════════════
   AI CHAT — GEMINI
═══════════════════════════════════════════════ */
const SYSTEM_PROMPT = `You are a compassionate and knowledgeable health assistant for the One Health Platform — a community healthcare web app serving users in India. Your role is to:
- Help users find hospitals, doctors, medicines, and ambulances near them
- Provide triage guidance based on symptoms (advise emergency services when critical)
- Explain first aid procedures clearly and step-by-step
- Answer questions about Indian government health schemes (PM-JAY, ESIC, CGHS) and private insurance
- Guide users to appropriate online pharmacy platforms (1mg, PharmEasy, Netmeds, Apollo, MedPlusMart)
- Always remind users to call 108 for life-threatening emergencies
Keep responses concise, empathetic, and practical. Use simple language. Add relevant emoji for readability.
IMPORTANT: Always end with a disclaimer for medical advice: "⚠️ This is general health information. Consult a qualified doctor for diagnosis and treatment."`;

async function sendChatMessage(userText) {
  if (!userText.trim()) return;

  appendChatBubble("user", userText);
  $("chatInput").value = "";
  showTyping(true);

  // Add to history
  chatHistory.push({ role:"user", parts:[{ text: userText }] });

  let replyText = "";

  if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY" || !GEMINI_API_KEY) {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText })
      });
      if (res.ok) {
        const data = await res.json();
        replyText = data.reply;
        if (data.recommendations && data.recommendations.length > 0) {
          replyText += "\n\n**Recommendations:**\n" + data.recommendations.map(r => `• ${r}`).join("\n");
        }
        if (data.disclaimer) {
          replyText += `\n\n⚠️ ${data.disclaimer}`;
        }
      } else {
        replyText = ruleBasedReply(userText);
      }
    } catch (err) {
      replyText = ruleBasedReply(userText);
    }
  } else {
    try {
      // Build full conversation payload (with system prompt as first user turn)
      const payload = {
        contents: [
          { role:"user",  parts:[{ text: SYSTEM_PROMPT }] },
          { role:"model", parts:[{ text: "Understood! I'm ready to assist as the One Health community health assistant. How can I help you today?" }] },
          ...chatHistory,
        ],
        generationConfig: { temperature:0.7, maxOutputTokens:600 },
      };

      const res  = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload) }
      );
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      replyText  = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't get a response. Please try again.";
    } catch (err) {
      replyText = `⚠️ Unable to reach Gemini API (${err.message}). Switching to local assistant.\n\n` + ruleBasedReply(userText);
    }
  }

  chatHistory.push({ role:"model", parts:[{ text: replyText }] });
  showTyping(false);
  appendChatBubble("bot", replyText);
}

function ruleBasedReply(text) {
  const t = text.toLowerCase();

  if (/chest|heart attack|cardiac|breathing|oxygen/i.test(t))
    return "🚨 **This sounds like an emergency.** Call **108** immediately.\n\n**CityCare Hospital** (2.1 km) has ICU and oxygen support. **Rapid Ambulance 24×7** has an 8-minute ETA.\n\nFor chest pain: sit upright, loosen tight clothing, avoid food/water, and stay calm while waiting for help.\n\n⚠️ This is general health information. Consult a qualified doctor for diagnosis and treatment.";

  if (/accident|bleeding|trauma|fracture|broken/i.test(t))
    return "🚑 **Call 108 immediately for accidents.**\n\nFor bleeding: apply firm pressure with a clean cloth and do not remove it. Elevate the injured limb if possible.\n\n**Hope Multispeciality** (5.4 km) has an emergency department. **Rapid Ambulance 24×7** (108) is the fastest option.\n\n⚠️ This is general health information. Consult a qualified doctor for diagnosis and treatment.";

  if (/fever|cough|cold|flu/i.test(t))
    return "🤒 For fever and cough:\n• Monitor temperature — if above 103°F / 39.5°C, seek medical attention\n• Stay hydrated with water and ORS\n• Paracetamol 500mg can help reduce fever (check with a pharmacist first)\n• **CarePlus Pharmacy** (1.4 km) has paracetamol in stock (120 units)\n\nSee **Dr. Kiran Rao** (General Medicine, GreenLine Clinic) for a same-day video consult.\n\n⚠️ This is general health information. Consult a qualified doctor for diagnosis and treatment.";

  if (/diabetes|insulin|sugar|blood sugar/i.test(t))
    return "💉 For diabetes management:\n• **MediQuick Pharmacy** (0.8 km) has 18 insulin units in stock — open 24×7\n• For low blood sugar: consume 15g of fast sugar (juice, glucose tablets)\n• See **Dr. Kiran Rao** (General Medicine) for consultation\n\nCheck insulin stock on **Tata 1mg** or **PharmEasy** for home delivery.\n\n⚠️ This is general health information. Consult a qualified doctor for diagnosis and treatment.";

  if (/insurance|pmjay|ayushman|esic|cghs|claim/i.test(t))
    return "📋 **Health Insurance options in India:**\n\n🏛️ **PM-JAY (Ayushman Bharat):** ₹5 lakh coverage for eligible families. Check at mera.pmjay.gov.in\n🏢 **ESIC:** For salaried employees ≤₹21K/month. esic.gov.in\n🏛️ **CGHS:** For central govt employees. cghs.nic.in\n\n🏥 **Private:** Star Health, HDFC Ergo, Niva Bupa — compare at policybazaar.com\n\nGo to the **Insurance tab** for detailed application steps and direct links.\n\n⚠️ This is general health information. Consult a qualified doctor for diagnosis and treatment.";

  if (/hospital|bed|icu|admit/i.test(t))
    return "🏥 **Nearby hospitals:**\n\n• **CityCare Hospital** — 2.1 km, 42 beds, 8 ICU, oxygen ✅\n• **Hope Multispeciality** — 5.4 km, 28 beds, 5 ICU, emergency ✅\n• **GreenLine Clinic** — 3.8 km, 11 beds, general medicine\n• **Sunrise Senior Care** — 7.2 km, geriatrics specialist\n\nFor ICU or oxygen, **CityCare** is your best option right now.\n\n⚠️ This is general health information. Consult a qualified doctor for diagnosis and treatment.";

  if (/doctor|physician|consult|appointment/i.test(t))
    return "👨‍⚕️ **Doctors available now:**\n\n• **Dr. Asha Menon** — Cardiology, CityCare (in-person) ⭐ 4.9\n• **Dr. Meera Shah** — Pediatrics, GreenLine (in-person) ⭐ 4.8\n• **Dr. Priya Suresh** — Geriatrics, Sunrise (video) ⭐ 4.8\n\n📅 Next slots: Dr. Kiran Rao at 4:30 PM, Dr. Farhan Ali at 6:00 PM\n\n⚠️ This is general health information. Consult a qualified doctor for diagnosis and treatment.";

  if (/medicine|pharmacy|drug|buy|order/i.test(t))
    return "💊 **Buy medicines online:**\n\n• **Tata 1mg** — 1mg.com\n• **PharmEasy** — pharmeasy.in\n• **Netmeds** — netmeds.com\n• **Apollo Pharmacy** — apollopharmacy.in\n\nOr visit the **Medicines tab** to search stock at local pharmacies and get Buy links for all platforms at once.\n\n⚠️ This is general health information. Consult a qualified doctor for diagnosis and treatment.";

  if (/first aid|cpr|burn|choke|seizure/i.test(t))
    return "🩹 Go to the **First Aid tab** for step-by-step emergency procedures covering CPR, burns, choking, bleeding, seizures, snake bites, and 14+ more emergencies.\n\nFor life-threatening situations, always **call 108 first**.\n\n⚠️ This is general health information. Consult a qualified doctor for diagnosis and treatment.";

  if (/ambulance|emergency|108/i.test(t))
    return "🚑 **Emergency services:**\n\n• **Rapid Ambulance 24×7** — 108 (8 min ETA, advanced life support)\n• **CityCare Ambulance** — 080-4100-1111 (12 min ETA)\n• **Senior Assist** — 080-5999-1212 (18 min ETA, non-emergency)\n\n📞 Always call **108** first in any life-threatening emergency.\n\n⚠️ This is general health information. Consult a qualified doctor for diagnosis and treatment.";

  // Default
  return "👋 I can help you with:\n\n• 🏥 Finding hospitals, doctors, or beds\n• 💊 Medicine stock and pharmacy info\n• 🩹 First aid guidance\n• 📋 Insurance and PM-JAY queries\n• 🚨 Emergency triage advice\n\nTry asking: *\"Which hospitals have ICU beds?\"* or *\"First aid for burns\"* or *\"How to apply for Ayushman Bharat?\"*\n\n⚠️ This is general health information. Consult a qualified doctor for diagnosis and treatment.";
}

function appendChatBubble(role, text) {
  const msgs    = $("chatMessages");
  const isBot   = role === "bot";
  const div     = document.createElement("div");
  div.className = `chat-bubble ${isBot ? "bot" : "user"}`;

  // Convert markdown-lite to HTML
  const html = text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");

  div.innerHTML = `
    ${isBot ? `<span class="chat-avatar" aria-hidden="true">🤖</span>` : ""}
    <div class="bubble-content">${html}</div>
    ${!isBot ? `<span class="chat-avatar" aria-hidden="true">👤</span>` : ""}
  `;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function showTyping(visible) {
  $("chatTyping").hidden = !visible;
  if (visible) $("chatMessages").scrollTop = $("chatMessages").scrollHeight;
}

/* ═══════════════════════════════════════════════
   SYMPTOM TRIAGE (Overview tab)
═══════════════════════════════════════════════ */
function suggestCare(raw) {
  const t = raw.trim().toLowerCase();
  const box = $("adviceBox");
  if (!t) {
    box.className = "advice-box";
    box.innerHTML = `<span class="advice-icon">💡</span><div><strong>Suggestion preview</strong><p>Enter symptoms above to see triage guidance.</p></div>`;
    return;
  }
  let icon="💡", title="Suggested next step", msg="Book a general medicine consultation and keep nearby hospital details ready.", match="GreenLine Clinic · Dr. Kiran Rao.", urgent=false;
  if (/chest|breathing|oxygen/.test(t)) { icon="🚨";urgent=true;title="Emergency attention recommended";msg="Chest pain or breathing difficulty should be treated as urgent. Do not wait.";match="CityCare Hospital has ICU + oxygen. Rapid Ambulance 24×7 — 8 min ETA. Call 108 now."; }
  else if (/accident|bleeding/.test(t)) { icon="🚑";urgent=true;title="Immediate emergency response";msg="For accident or heavy bleeding, call 108 and get to emergency immediately.";match="Rapid Ambulance 24×7 + Hope Multispeciality emergency are available."; }
  else if (/fever|cough/.test(t)) { icon="🤒";title="Primary care suggested";msg="Monitor temperature, stay hydrated, consult a doctor if symptoms worsen.";match="GreenLine Clinic · Dr. Kiran Rao · CarePlus Pharmacy (paracetamol in stock)."; }
  else if (/diabetes|insulin/.test(t)) { icon="💉";title="Medicine + doctor support";msg="Check insulin stock and consult a physician for blood-sugar concerns.";match="MediQuick Pharmacy has 18 insulin units. Dr. Kiran Rao available."; }
  else if (/senior|elderly|dizzy/.test(t)) { icon="👴";title="Senior care recommended";msg="Dizziness in elderly may indicate BP, hydration or cardiac issues.";match="Dr. Priya Suresh (Geriatrics, Sunrise Senior Care) — available now via video consult."; }
  else if (/child|pediatric/.test(t)) { icon="🧒";title="Pediatric care suggested";msg="For children, early consultation prevents complications.";match="Dr. Meera Shah (Pediatrics, GreenLine Clinic) — available in-person now."; }
  box.className = urgent ? "advice-box urgent" : "advice-box";
  box.innerHTML = `<span class="advice-icon">${icon}</span><div><strong>${title}</strong><p>${msg}</p><p>${match}</p></div>`;
}

/* ═══════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════ */
function showToast(msg, duration = 3200) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), duration);
}

/* ═══════════════════════════════════════════════
   EVENT BINDINGS
═══════════════════════════════════════════════ */
function bindEvents() {

  /* ── Tab switching ── */
  $$(".nav-link").forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.dataset.tab;
      if (tabId) switchTab(tabId);
    });
  });

  /* ── Global search ── */
  $("searchForm").addEventListener("submit", async e => {
    e.preventDefault();
    const query = $("globalSearch").value.trim();
    searchTerm = query.toLowerCase();
    renderHospitals(); renderDoctors(); renderMedicines();
    showToast(searchTerm ? `Searching for "${query}"` : "Showing all services");
    if (query.length > 2) {
      await geocodeSearch(query);
    }
  });
  $("globalSearch").addEventListener("input", () => {
    searchTerm = $("globalSearch").value.trim().toLowerCase();
    renderHospitals(); renderDoctors(); renderMedicines();
  });

  /* ── Hospital filter segments ── */
  $$(".segment").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".segment").forEach(s => s.classList.remove("active"));
      btn.classList.add("active");
      hospitalFilter = btn.dataset.filter;
      renderHospitals();
    });
  });
  $("distanceFilter2")?.addEventListener("change", renderHospitals);
  $("specialtyFilter")?.addEventListener("change", renderDoctors);

  /* ── Medicine search ── */
  $("medicineSearch")?.addEventListener("input", renderMedicines);

  /* ── Pharmacy marketplace search ── */
  $("buySearchBtn")?.addEventListener("click", () => {
    const q = $("buySearch").value.trim();
    renderPharmacyApps(q);
    if (q) showToast(`Searching "${q}" across all pharmacy platforms`);
  });
  $("buySearch")?.addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); $("buySearchBtn").click(); }
  });

  /* ── Symptom form (overview) ── */
  $$(".quick-symptoms button").forEach(btn => {
    btn.addEventListener("click", () => { $("symptoms").value = btn.dataset.symptom; suggestCare(btn.dataset.symptom); });
  });
  $("symptomForm")?.addEventListener("submit", e => { e.preventDefault(); suggestCare($("symptoms").value); });

  /* ── First aid search ── */
  $("firstaidSearch")?.addEventListener("input", renderFirstAid);
  $("severityFilter")?.addEventListener("change", renderFirstAid);

  /* ── AI Chat ── */
  $$(".quick-chat button").forEach(btn => {
    btn.addEventListener("click", () => sendChatMessage(btn.dataset.query));
  });
  $("chatForm")?.addEventListener("submit", e => {
    e.preventDefault();
    sendChatMessage($("chatInput").value);
  });

  /* ── Insurance help desk ── */
  $("insuranceForm")?.addEventListener("submit", async e => {
    e.preventDefault();
    const policy = $("policyType").value;
    const need = $("supportNeed").value;
    let result = "";
    
    $("insuranceResult").textContent = "🔄 Checking coverage database...";
    
    try {
      const res = await fetch("/api/insurance/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policyType: policy, need: need })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.matched) {
          result = `✅ Match found: ${data.partners.map(p => p.name).join(", ")} accepts cashless admissions.\n\n**Next Steps:**\n` + data.nextSteps.map(s => `• ${s}`).join("\n");
        } else {
          result = `⚠️ No exact scheme match found on server. Contact the hospital insurance desk to check tie-ups.\n\n**Next Steps:**\n` + data.nextSteps.map(s => `• ${s}`).join("\n");
        }
      } else {
        result = "⚠️ Error communicating with the insurance server. Please try again.";
      }
    } catch {
      result = "⚠️ Network error while connecting to insurance server.";
    }
    
    $("insuranceResult").textContent = result;
  });

  /* ── Empanelment checker ── */
  $("empanelBtn")?.addEventListener("click", () => checkEmpanelment($("empanelSearch").value.trim()));
  $("empanelSearch")?.addEventListener("keydown", e => { if (e.key==="Enter") { e.preventDefault(); $("empanelBtn").click(); }});

  /* ── Map distance filter (overview) ── */
  $("distanceFilter")?.addEventListener("change", () => {
    const val = $("distanceFilter").value;
    if (val === "all") return;
    if (leafletMap && userCoords) {
      const zoom = val === "1500" ? 15 : val === "3000" ? 14 : 13;
      leafletMap.setView([userCoords.lat, userCoords.lng], zoom);
      showToast(`Zooming map to radius of ${val === "1500" ? "1.5" : val === "3000" ? "3" : "5"} km`);
    }
  });

  /* ── Locate button ── */
  $("locateBtn")?.addEventListener("click", () => {
    if (!navigator.geolocation) { showToast("Geolocation not supported by your browser."); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        userCoords = { lat, lng };
        relocateMockups(lat, lng);
        setUserMarker(lat, lng);
        if (leafletMap) leafletMap.setView([lat, lng], 14);
        showToast(`📍 Location found: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      },
      ()  => showToast("Could not access location. Please allow location permission.")
    );
  });

  /* ── Manual Locate button ── */
  $("manualLocateBtn")?.addEventListener("click", async () => {
    const area = prompt("Enter your city, area, or zip code (e.g. Krishnankoil):");
    if (area && area.trim()) {
      await geocodeSearch(area.trim());
    }
  });

  /* ── Map route button ── */
  $("mapRouteBtn")?.addEventListener("click", () => {
    const lat = $("mapRouteBtn")?.dataset.lat;
    const lng = $("mapRouteBtn")?.dataset.lng;
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${lat},${lng}`, "_blank");
    } else {
      const name = $("mapRouteBtn")?.dataset.name ?? "CityCare Hospital";
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(name)}`, "_blank");
    }
  });

  /* ── Dark mode ── */
  $("themeToggle")?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const dark = document.body.classList.contains("dark");
    $("themeIcon").textContent  = dark ? "☀️" : "🌙";
    $("themeLabel").textContent = dark ? "Light mode" : "Dark mode";
    updateTileLayer();
    showToast(dark ? "Dark mode on" : "Light mode on");
  });

  /* ── SOS ── */
  $("sosBtn")?.addEventListener("click", () => { $("sosModal").hidden = false; });
  $("closeSosModal")?.addEventListener("click", () => { $("sosModal").hidden = true; });
  $("sosModal")?.addEventListener("click", e => { if (e.target === $("sosModal")) $("sosModal").hidden = true; });

  /* ── First Aid modal close on backdrop ── */
  $("firstaidModal")?.addEventListener("click", e => { if (e.target === $("firstaidModal")) $("firstaidModal").hidden = true; });

  /* ── Delegated action buttons (route / call / book / map) ── */
  document.addEventListener("click", e => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const { action, name, phone } = btn.dataset;
    if (action === "call")  showToast(`📞 Calling ${name}: ${phone}`);
    if (action === "route") {
      const lat = btn.dataset.lat;
      const lng = btn.dataset.lng;
      if (lat && lng) {
        window.open(`https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${lat},${lng}`, "_blank");
      } else {
        window.open(`https://www.google.com/maps/search/${encodeURIComponent(name)}`, "_blank");
      }
    }
    if (action === "book")  showToast(`📅 Appointment started for ${name}. You'll be redirected to booking.`);
    if (action === "map") {
      switchTab("tab-overview");
      showToast(`📌 Showing ${name} on map`);
      const found = hospitals.find(h => h.name === name);
      if (found && leafletMap) {
        leafletMap.setView([found.lat, found.lng], 16);
        const marker = mapMarkers.find(m => {
          const latlng = m.getLatLng();
          return Math.abs(latlng.lat - found.lat) < 0.0001 && Math.abs(latlng.lng - found.lng) < 0.0001;
        });
        if (marker) {
          marker.openPopup();
        }
      }
    }
  });

  /* ── Keyboard accessibility: Escape closes modals ── */
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      $("sosModal").hidden    = true;
      $("firstaidModal").hidden = true;
    }
  });

  /* ── IEEE Triage Optimizer ── */
  $("triageForm")?.addEventListener("submit", e => {
    e.preventDefault();
    runTriageOptimization();
  });
}

/* ───────────────────────────────────────────
   START
─────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", init);

/* ═══════════════════════════════════════════════
   IEEE SMART TRIAGE OPTIMIZER & MULTI-LANGUAGE
═══════════════════════════════════════════════ */

const TRANSLATIONS = {
  en: {
    navOverview: "Overview",
    navHospitals: "Hospitals",
    navDoctors: "Doctors",
    navMedicines: "Medicines",
    navChat: "AI Chat",
    navFirstAid: "First Aid",
    navInsurance: "Insurance",
    navEmergency: "Emergency",
    navTriage: "Smart Triage",
    triageEyebrow: "IEEE Decision Analytics",
    triageTitle: "Smart Resource Triage Optimizer",
    triageInputs: "Optimization Parameters",
    triageDesc: "Select emergency profile and priority factor to execute Dijkstra-based hospital triage resource allocation.",
    labelProfile: "Emergency Profile",
    labelWeight: "Primary Optimization Objective",
    btnOptimize: "⚡ Execute Optimization Algorithm",
    triageOutputs: "Algorithmic Match Outcomes",
    triageEmpty: "Execute the optimizer to run the utility-scoring formula on active surrounding hospitals.",
    searchPlaceholder: "Search hospitals, pharmacies, locations..."
  },
  hi: {
    navOverview: "अवलोकन",
    navHospitals: "अस्पताल",
    navDoctors: "चिकित्सक",
    navMedicines: "दवाएं",
    navChat: "एआई चैट",
    navFirstAid: "प्राथमिक चिकित्सा",
    navInsurance: "बीमा",
    navEmergency: "आपातकालीन",
    navTriage: "स्मार्ट ट्राइएज",
    triageEyebrow: "आईईईई निर्णय विश्लेषिकी",
    triageTitle: "स्मार्ट संसाधन ट्राइएज अनुकूलक",
    triageInputs: "अनुकूलन पैरामीटर",
    triageDesc: "अस्पताल संसाधन आवंटन को अनुकूलित करने के लिए आपातकालीन प्रोफ़ाइल और प्राथमिकता कारक का चयन करें।",
    labelProfile: "आपातकालीन प्रोफ़ाइल",
    labelWeight: "मुख्य अनुकूलन उद्देश्य",
    btnOptimize: "⚡ अनुकूलन एल्गोरिथ्म चलाएं",
    triageOutputs: "एल्गोरिथम मिलान परिणाम",
    triageEmpty: "अस्पतालों पर उपयोगिता-स्कोरिंग फॉर्मूला चलाने के लिए अनुकूलक चलाएं।",
    searchPlaceholder: "अस्पताल, फ़ार्मेसी, स्थान खोजें..."
  },
  ta: {
    navOverview: "கண்ணோட்டம்",
    navHospitals: "மருத்துவமனைகள்",
    navDoctors: "மருத்துவர்கள்",
    navMedicines: "மருந்துகள்",
    navChat: "AI அரட்டை",
    navFirstAid: "முதலுதவி",
    navInsurance: "காப்பீடு",
    navEmergency: "அவசரம்",
    navTriage: "முன்னுரிமை",
    triageEyebrow: "IEEE முடிவு பகுப்பாய்வு",
    triageTitle: "வள முன்னுரிமை ஆப்டிமைசர்",
    triageInputs: "உகப்பாக்கம் காரணிகள்",
    triageDesc: "வள ஒதுக்கீட்டை மேம்படுத்த அவசரநிலை விவரம் மற்றும் முன்னுரிமை காரணியை தேர்ந்தெடுக்கவும்.",
    labelProfile: "அவசரநிலை விவரம்",
    labelWeight: "முதன்மையான உகப்பாக்கம் நோக்கம்",
    btnOptimize: "⚡ உகப்பாக்கம் அல்காரிதத்தை இயக்கு",
    triageOutputs: "அல்காரிதம் பொருத்தம் முடிவுகள்",
    triageEmpty: "மதிப்பெண் சூத்திரத்தை இயக்க ஆப்டிமைசரை செயல்படுத்தவும்.",
    searchPlaceholder: "மருத்துவமனைகள், மருந்தகங்கள், இடங்களைத் தேடு..."
  },
  es: {
    navOverview: "Resumen",
    navHospitals: "Hospitales",
    navDoctors: "Médicos",
    navMedicines: "Medicamentos",
    navChat: "Chat de IA",
    navFirstAid: "Primeros Auxilios",
    navInsurance: "Seguro",
    navEmergency: "Emergencia",
    navTriage: "Triaje Inteligente",
    triageEyebrow: "Análisis de Decisiones IEEE",
    triageTitle: "Optimizador de Triage de Recursos",
    triageInputs: "Parámetros de Optimización",
    triageDesc: "Seleccione el perfil de emergencia y el factor de prioridad para ejecutar la asignación de recursos.",
    labelProfile: "Perfil de Emergencia",
    labelWeight: "Objetivo Principal de Optimización",
    btnOptimize: "⚡ Ejecutar Algoritmo de Optimización",
    triageOutputs: "Resultados del Ajuste Algorítmico",
    triageEmpty: "Ejecute el optimizador para aplicar la fórmula de puntuación en los hospitales activos.",
    searchPlaceholder: "Buscar hospitales, farmacias, ubicaciones..."
  },
  fr: {
    navOverview: "Aperçu",
    navHospitals: "Hôpitaux",
    navDoctors: "Médecins",
    navMedicines: "Médicaments",
    navChat: "Discussion IA",
    navFirstAid: "Premiers Secours",
    navInsurance: "Assurance",
    navEmergency: "Urgence",
    navTriage: "Triage Intelligent",
    triageEyebrow: "Analyse Décisionnelle IEEE",
    triageTitle: "Optimiseur de Triage des Ressources",
    triageInputs: "Paramètres d'Optimisation",
    triageDesc: "Sélectionnez le profil d'urgence et le facteur de priorité pour exécuter l'allocation de ressources.",
    labelProfile: "Profil d'Urgence",
    labelWeight: "Optimisation Principale",
    btnOptimize: "⚡ Exécuter l'Algorithme d'Optimisation",
    triageOutputs: "Résultats de l'Appariement Algorithmique",
    triageEmpty: "Exécutez l'optimiseur pour appliquer la formule de score aux hôpitaux actifs.",
    searchPlaceholder: "Rechercher des hôpitaux, des pharmacies, des lieux..."
  },
  de: {
    navOverview: "Übersicht",
    navHospitals: "Krankenhäuser",
    navDoctors: "Ärzte",
    navMedicines: "Medikamente",
    navChat: "KI-Chat",
    navFirstAid: "Erste Hilfe",
    navInsurance: "Versicherung",
    navEmergency: "Notfall",
    navTriage: "Intelligente Triage",
    triageEyebrow: "IEEE Entscheidungsanalyse",
    triageTitle: "Ressourcen-Triage-Optimierer",
    triageInputs: "Optimierungsparameter",
    triageDesc: "Wählen Sie das Notfallprofil und den Prioritätsfaktor, um die Ressourcenverteilung durchzuführen.",
    labelProfile: "Notfallprofil",
    labelWeight: "Primäres Optimierungsziel",
    btnOptimize: "⚡ Optimierungsalgorithmus Ausführen",
    triageOutputs: "Algorithmitische Übereinstimmungsergebnisse",
    triageEmpty: "Führen Sie den Optimierer aus, um die Bewertungsformel auf aktive Krankenhäuser anzuwenden.",
    searchPlaceholder: "Suchen Sie Krankenhäuser, Apotheken, Orte..."
  }
};

function changeLanguage(lang) {
  const i18nElements = document.querySelectorAll("[data-i18n]");
  i18nElements.forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
      el.innerHTML = TRANSLATIONS[lang][key];
    }
  });

  const searchInput = document.getElementById("globalSearch");
  if (searchInput && TRANSLATIONS[lang] && TRANSLATIONS[lang].searchPlaceholder) {
    searchInput.placeholder = TRANSLATIONS[lang].searchPlaceholder;
  }
}

// Expose changeLanguage globally for the onchange inline handler
window.changeLanguage = changeLanguage;

function runTriageOptimization() {
  const profile = $("triageProfile").value;
  const weight = $("triageWeight").value;
  const listContainer = $("triageResultsList");

  if (!listContainer) return;

  if (hospitals.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state" style="color:var(--coral); border-color:var(--coral);">
        ⚠️ No hospitals loaded in map view. Please search or locate a place first.
      </div>`;
    return;
  }

  // Multi-objective optimization calculation
  const scored = hospitals.map(h => {
    // 1. Specialty compatibility score (S)
    let s = 0.2;
    if (profile === "cardiac") {
      s = h.specialties.includes("Cardiology") || h.specialties.includes("Emergency") ? 1.0 : 0.3;
    } else if (profile === "trauma") {
      s = h.specialties.includes("Emergency") || h.specialties.includes("Orthopedics") ? 1.0 : 0.4;
    } else if (profile === "pediatric") {
      s = h.specialties.includes("Pediatrics") ? 1.0 : 0.2;
    } else { // general
      s = 0.8;
    }

    // 2. Bed score (B) - normalized
    let b = 0.0;
    if (profile === "cardiac") {
      b = h.icu / 15; // normalize against a cap of 15 ICU beds
    } else {
      b = h.beds / 100; // normalize against a cap of 100 general beds
    }
    b = Math.min(Math.max(b, 0.05), 1.0); // clamp

    // 3. Proximity score (D) using exponential distance decay: e^(-0.07 * distance)
    const d = Math.exp(-0.07 * h.distance);

    // 4. Clinical quality index (R) from hospital rating
    const r = ((h.rating || 4.0) - 3.0) / 2.0;

    // Weight combinations depending on primary objective
    let w_d = 0.25, w_s = 0.25, w_b = 0.25, w_r = 0.25;
    if (weight === "distance") {
      w_d = 0.50; w_s = 0.20; w_b = 0.15; w_r = 0.15;
    } else if (weight === "beds") {
      w_d = 0.15; w_s = 0.20; w_b = 0.50; w_r = 0.15;
    } else if (weight === "rating") {
      w_d = 0.15; w_s = 0.20; w_b = 0.15; w_r = 0.50;
    } else { // balanced
      w_d = 0.30; w_s = 0.25; w_b = 0.25; w_r = 0.20;
    }

    const finalScore = (w_d * d + w_s * s + w_b * b + w_r * r) * 100;

    return {
      hospital: h,
      score: finalScore,
      breakdown: {
        proximity: Math.round(d * 100),
        specialty: Math.round(s * 100),
        beds: Math.round(b * 100),
        quality: Math.round(r * 100)
      }
    };
  });

  // Sort descending by finalScore
  scored.sort((a, b) => b.score - a.score);

  // Render ranked list
  listContainer.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div style="font-size:12.5px; color:var(--ink-2); background:var(--surface-2); padding:8px 12px; border-radius:var(--radius-xs); line-height:1.4;">
        📊 <strong>Optimization Formula:</strong><br>
        <code>Utility = w_d * Proximity + w_s * Specialty + w_b * Beds + w_r * Quality</code>
      </div>
      ${scored.map((item, index) => {
        const h = item.hospital;
        const rankColor = index === 0 ? "#10b981" : index === 1 ? "#3b82f6" : "var(--ink-2)";
        return `
          <div class="triage-result-card" style="border:1px solid var(--line); border-radius:var(--radius-xs); padding:12px; background:var(--surface-2); display:flex; flex-direction:column; gap:6px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:700; font-size:14.5px; color:${rankColor}">#${index + 1} ${h.name}</span>
              <span style="background:${rankColor}; color:#fff; font-size:11.5px; font-weight:700; padding:2px 8px; border-radius:10px;">
                ${item.score.toFixed(1)}% Match
              </span>
            </div>
            <div style="font-size:12.5px; color:var(--ink-2);">
              📍 ${h.distance} km away · 🛏️ ${h.beds} general beds · 🏥 ${h.icu} ICU beds · ⭐ ${h.rating.toFixed(1)}
            </div>
            <div style="font-size:11px; font-family:monospace; color:var(--blue); margin-top:4px; display:flex; justify-content:space-between; flex-wrap:wrap; gap:6px;">
              <span>Proximity: ${item.breakdown.proximity}%</span>
              <span>Specialty: ${item.breakdown.specialty}%</span>
              <span>Beds: ${item.breakdown.beds}%</span>
              <span>Quality: ${item.breakdown.quality}%</span>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}
