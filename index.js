require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Partials
} = require("discord.js");

const express = require("express");

// ═══════════════════════════════════════
// 📦 MÓDULOS DEL BOT
// ═══════════════════════════════════════

const config = require("./config");
const events = require("./events");

const tickets = require("./tickets");
const mdTickets = require("./mdTickets");
const postulaciones = require("./postulaciones");

const commands = require("./commands");
const database = require("./database");
const transcripts = require("./transcripts");

// ═══════════════════════════════════════
// 🤖 CLIENTE DE DISCORD
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
// 🧩 HANDLERS
// ═══════════════════════════════════════

const handlers = {
  client,
  config,

  tickets,
  mdTickets,
  postulaciones,

  commands,

  database,
  transcripts
};

// ═══════════════════════════════════════
// 🌐 SERVIDOR WEB PARA RAILWAY
// ═══════════════════════════════════════

const app = express();

app.get("/", (req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>KING SUPPORT</title>
      </head>

      <body>
        <h1>👑 KING SUPPORT</h1>
        <p>🤖 Bot funcionando correctamente.</p>
      </body>
    </html>
  `);
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "online",
    bot: client.user
      ? client.user.tag
      : "connecting",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Servidor web iniciado en el puerto ${PORT}`);
});

// ═══════════════════════════════════════
// ✅ BOT LISTO
// ═══════════════════════════════════════

client.once("ready", async () => {
  try {
    await events.onReady(client);

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("👑 KING SUPPORT");
    console.log(`🤖 Usuario: ${client.user.tag}`);
    console.log(`🏠 Servidor: ${config.guildId}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // 🎫 Panel de tickets
    await tickets.setupPanel(client);

    console.log("🎫 Panel de tickets preparado.");

    // 👑 Panel de postulaciones
    await postulaciones.setupPanel(client);

    console.log("👑 Panel de postulaciones preparado.");

    // 📋 Canales de formularios
    const guild = await client.guilds
      .fetch(config.guildId);

    if (guild) {
      await postulaciones.setupApplicationChannels(
        guild
      );

      console.log(
        "📋 Canales de postulaciones preparados."
      );
    }

    // ⚡ Registrar comandos en el servidor
    if (
      client.application &&
      config.guildId
    ) {
      await client.application.commands.set(
        commands.getCommandsJSON(),
        config.guildId
      );

      console.log(
        `⚡ ${commands.getCommandsJSON().length} comandos registrados.`
      );
    }

    console.log("✅ KING SUPPORT está completamente online.");

  } catch (error) {
    console.error(
      "❌ Error durante el inicio:",
      error
    );
  }
});

// ═══════════════════════════════════════
// 🖱️ INTERACCIONES
// ═══════════════════════════════════════

client.on("interactionCreate", async interaction => {
  try {

    // ═══════════════════════════════════
    // 💻 SLASH COMMANDS
    // ═══════════════════════════════════

    if (interaction.isChatInputCommand()) {

      await commands.handleCommand(
        interaction,
        handlers
      );

      return;
    }

    // ═══════════════════════════════════
    // 🎫 TICKETS
    // ═══════════════════════════════════

    if (
      interaction.isStringSelectMenu() ||
      interaction.isButton() ||
      interaction.isModalSubmit()
    ) {

      await tickets.handleInteraction(
        interaction,
        handlers
      );

      // Si fue una interacción de tickets,
      // no continuar con postulaciones.
      if (
        interaction.customId &&
        (
          interaction.customId.startsWith("ticket_") ||
          interaction.customId.startsWith("ticket-") ||
          interaction.customId.startsWith("rating_") ||
          interaction.customId.startsWith("rating-")
        )
      ) {
        return;
      }

      // ═════════════════════════════════
      // 👑 POSTULACIONES
      // ═════════════════════════════════

      await postulaciones.handleInteraction(
        interaction,
        handlers
      );
    }

  } catch (error) {

    console.error(
      "❌ Error en interactionCreate:",
      error
    );

    try {

      if (
        !interaction.replied &&
        !interaction.deferred
      ) {

        await interaction.reply({
          content:
            "❌ Ocurrió un error al procesar esta acción.",
          ephemeral: true
        });

      }

    } catch {}
  }
});

// ═══════════════════════════════════════
// 💬 MENSAJES
// ═══════════════════════════════════════

client.on("messageCreate", async message => {
  try {

    if (message.author.bot) {
      return;
    }

    // ═══════════════════════════════════
    // 📩 MENSAJE PRIVADO
    // ═══════════════════════════════════

    if (!message.guild) {

      // 👑 Postulación por DM
      await postulaciones.handleDirectMessage(
        message,
        client
      );

      // 📩 Sistema MD
      await mdTickets.handleDirectMessage(
        message,
        client
      );

      return;
    }

    // ═══════════════════════════════════
    // 🏠 MENSAJE EN SERVIDOR
    // ═══════════════════════════════════

    await mdTickets.handleGuildMessage(
      message,
      client
    );

  } catch (error) {

    console.error(
      "❌ Error en messageCreate:",
      error
    );

  }
});

// ═══════════════════════════════════════
// 🛡️ ERRORES
// ═══════════════════════════════════════

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
// 🔌 CONEXIÓN A DISCORD
// ═══════════════════════════════════════

if (!process.env.DISCORD_TOKEN) {

  console.error(
    "❌ Falta DISCORD_TOKEN en el archivo .env"
  );

  process.exit(1);
}

client.login(
  process.env.DISCORD_TOKEN
);
