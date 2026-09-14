require("dotenv").config();

const express = require("express");

const {
  Client,
  GatewayIntentBits,
  Partials,
  REST,
  Routes
} = require("discord.js");

const config = require("./config");
const events = require("./events");
const tickets = require("./tickets");
const mdTickets = require("./mdTickets");
const postulaciones = require("./postulaciones");
const commands = require("./commands");
const database = require("./database");
const transcripts = require("./transcripts");

// ═══════════════════════════════════════
// 🤖 CLIENTE DISCORD
// ═══════════════════════════════════════

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],

  partials: [
    Partials.Channel
  ]
});

// ═══════════════════════════════════════
// 🌐 EXPRESS / RAILWAY
// ═══════════════════════════════════════

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("👑 KING SUPPORT está funcionando.");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "online",
    bot: client.user
      ? client.user.tag
      : "connecting",
    uptime: process.uptime()
  });
});

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `🌐 Servidor web iniciado en el puerto ${PORT}`
  );
});

// ═══════════════════════════════════════
// 📦 HANDLERS
// ═══════════════════════════════════════

const handlers = {
  tickets,
  mdTickets,
  postulaciones,
  database,
  transcripts,
  commands,

  async handleInteraction(interaction) {

    // ═══════════════════════════════════
    // 🎫 TICKETS MD
    // ═══════════════════════════════════

    if (
      interaction.isButton() &&
      (
        interaction.customId === "ticket_close" ||
        interaction.customId.startsWith("md_rating_")
      )
    ) {
      const handled =
        await mdTickets.handleInteraction(
          interaction
        );

      if (handled) {
        return;
      }
    }

    // ═══════════════════════════════════
    // 🎫 TICKETS NORMALES
    // ═══════════════════════════════════

    if (
      interaction.isButton() ||
      interaction.isStringSelectMenu() ||
      interaction.isModalSubmit()
    ) {
      const handled =
        await tickets.handleInteraction(
          interaction
        );

      if (handled) {
        return;
      }
    }

    // ═══════════════════════════════════
    // 📋 POSTULACIONES
    // ═══════════════════════════════════

    if (
      interaction.isStringSelectMenu() &&
      interaction.customId ===
        "application_select"
    ) {
      await postulaciones.handleInteraction(
        interaction
      );

      return;
    }

    if (
      interaction.isButton() &&
      (
        interaction.customId.startsWith(
          "application_accept_"
        ) ||
        interaction.customId.startsWith(
          "application_reject_"
        )
      )
    ) {
      await postulaciones.handleInteraction(
        interaction
      );

      return;
    }

    // ═══════════════════════════════════
    // 🖥️ SLASH COMMANDS
    // ═══════════════════════════════════

    if (interaction.isChatInputCommand()) {
      await commands.handleCommand(
        interaction,
        handlers
      );
    }
  },

  async handleDirectMessage(message) {

    // ═══════════════════════════════════
    // 📋 POSTULACIÓN ACTIVA
    // ═══════════════════════════════════

    const applicationHandled =
      await postulaciones.handleDirectMessage(
        message,
        client
      );

    if (applicationHandled) {
      return;
    }

    // ═══════════════════════════════════
    // 📩 TICKET MD
    // ═══════════════════════════════════

    await mdTickets.handleDirectMessage(
      message,
      client
    );
  },

  async handleGuildMessage(message) {

    // ═══════════════════════════════════
    // 📩 RESPUESTA DE TICKET MD
    // ═══════════════════════════════════

    await mdTickets.handleGuildMessage(
      message,
      client
    );
  }
};

// ═══════════════════════════════════════
// 🟢 READY
// ═══════════════════════════════════════

client.once("ready", async () => {
  try {
    await events.onReady(client);

    const guild =
      await client.guilds.fetch(
        config.guildId
      );

    console.log(
      `🏠 Servidor: ${guild.name}`
    );

    // ═══════════════════════════════════
    // 🎫 PANEL DE TICKETS
    // ═══════════════════════════════════

    await tickets.setupPanel(client);

    console.log(
      "🎫 Panel de tickets configurado."
    );

    // ═══════════════════════════════════
    // 👑 PANEL DE POSTULACIONES
    // ═══════════════════════════════════

    await postulaciones.setupPanel(
      client
    );

    console.log(
      "👑 Panel de postulaciones configurado."
    );

    // ═══════════════════════════════════
    // 📋 CANALES DE POSTULACIONES
    // ═══════════════════════════════════

    await postulaciones.setupApplicationChannels(
      guild
    );

    console.log(
      "📋 Canales de postulaciones comprobados."
    );

    // ═══════════════════════════════════
    // ⚡ REGISTRAR SLASH COMMANDS
    // ═══════════════════════════════════

    await registerCommands();

    console.log(
      "⚡ Slash commands registrados."
    );

    console.log(
      "════════════════════════════════"
    );

    console.log(
      "👑 KING SUPPORT ONLINE"
    );

    console.log(
      "════════════════════════════════"
    );

  } catch (error) {
    console.error(
      "❌ Error durante el inicio:",
      error
    );
  }
});

// ═══════════════════════════════════════
// ⚡ REGISTRAR COMANDOS
// ═══════════════════════════════════════

async function registerCommands() {

  if (
    !process.env.DISCORD_TOKEN ||
    !process.env.CLIENT_ID ||
    !config.guildId
  ) {
    console.error(
      "❌ Faltan DISCORD_TOKEN, CLIENT_ID o GUILD_ID en .env"
    );

    return;
  }

  const rest = new REST({
    version: "10"
  }).setToken(
    process.env.DISCORD_TOKEN
  );

  const commandData =
    commands.getCommandsJSON();

  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      config.guildId
    ),
    {
      body: commandData
    }
  );
}

// ═══════════════════════════════════════
// 🖱️ INTERACCIONES
// ═══════════════════════════════════════

client.on(
  "interactionCreate",
  async interaction => {

    await events.onInteraction(
      interaction,
      handlers
    );
  }
);

// ═══════════════════════════════════════
// 💬 MENSAJES
// ═══════════════════════════════════════

client.on(
  "messageCreate",
  async message => {

    await events.onMessage(
      message,
      handlers
    );
  }
);

// ═══════════════════════════════════════
// ⚠️ ERRORES
// ═══════════════════════════════════════

client.on(
  "error",
  error => {
    console.error(
      "❌ Discord Client Error:",
      error
    );
  }
);

process.on(
  "unhandledRejection",
  error => {
    console.error(
      "❌ Unhandled Rejection:",
      error
    );
  }
);

process.on(
  "uncaughtException",
  error => {
    console.error(
      "❌ Uncaught Exception:",
      error
    );
  }
);

// ═══════════════════════════════════════
// 🔐 LOGIN
// ═══════════════════════════════════════

if (!process.env.DISCORD_TOKEN) {
  console.error(
    "❌ DISCORD_TOKEN no está configurado."
  );

  process.exit(1);
}

client.login(
  process.env.DISCORD_TOKEN
);
