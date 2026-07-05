const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_PATH = path.join(ROOT, "data", "healthcare-dataset.json");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

function readDataset() {
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  response.end(JSON.stringify(payload, null, 2));
}

function sendText(response, statusCode, text) {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(text);
}

function includesText(value, query) {
  return String(value || "").toLowerCase().includes(query);
}

function matchesObject(object, query) {
  return JSON.stringify(object).toLowerCase().includes(query);
}

function parseBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error("Request body too large"));
      }
    });
    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("Invalid JSON body"));
      }
    });
    request.on("error", reject);
  });
}

function summarizeDataset(dataset) {
  return {
    project: dataset.project,
    serviceArea: dataset.serviceArea,
    lastUpdated: dataset.lastUpdated,
    counts: {
      hospitals: dataset.hospitals.length,
      doctors: dataset.doctors.length,
      medicines: dataset.medicines.length,
      pharmacies: dataset.pharmacies.length,
      ambulances: dataset.ambulances.length,
      insurancePartners: dataset.insurancePartners.length,
      firstAidTopics: dataset.firstAid.length
    },
    totals: {
      availableBeds: dataset.hospitals.reduce((sum, hospital) => {
        return sum + Object.values(hospital.beds).reduce((bedSum, bed) => bedSum + bed.available, 0);
      }, 0),
      availableDoctors: dataset.doctors.filter((doctor) => includesText(doctor.status, "available")).length
    }
  };
}

function getHospitals(dataset, searchParams) {
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const service = (searchParams.get("service") || "all").trim().toLowerCase();
  const maxDistance = Number(searchParams.get("distanceKm") || 0);

  return dataset.hospitals.filter((hospital) => {
    const serviceMatch = service === "all" || matchesObject(hospital.services, service) || matchesObject(hospital.specialties, service);
    const distanceMatch = !maxDistance || hospital.distanceKm <= maxDistance;
    const queryMatch = !q || matchesObject(hospital, q);
    return serviceMatch && distanceMatch && queryMatch;
  });
}

function getDoctors(dataset, searchParams) {
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const specialization = (searchParams.get("specialization") || "all").trim().toLowerCase();
  const availableOnly = searchParams.get("available") === "true";

  return dataset.doctors.filter((doctor) => {
    const specializationMatch = specialization === "all" || doctor.specialization.toLowerCase() === specialization;
    const availabilityMatch = !availableOnly || includesText(doctor.status, "available");
    const queryMatch = !q || matchesObject(doctor, q);
    return specializationMatch && availabilityMatch && queryMatch;
  });
}

function getMedicines(dataset, searchParams) {
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const lowStockOnly = searchParams.get("lowStock") === "true";

  return dataset.medicines.filter((medicine) => {
    const queryMatch = !q || matchesObject(medicine, q);
    const stockMatch = !lowStockOnly || medicine.stock <= 10;
    return queryMatch && stockMatch;
  });
}

function getBedAvailability(dataset) {
  return dataset.hospitals.map((hospital) => {
    const general = hospital.beds.general.available;
    const icu = hospital.beds.icu.available;
    const oxygen = hospital.beds.oxygen.available;
    return {
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      area: hospital.area,
      distanceKm: hospital.distanceKm,
      general,
      icu,
      oxygen,
      totalAvailable: general + icu + oxygen,
      phone: hospital.emergencyPhone
    };
  });
}

function getMapLocations(dataset) {
  const hospitalLocations = dataset.hospitals.map((item) => ({
    id: item.id,
    category: "Hospital",
    name: item.name,
    address: item.address,
    area: item.area,
    latitude: item.latitude,
    longitude: item.longitude,
    distanceKm: item.distanceKm,
    phone: item.phone,
    googleMapQuery: item.googleMapQuery
  }));

  const pharmacyLocations = dataset.pharmacies.map((item) => ({
    id: item.id,
    category: "Pharmacy",
    name: item.name,
    address: item.area,
    area: item.area,
    latitude: item.latitude,
    longitude: item.longitude,
    distanceKm: item.distanceKm,
    phone: item.phone,
    googleMapQuery: item.googleMapQuery
  }));

  return hospitalLocations.concat(pharmacyLocations);
}

