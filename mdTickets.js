const {
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const config = require("./config");
const database = require("./database");

async function findOpenMDTicket(guild, userId) {
  const tickets = database.getTickets();

  const ticket = Object.values(tickets).find(
    t =>
      t.guildId === guild.id &&
      t.userId === userId &&
      t.source === "md" &&
      t.status !== "closed"
  );

  if (!ticket) return null;

  const channel = guild.channels.cache.get(ticket.channelId);

  if (!channel) {
    database.updateTicket(ticket.id, {
      status: "closed"
    });

    return null;
  }

  return ticket;
}

async function createMDTicket(guild, user) {
  const existing = await findOpenMDTicket(guild, user.id);

  if (existing) {
    return guild.channels.cache.get(existing.channelId);
  }

  const channel = await guild.channels.create({
    name: `md-${user.username}`
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "")
      .slice(0, 90),

    type: ChannelType.GuildText,

    permissionOverwrites: [
      {
        id: guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel]
      },
      {
        id: config.roles.ticketStaff,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.AttachFiles
        ]
      }
    ]
  });

  database.createTicket(channel.id, {
    id: channel.id,
    guildId: guild.id,
    channelId: channel.id,
    userId: user.id,
    username: user.username,
    type: "MD",
    typeKey: "md",
    source: "md",
    status: "open",
    claimedBy: null,
    createdAt: new Date().toISOString(),
    closedAt: null,
    rating: null,
    review: null,
    addedUsers: []
  });

  const embed = new EmbedBuilder()
    .setTitle("📩 Nuevo ticket por MD")
    .setDescription(
      [
        `👤 **Usuario:** <@${user.id}>`,
        "",
        "Este ticket fue creado mediante mensaje directo.",
        "",
        "📨 Los mensajes del usuario aparecerán aquí.",
        "💬 Las respuestas del Staff serán enviadas automáticamente al MD del usuario.",
        "",
        "🛠️ **Sistema:**",
        "📩 Usuario ↔ 🤖 KING SUPPORT ↔ 🔒 Canal privado ↔ 🛠️ Staff"
      ].join("\n")
    )
    .setFooter({ text: "KING SUPPORT • Soporte por MD" });

  await channel.send({
    content: `<@&${config.roles.ticketStaff}>`,
    embeds: [embed],
    components: [
      require("./tickets").buildTicketButtons()
    ]
  });

  return channel;
}

async function handleDirectMessage(message, client) {
  if (message.author.bot) return;

  const guild = await client.guilds.fetch(config.guildId);

  if (!guild) {
    console.error("❌ No se encontró el servidor configurado.");
    return;
  }

  let ticket = await findOpenMDTicket(guild, message.author.id);

  let channel;

  if (ticket) {
    channel = guild.channels.cache.get(ticket.channelId);
  } else {
    channel = await createMDTicket(guild, message.author);

    ticket = database.getTicket(channel.id);
  }

  if (!channel) return;

  // Evita que el mensaje inicial del usuario se envíe dos veces.
  if (ticket?.lastUserMessageId === message.id) {
    return;
  }

  database.updateTicket(channel.id, {
    lastUserMessageId: message.id
  });

  const attachmentLines = [];

  for (const attachment of message.attachments.values()) {
    attachmentLines.push(`📎 ${attachment.url}`);
  }

  await channel.send({
    content: [
      `📩 **Mensaje de <@${message.author.id}>**`,
      "",
      message.content || "*Sin texto*",
      ...attachmentLines
    ].join("\n")
  });

  await message.react("✅").catch(() => {});
}

async function handleGuildMessage(message, client) {
  if (message.author.bot) return;

  const ticket = database.getTicket(message.channel.id);

  if (!ticket) return;

  if (ticket.source !== "md") return;

  // Si el mensaje fue enviado por el usuario añadido al canal,
  // solamente permitimos el puente para el usuario principal.
  if (message.author.id !== ticket.claimedBy &&
      message.author.id !== ticket.userId) {
    // El Staff puede escribir, los demás usuarios no deben reenviarse.
    const member = message.member;

    if (!member?.roles?.cache?.has(config.roles.ticketStaff)) {
      return;
    }
  }

  // Mensaje del usuario dentro del canal MD
  if (message.author.id === ticket.userId) {
    return;
  }

  // Mensaje del Staff → MD del usuario
  if (message.member?.roles?.cache?.has(config.roles.ticketStaff)) {
    const user = await client.users
      .fetch(ticket.userId)
      .catch(() => null);

    if (!user) return;

    const attachmentLines = [];

    for (const attachment of message.attachments.values()) {
      attachmentLines.push(`📎 ${attachment.url}`);
    }

    const content = [
      `🛠️ **Respuesta del Staff — ${message.author.username}**`,
      "",
      message.content || "*Sin texto*",
      ...attachmentLines
    ].join("\n");

    await user.send(content).catch(async () => {
      await message.reply(
        "❌ No pude enviar el mensaje al MD del usuario."
      ).catch(() => {});
    });

    await message.react("✅").catch(() => {});
  }
}

module.exports = {
  findOpenMDTicket,
  createMDTicket,
  handleDirectMessage,
  handleGuildMessage
};
