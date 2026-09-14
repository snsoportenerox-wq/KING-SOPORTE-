const fs = require("fs");
const path = require("path");

const TRANSCRIPTS_DIR = path.join(__dirname, "transcripts");

// Crear carpeta automáticamente
if (!fs.existsSync(TRANSCRIPTS_DIR)) {
  fs.mkdirSync(TRANSCRIPTS_DIR, {
    recursive: true
  });
}

// ═══════════════════════════════════════
// 📜 OBTENER TODOS LOS MENSAJES
// ═══════════════════════════════════════

async function getAllMessages(channel) {
  const messages = [];
  let lastId = null;

  while (true) {
    const options = {
      limit: 100
    };

    if (lastId) {
      options.before = lastId;
    }

    const batch = await channel.messages.fetch(options);

    if (batch.size === 0) {
      break;
    }

    messages.push(...batch.values());

    lastId = batch.last().id;

    if (batch.size < 100) {
      break;
    }
  }

  return messages.reverse();
}

// ═══════════════════════════════════════
// 🧹 LIMPIAR TEXTO
// ═══════════════════════════════════════

function cleanText(text) {
  if (!text) {
    return "";
  }

  return text
    .replace(/\r/g, "")
    .trim();
}

// ═══════════════════════════════════════
// 📎 ADJUNTOS
// ═══════════════════════════════════════

function getAttachments(message) {
  if (!message.attachments?.size) {
    return "";
  }

  return [...message.attachments.values()]
    .map(attachment => attachment.url)
    .join("\n");
}

// ═══════════════════════════════════════
// 📜 CREAR TRANSCRIPCIÓN
// ═══════════════════════════════════════

async function createTranscript(channel, ticketData = {}) {
  if (!channel) {
    throw new Error("Canal de ticket no encontrado.");
  }

  const messages = await getAllMessages(channel);

  const createdAt = ticketData.createdAt
    ? new Date(ticketData.createdAt)
    : channel.createdAt || new Date();

  const closedAt = new Date();

  let transcript = "";

  transcript += "══════════════════════════════════════\n";
  transcript += "           KING SUPPORT\n";
  transcript += "          TICKET TRANSCRIPT\n";
  transcript += "══════════════════════════════════════\n\n";

  transcript += `Canal: #${channel.name}\n`;
  transcript += `ID del canal: ${channel.id}\n`;

  if (ticketData.id) {
    transcript += `ID del ticket: ${ticketData.id}\n`;
  }

  if (ticketData.type) {
    transcript += `Tipo: ${ticketData.type}\n`;
  }

  if (ticketData.source) {
    transcript += `Origen: ${ticketData.source}\n`;
  }

  if (ticketData.userId) {
    transcript += `Usuario: <@${ticketData.userId}> (${ticketData.userId})\n`;
  }

  if (ticketData.claimedBy) {
    transcript += `Atendido por: <@${ticketData.claimedBy}>\n`;
  }

  transcript += `Creado: ${createdAt.toLocaleString("es-CO", {
    timeZone: "America/Bogota"
  })}\n`;

  transcript += `Cerrado: ${closedAt.toLocaleString("es-CO", {
    timeZone: "America/Bogota"
  })}\n`;

  if (ticketData.rating) {
    transcript += `Calificación: ${ticketData.rating}/5\n`;
  }

  if (ticketData.review) {
    transcript += `Opinión: ${cleanText(ticketData.review)}\n`;
  }

  transcript += "\n";
  transcript += "══════════════════════════════════════\n";
  transcript += "                 MENSAJES\n";
  transcript += "══════════════════════════════════════\n\n";

  for (const message of messages) {
    const date = message.createdAt.toLocaleString("es-CO", {
      timeZone: "America/Bogota"
    });

    const author = message.author
      ? `${message.author.tag} (${message.author.id})`
      : "Usuario desconocido";

    transcript += `[${date}] ${author}\n`;

    const content = cleanText(message.content);

    if (content) {
      transcript += `${content}\n`;
    }

    const attachments = getAttachments(message);

    if (attachments) {
      transcript += `Adjuntos:\n${attachments}\n`;
    }

    if (!content && !attachments) {
      transcript += "[Sin contenido]\n";
    }

    transcript += "\n";
  }

  transcript += "══════════════════════════════════════\n";
  transcript += "       FIN DE LA TRANSCRIPCIÓN\n";
  transcript += "══════════════════════════════════════\n";

  const safeName = channel.name
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);

  const fileName = `${safeName}-${channel.id}-${Date.now()}.txt`;

  const filePath = path.join(
    TRANSCRIPTS_DIR,
    fileName
  );

  fs.writeFileSync(
    filePath,
    transcript,
    "utf8"
  );

  return filePath;
}

// ═══════════════════════════════════════
// 📂 BUSCAR TRANSCRIPCIONES
// ═══════════════════════════════════════

function getTranscriptFiles() {
  if (!fs.existsSync(TRANSCRIPTS_DIR)) {
    return [];
  }

  return fs.readdirSync(TRANSCRIPTS_DIR)
    .filter(file => file.endsWith(".txt"));
}

function getTranscriptPath(fileName) {
  const safeName = path.basename(fileName);

  return path.join(
    TRANSCRIPTS_DIR,
    safeName
  );
}

module.exports = {
  createTranscript,
  getAllMessages,
  getTranscriptFiles,
  getTranscriptPath,
  TRANSCRIPTS_DIR
};