function buildSearchResults(dataset, query) {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [];
  }

  const buckets = [
    ["hospital", dataset.hospitals],
    ["doctor", dataset.doctors],
    ["medicine", dataset.medicines],
    ["pharmacy", dataset.pharmacies],
    ["ambulance", dataset.ambulances],
    ["firstAid", dataset.firstAid]
  ];

  return buckets.flatMap(([type, items]) => {
    return items
      .filter((item) => matchesObject(item, q))
      .slice(0, 5)
      .map((item) => ({ type, item }));
  });
}

function buildChatReply(dataset, message) {
  const text = String(message || "").trim().toLowerCase();
  const emergencyWords = ["chest", "breathing", "oxygen", "heart", "unconscious", "accident", "bleeding", "choking"];
  const medicineWords = ["medicine", "tablet", "stock", "insulin", "paracetamol", "ors", "oxygen cylinder"];
  const insuranceWords = ["insurance", "cashless", "claim", "policy", "ayushman"];

  if (!text) {
    return {
      priority: "normal",
      reply: "Please describe the symptom, medicine need, hospital need, or insurance question.",
      recommendations: [],
      firstAid: []
    };
  }

  const matchingFirstAid = dataset.firstAid.filter((topic) => {
    return topic.tags.some((tag) => text.includes(tag)) || includesText(topic.title, text);
  });

  if (emergencyWords.some((word) => text.includes(word))) {
    const emergencyHospitals = dataset.hospitals
      .filter((hospital) => hospital.services.includes("Emergency") || hospital.services.includes("ICU"))
      .slice(0, 3)
      .map((hospital) => `${hospital.name} (${hospital.distanceKm} km, ICU ${hospital.beds.icu.available}, oxygen ${hospital.beds.oxygen.available})`);

    return {
      priority: "urgent",
      reply: "This may be urgent. Call 108 or 112 now if the person has chest pain, breathing difficulty, heavy bleeding, choking, unconsciousness, or severe accident injury.",
      recommendations: emergencyHospitals,
      firstAid: matchingFirstAid.slice(0, 2),
      disclaimer: "This chatbot provides first-aid guidance only. It is not a medical diagnosis."
    };
  }

  if (medicineWords.some((word) => text.includes(word))) {
    const matches = dataset.medicines
      .filter((medicine) => matchesObject(medicine, text) || text.split(/\s+/).some((word) => matchesObject(medicine, word)))
      .slice(0, 4)
      .map((medicine) => `${medicine.name}: ${medicine.stock} ${medicine.unit} at ${medicine.pharmacyName}`);

    return {
      priority: "normal",
      reply: "I checked the medicine stock reference dataset. Prescription medicines should be used only with doctor advice.",
      recommendations: matches.length ? matches : ["Try the Medicines tab for stock lookup and nearby pharmacy details."],
      firstAid: matchingFirstAid.slice(0, 1),
      disclaimer: "Stock is sample demo data and should be refreshed from pharmacy systems in production."
    };
  }

  if (insuranceWords.some((word) => text.includes(word))) {
    return {
      priority: "normal",
      reply: "For insurance support, check whether the hospital is cashless under your scheme and keep ID, policy number, and admission note ready.",
      recommendations: dataset.insurancePartners.map((partner) => `${partner.name}: ${partner.cashlessHospitals.join(", ")}`),
      firstAid: [],
      disclaimer: "Final approval depends on insurer and hospital verification."
    };
  }

  const doctorMatch = dataset.doctors.find((doctor) => text.includes(doctor.specialization.toLowerCase()));
  if (doctorMatch) {
    return {
      priority: "normal",
      reply: `For ${doctorMatch.specialization}, ${doctorMatch.name} is listed at ${doctorMatch.hospitalName}.`,
      recommendations: [`Status: ${doctorMatch.status}`, `Phone: ${doctorMatch.phone}`],
      firstAid: matchingFirstAid.slice(0, 1),
      disclaimer: "Use emergency services for severe or rapidly worsening symptoms."
    };
  }

  return {
    priority: "normal",
    reply: "I found general care options. For new, severe, or worsening symptoms, contact a doctor or emergency helpline.",
    recommendations: [
      "Use Hospitals tab for beds, ICU, oxygen, and map route.",
      "Use Doctors tab for specialization and appointment slots.",
      "Use First Aid tab for immediate response steps."
    ],
    firstAid: matchingFirstAid.slice(0, 2),
    disclaimer: "This chatbot provides first-aid guidance only. It is not a medical diagnosis."
  };
}

