const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "database.json");

const DEFAULT_DATABASE = {
  tickets: {},
  applications: {},
  staff: {},
  ratings: {},
  closures: {},
  warnings: {},
  settings: {
    maintenance: false
  }
};

// Crear carpeta data
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, {
    recursive: true
  });
}

// Crear base de datos
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(
    DB_FILE,
    JSON.stringify(DEFAULT_DATABASE, null, 2),
    "utf8"
  );
}

function load() {
  try {
    const data = JSON.parse(
      fs.readFileSync(DB_FILE, "utf8")
    );

    return {
      ...DEFAULT_DATABASE,
      ...data,
      tickets: data.tickets || {},
      applications: data.applications || {},
      staff: data.staff || {},
      ratings: data.ratings || {},
      closures: data.closures || {},
      warnings: data.warnings || {},
      settings: {
        ...DEFAULT_DATABASE.settings,
        ...(data.settings || {})
      }
    };
  } catch (error) {
    console.error(
      "❌ Error leyendo database.json:",
      error
    );

    return structuredClone(DEFAULT_DATABASE);
  }
}

function save(data) {
  try {
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify(data, null, 2),
      "utf8"
    );
  } catch (error) {
    console.error(
      "❌ Error guardando database.json:",
      error
    );

    throw error;
  }
}

// ═══════════════════════════════════════
// 🎫 TICKETS
// ═══════════════════════════════════════

function getTickets() {
  return load().tickets;
}

function getTicket(id) {
  return load().tickets[id] || null;
}

function createTicket(id, ticketData) {
  const data = load();

  data.tickets[id] = {
    ...ticketData,
    id
  };

  save(data);

  return data.tickets[id];
}

function updateTicket(id, changes) {
  const data = load();

  if (!data.tickets[id]) {
    return null;
  }

  data.tickets[id] = {
    ...data.tickets[id],
    ...changes
  };

  save(data);

  return data.tickets[id];
}

function deleteTicket(id) {
  const data = load();

  delete data.tickets[id];

  save(data);
}

// ═══════════════════════════════════════
// 👑 POSTULACIONES
// ═══════════════════════════════════════

function getApplications() {
  return load().applications;
}

function getApplication(id) {
  return load().applications[id] || null;
}

function createApplication(id, applicationData) {
  const data = load();

  data.applications[id] = {
    ...applicationData,
    id
  };

  save(data);

  return data.applications[id];
}

function updateApplication(id, changes) {
  const data = load();

  if (!data.applications[id]) {
    return null;
  }

  data.applications[id] = {
    ...data.applications[id],
    ...changes
  };

  save(data);

  return data.applications[id];
}

function deleteApplication(id) {
  const data = load();

  delete data.applications[id];

  save(data);
}

function findApplicationByUser(userId) {
  const applications = load().applications;

  return (
    Object.values(applications)
      .reverse()
      .find(app => app.userId === userId) || null
  );
}

// ═══════════════════════════════════════
// 🛠️ STAFF
// ═══════════════════════════════════════

function getStaff() {
  return load().staff;
}

function getStaffMember(userId) {
  return load().staff[userId] || null;
}

function setStaffMember(userId, staffData) {
  const data = load();

  data.staff[userId] = {
    ...staffData,
    userId
  };

  save(data);

  return data.staff[userId];
}

function removeStaffMember(userId) {
  const data = load();

  delete data.staff[userId];

  save(data);
}

// ═══════════════════════════════════════
// ⭐ CALIFICACIONES
// ═══════════════════════════════════════

function getRatings() {
  return load().ratings;
}

function getRating(ticketId) {
  return load().ratings[ticketId] || null;
}

function createRating(ticketId, ratingData) {
  const data = load();

  data.ratings[ticketId] = {
    ...ratingData,
    ticketId
  };

  save(data);

  return data.ratings[ticketId];
}

// ═══════════════════════════════════════
// 📋 CIERRES
// ═══════════════════════════════════════

function getClosures() {
  return load().closures;
}

function getClosure(ticketId) {
  return load().closures[ticketId] || null;
}

function createClosure(ticketId, closureData) {
  const data = load();

  data.closures[ticketId] = {
    ...closureData,
    ticketId
  };

  save(data);

  return data.closures[ticketId];
}

// ═══════════════════════════════════════
// ⚠️ ADVERTENCIAS
// ═══════════════════════════════════════

function getWarnings(userId) {
  const data = load();

  return data.warnings[userId] || [];
}

function addWarning(userId, warningData) {
  const data = load();

  if (!Array.isArray(data.warnings[userId])) {
    data.warnings[userId] = [];
  }

  data.warnings[userId].push({
    ...warningData,
    id: `${userId}-${Date.now()}`
  });

  save(data);

  return data.warnings[userId];
}

function clearWarnings(userId) {
  const data = load();

  data.warnings[userId] = [];

  save(data);
}

// ═══════════════════════════════════════
// ⚙️ CONFIGURACIÓN
// ═══════════════════════════════════════

function getSettings() {
  return load().settings;
}

function getSetting(key) {
  return load().settings[key];
}

function setSetting(key, value) {
  const data = load();

  data.settings[key] = value;

  save(data);

  return value;
}

// ═══════════════════════════════════════
// 📊 ESTADÍSTICAS
// ═══════════════════════════════════════

function getStats() {
  const data = load();

  return {
    tickets: Object.keys(data.tickets).length,
    applications: Object.keys(data.applications).length,
    ratings: Object.keys(data.ratings).length,
    closures: Object.keys(data.closures).length,
    staff: Object.keys(data.staff).length,
    warnings: Object.values(data.warnings)
      .reduce(
        (total, warnings) =>
          total + warnings.length,
        0
      )
  };
}

module.exports = {
  load,
  save,

  // Tickets
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,

  // Postulaciones
  getApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
  findApplicationByUser,

  // Staff
  getStaff,
  getStaffMember,
  setStaffMember,
  removeStaffMember,

  // Ratings
  getRatings,
  getRating,
  createRating,

  // Cierres
  getClosures,
  getClosure,
  createClosure,

  // Warnings
  getWarnings,
  addWarning,
  clearWarnings,

  // Settings
  getSettings,
  getSetting,
  setSetting,

  // Stats
  getStats
};