function checkInsurance(dataset, payload) {
  const policyType = String(payload.policyType || "").toLowerCase();
  const need = String(payload.need || "").toLowerCase();
  const hospitalName = String(payload.hospital || "").toLowerCase();

  const partners = dataset.insurancePartners.filter((partner) => {
    const typeMatch = !policyType || partner.type.toLowerCase().includes(policyType) || partner.name.toLowerCase().includes(policyType);
    const hospitalMatch = !hospitalName || partner.cashlessHospitals.some((hospital) => hospital.toLowerCase().includes(hospitalName));
    const needMatch = !need || matchesObject(partner, need) || need.includes("cashless") || need.includes("claim");
    return typeMatch && hospitalMatch && needMatch;
  });

  return {
    matched: partners.length > 0,
    partners,
    nextSteps: [
      "Keep government ID and policy or scheme number ready.",
      "Ask the hospital insurance desk for cashless pre-authorization.",
      "For emergency admission, start treatment first and submit documents as soon as possible."
    ]
  };
}

async function handleApi(request, response, url) {
  const dataset = readDataset();
  const route = url.pathname;

  if (request.method === "OPTIONS") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "GET" && route === "/api/health") {
    sendJson(response, 200, { ok: true, ...summarizeDataset(dataset) });
    return;
  }

  if (request.method === "GET" && route === "/api/dataset") {
    sendJson(response, 200, dataset);
    return;
  }

  if (request.method === "GET" && route === "/api/hospitals") {
    sendJson(response, 200, getHospitals(dataset, url.searchParams));
    return;
  }

  if (request.method === "GET" && route === "/api/beds") {
    sendJson(response, 200, getBedAvailability(dataset));
    return;
  }

  if (request.method === "GET" && route === "/api/doctors") {
    sendJson(response, 200, getDoctors(dataset, url.searchParams));
    return;
  }

  if (request.method === "GET" && route === "/api/medicines") {
    sendJson(response, 200, getMedicines(dataset, url.searchParams));
    return;
  }

  if (request.method === "GET" && route === "/api/pharmacies") {
    sendJson(response, 200, dataset.pharmacies);
    return;
  }

  if (request.method === "GET" && route === "/api/ambulances") {
    sendJson(response, 200, dataset.ambulances);
    return;
  }

  if (request.method === "GET" && route === "/api/insurance") {
    sendJson(response, 200, dataset.insurancePartners);
    return;
  }

  if (request.method === "GET" && route === "/api/first-aid") {
    sendJson(response, 200, dataset.firstAid);
    return;
  }

  if (request.method === "GET" && route === "/api/map-locations") {
    sendJson(response, 200, getMapLocations(dataset));
    return;
  }

  if (request.method === "GET" && route === "/api/search") {
    sendJson(response, 200, buildSearchResults(dataset, url.searchParams.get("q") || ""));
    return;
  }

  if (request.method === "POST" && route === "/api/chat") {
    const payload = await parseBody(request);
    sendJson(response, 200, buildChatReply(dataset, payload.message));
    return;
  }

  if (request.method === "POST" && route === "/api/insurance/check") {
    const payload = await parseBody(request);
    sendJson(response, 200, checkInsurance(dataset, payload));
    return;
  }

  sendJson(response, 404, { error: "API route not found" });
}

function serveStatic(request, response, url) {
  const rawPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const decodedPath = decodeURIComponent(rawPath);
  const filePath = path.normalize(path.join(ROOT, decodedPath));

  if (!filePath.startsWith(ROOT)) {
    sendText(response, 403, "Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendText(response, 404, "Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    response.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    response.end(content);
  });
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url);
      return;
    }
    serveStatic(request, response, url);
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Server error" });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`One Health Platform running at http://localhost:${PORT}`);
});
