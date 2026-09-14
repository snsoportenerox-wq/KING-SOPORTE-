const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder,
  PermissionFlagsBits,
  ChannelType
} = require("discord.js");

const config = require("./config");
const database = require("./database");
const transcripts = require("./transcripts");

const TICKET_TYPES = {
  alliance: {
    name: "Alianza",
    emoji: "<a:93619jumpingstar:1533480218411401296>"
  },
  support: {
    name: "Soporte",
    emoji: "<:verified:710970919736311942>"
  },
  claim: {
    name: "Claim",
    emoji: "<a:warning:1334727653969756170>"
  },
  staff: {
    name: "Staff",
    emoji: "<a:Crown_pink:1264023212673466379>"
  }
};

const BUTTON_EMOJIS = {
  add: "<a:GTALoading:1526788751563558965>",
  claim: "<a:4731verifiedred:1533478086333567087>",
  release: "<a:emoji_235:1538333225066307654>",
  close: "<a:31white_x:1505680012177834235>"
};

function isStaff(member) {
  return member?.roles?.cache?.has(config.roles.ticketStaff);
}

function buildTicketButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket_add")
      .setLabel("Añadir usuario")
      .setEmoji(BUTTON_EMOJIS.add)
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("ticket_claim")
      .setLabel("Reclamar")
      .setEmoji(BUTTON_EMOJIS.claim)
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("ticket_release")
      .setLabel("Liberar")
      .setEmoji(BUTTON_EMOJIS.release)
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("ticket_close")
      .setLabel("Cerrar")
      .setEmoji(BUTTON_EMOJIS.close)
      .setStyle(ButtonStyle.Danger)
  );
}

function buildTicketPanel() {
  const embed = new EmbedBuilder()
    .setTitle("♛ 𝑲𝒊𝒏𝒈 𝒕𝒉𝒆 𝑳𝒂𝒏𝒅 ♛")
    .setDescription(
      [
        "🎫 **Centro de Atención**",
        "",
        "Welcome to ticket system.",
        "",
        "🤝 **Alianza** — Solicita alianzas, colaboraciones o asociaciones.",
        "",
        "🛠️ **Soporte** — Obtén ayuda con cualquier problema, duda o consulta.",
        "",
        "🎯 **Claim** — Realiza una solicitud relacionada con claims.",
        "",
        "👥 **Staff** — Comunícate con el equipo Staff para asuntos relacionados con el servidor.",
        "",
        "✨ Gracias por confiar en **King the Land**."
      ].join("\n")
    )
    .setFooter({ text: "KING SUPPORT • Centro de Atención" });

  const menu = new StringSelectMenuBuilder()
    .setCustomId("ticket_type")
    .setPlaceholder("Selecciona el tipo de ticket")
    .addOptions(
      {
        label: "Alianza",
        description: "Solicitudes de alianzas y colaboraciones.",
        value: "alliance",
        emoji: TICKET_TYPES.alliance.emoji
      },
      {
        label: "Soporte",
        description: "Ayuda, dudas o problemas.",
        value: "support",
        emoji: TICKET_TYPES.support.emoji
      },
      {
        label: "Claim",
        description: "Solicitudes relacionadas con claims.",
        value: "claim",
        emoji: TICKET_TYPES.claim.emoji
      },
      {
        label: "Staff",
        description: "Asuntos relacionados con el equipo Staff.",
        value: "staff",
        emoji: TICKET_TYPES.staff.emoji
      }
    );

  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder().addComponents(menu)
    ]
  };
}

async function setupPanel(client) {
  const channel = await client.channels.fetch(config.channels.ticketPanel);

  if (!channel || channel.type !== ChannelType.GuildText) {
    throw new Error("❌ El canal del panel de tickets no es válido.");
  }

  const messages = await channel.messages.fetch({ limit: 50 });

  const existing = messages.find(
    message =>
      message.author.id === client.user.id &&
      message.embeds?.[0]?.title === "♛ 𝑲𝒊𝒏𝒈 𝒕𝒉𝒆 𝑳𝒂𝒏𝒅 ♛"
  );

  const panel = buildTicketPanel();

  if (existing) {
    await existing.edit(panel);
    return existing;
  }

  return channel.send(panel);
}

async function findOpenTicket(guild, userId) {
  const data = database.getTickets();

  const ticket = Object.values(data).find(
    ticket =>
      ticket.guildId === guild.id &&
      ticket.userId === userId &&
      ticket.status !== "closed"
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

async function createTicket(interaction, type) {
  const guild = interaction.guild;
  const user = interaction.user;

  const ticketType = TICKET_TYPES[type];

  if (!ticketType) {
    return interaction.reply({
      content: "❌ Tipo de ticket inválido.",
      ephemeral: true
    });
  }

  const existing = await findOpenTicket(guild, user.id);

  if (existing) {
    return interaction.reply({
      content: `❌ Ya tienes un ticket abierto: <#${existing.channelId}>`,
      ephemeral: true
    });
  }

  const channel = await guild.channels.create({
    name: `ticket-${type}-${user.username}`
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
        id: user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory
        ]
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

  const ticketId = `${channel.id}`;

  database.createTicket(ticketId, {
    id: ticketId,
    guildId: guild.id,
    channelId: channel.id,
    userId: user.id,
    username: user.username,
    type: ticketType.name,
    typeKey: type,
    status: "open",
    claimedBy: null,
    createdAt: new Date().toISOString(),
    closedAt: null,
    rating: null,
    review: null,
    addedUsers: []
  });

  const embed = new EmbedBuilder()
    .setTitle("🎫 Ticket creado")
    .setDescription(
      [
        `Hola <@${user.id}> 👋`,
        "",
        `Tu ticket de **${ticketType.name}** ha sido creado correctamente.`,
        "",
        "🔒 Este canal es privado.",
        "🛠️ Un miembro del Staff te atenderá pronto.",
        "",
        "📝 **Explica detalladamente tu solicitud para poder ayudarte.**"
      ].join("\n")
    )
    .setFooter({ text: "KING SUPPORT" });

  await channel.send({
    content: `|| <@${user.id}> <@&${config.roles.ticketStaff}> ||`,
    embeds: [embed],
    components: [buildTicketButtons()]
  });

  await interaction.reply({
    content: `✅ Tu ticket ha sido creado: <#${channel.id}>`,
    ephemeral: true
  });
}

async function addUser(interaction) {
  if (!isStaff(interaction.member)) {
    return interaction.reply({
      content: "❌ Solo el Staff puede añadir usuarios.",
      ephemeral: true
    });
  }

  const modal = new ModalBuilder()
    .setCustomId("ticket_add_modal")
    .setTitle("Añadir usuario al ticket");

  const input = new TextInputBuilder()
    .setCustomId("user_id")
    .setLabel("ID del usuario")
    .setPlaceholder("Ejemplo: 123456789012345678")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(input)
  );

  await interaction.showModal(modal);
}

async function addUserModal(interaction) {
  if (!isStaff(interaction.member)) {
    return interaction.reply({
      content: "❌ Solo el Staff puede añadir usuarios.",
      ephemeral: true
    });
  }

  const userId = interaction.fields.getTextInputValue("user_id").trim();

  try {
    const member = await interaction.guild.members.fetch(userId);

    await interaction.channel.permissionOverwrites.edit(member.id, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true
    });

    const ticket = database.getTicket(interaction.channel.id);

    if (ticket) {
      const addedUsers = Array.isArray(ticket.addedUsers)
        ? ticket.addedUsers
        : [];

      if (!addedUsers.includes(member.id)) {
        addedUsers.push(member.id);

        database.updateTicket(interaction.channel.id, {
          addedUsers
        });
      }
    }

    await interaction.reply({
      content: `✅ <@${member.id}> fue añadido al ticket.`,
      ephemeral: false
    });

  } catch {
    await interaction.reply({
      content: "❌ No encontré a ese usuario en el servidor.",
      ephemeral: true
    });
  }
}

async function claim(interaction) {
  if (!isStaff(interaction.member)) {
    return interaction.reply({
      content: "❌ Solo el Staff puede reclamar tickets.",
      ephemeral: true
    });
  }

  const ticket = database.getTicket(interaction.channel.id);

  if (!ticket) {
    return interaction.reply({
      content: "❌ Este canal no está registrado como ticket.",
      ephemeral: true
    });
  }

  if (ticket.claimedBy) {
    return interaction.reply({
      content: `❌ Este ticket ya fue reclamado por <@${ticket.claimedBy}>.`,
      ephemeral: true
    });
  }

  database.updateTicket(interaction.channel.id, {
    claimedBy: interaction.user.id
  });

  await interaction.reply({
    content: `🔒 Ticket reclamado por <@${interaction.user.id}>.`
  });
}

async function release(interaction) {
  if (!isStaff(interaction.member)) {
    return interaction.reply({
      content: "❌ Solo el Staff puede liberar tickets.",
      ephemeral: true
    });
  }

  const ticket = database.getTicket(interaction.channel.id);

  if (!ticket) {
    return interaction.reply({
      content: "❌ Este canal no está registrado como ticket.",
      ephemeral: true
    });
  }

  if (!ticket.claimedBy) {
    return interaction.reply({
      content: "ℹ️ Este ticket no está reclamado.",
      ephemeral: true
    });
  }

  database.updateTicket(interaction.channel.id, {
    claimedBy: null
  });

  await interaction.reply({
    content: `🔓 <@${interaction.user.id}> liberó el ticket.`
  });
}

async function requestClose(interaction) {
  const ticket = database.getTicket(interaction.channel.id);

  if (!ticket) {
    return interaction.reply({
      content: "❌ Este canal no está registrado como ticket.",
      ephemeral: true
    });
  }

  if (!isStaff(interaction.member)) {
    return interaction.reply({
      content: "❌ Solo el Staff puede solicitar el cierre.",
      ephemeral: true
    });
  }

  if (ticket.status === "pending_rating") {
    return interaction.reply({
      content: "⏳ Este ticket ya está esperando la calificación del usuario.",
      ephemeral: true
    });
  }

  database.updateTicket(interaction.channel.id, {
    status: "pending_rating"
  });

  const ratingButton = new ButtonBuilder()
    .setCustomId("ticket_rating")
    .setLabel("Calificar y cerrar")
    .setEmoji("⭐")
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder().addComponents(ratingButton);

  await interaction.reply({
    content: `<@${ticket.userId}>`,
    embeds: [
      new EmbedBuilder()
        .setTitle("⭐ Calificación requerida")
        .setDescription(
          [
            "El Staff ha solicitado cerrar este ticket.",
            "",
            "Para poder cerrarlo debes dejar una calificación.",
            "",
            "⭐ La calificación es obligatoria.",
            "📝 También deberás escribir una reseña o comentario."
          ].join("\n")
        )
    ],
    components: [row]
  });
}

async function showRatingModal(interaction) {
  const ticket = database.getTicket(interaction.channel.id);

  if (!ticket) {
    return interaction.reply({
      content: "❌ Ticket no encontrado.",
      ephemeral: true
    });
  }

  if (interaction.user.id !== ticket.userId) {
    return interaction.reply({
      content: "❌ Solo el usuario que abrió el ticket puede calificarlo.",
      ephemeral: true
    });
  }

  const modal = new ModalBuilder()
    .setCustomId("ticket_rating_modal")
    .setTitle("Calificar atención");

  const stars = new TextInputBuilder()
    .setCustomId("stars")
    .setLabel("Calificación de 1 a 5")
    .setPlaceholder("Ejemplo: 5")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(1);

  const review = new TextInputBuilder()
    .setCustomId("review")
    .setLabel("Reseña / comentario")
    .setPlaceholder("Cuéntanos cómo fue tu atención...")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(1000);

  modal.addComponents(
    new ActionRowBuilder().addComponents(stars),
    new ActionRowBuilder().addComponents(review)
  );

  await interaction.showModal(modal);
}

async function finishClose(interaction) {
  const ticket = database.getTicket(interaction.channel.id);

  if (!ticket) {
    return interaction.reply({
      content: "❌ Ticket no encontrado.",
      ephemeral: true
    });
  }

  if (interaction.user.id !== ticket.userId) {
    return interaction.reply({
      content: "❌ Solo el usuario que abrió el ticket puede realizar la calificación.",
      ephemeral: true
    });
  }

  const stars = Number(
    interaction.fields.getTextInputValue("stars").trim()
  );

  const review = interaction.fields
    .getTextInputValue("review")
    .trim();

  if (
    !Number.isInteger(stars) ||
    stars < config.tickets.rating.min ||
    stars > config.tickets.rating.max
  ) {
    return interaction.reply({
      content: "❌ La calificación debe ser un número del 1 al 5.",
      ephemeral: true
    });
  }

  database.updateTicket(interaction.channel.id, {
    status: "closed",
    rating: stars,
    review,
    closedAt: new Date().toISOString()
  });

  database.createRating(interaction.channel.id, {
    ticketId: interaction.channel.id,
    userId: ticket.userId,
    stars,
    review,
    claimedBy: ticket.claimedBy,
    type: ticket.type,
    createdAt: new Date().toISOString()
  });

  await interaction.reply({
    content: "✅ Calificación recibida. Cerrando el ticket..."
  });

  try {
    const transcriptPath = await transcripts.createTranscript(
      interaction.channel,
      {
        ...ticket,
        rating: stars,
        review,
        closedAt: new Date().toISOString()
      }
    );

    const user = await interaction.client.users
      .fetch(ticket.userId)
      .catch(() => null);

    if (user) {
      await user.send({
        content: "📄 Aquí tienes el transcript de tu ticket.",
        files: [transcriptPath]
      }).catch(() => {});
    }

    const logsChannel = await interaction.client.channels
      .fetch(config.channels.logs)
      .catch(() => null);

    if (logsChannel) {
      await logsChannel.send({
        content: `📜 Transcript del ticket de <@${ticket.userId}>`,
        files: [transcriptPath]
      }).catch(() => {});
    }

    const reviewChannel = await interaction.client.channels
      .fetch(config.channels.ticketReviews)
      .catch(() => null);

    if (reviewChannel) {
      const starsText = "⭐".repeat(stars) + "☆".repeat(5 - stars);

      await reviewChannel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("📋 Ticket cerrado")
            .addFields(
              {
                name: "👤 Usuario",
                value: `<@${ticket.userId}>`,
                inline: true
              },
              {
                name: "⭐ Calificación",
                value: `${starsText} (${stars}/5)`,
                inline: true
              },
              {
                name: "🛠️ Staff",
                value: ticket.claimedBy
                  ? `<@${ticket.claimedBy}>`
                  : "Sin reclamar",
                inline: true
              },
              {
                name: "🎫 Tipo",
                value: ticket.type,
                inline: true
              },
              {
                name: "📝 Reseña",
                value: review.slice(0, 1024),
                inline: false
              },
              {
                name: "📅 Fecha",
                value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                inline: false
              }
            )
        ]
      });
    }

  } catch (error) {
    console.error("❌ Error generando transcript:", error);
  }

  setTimeout(async () => {
    await interaction.channel.delete().catch(() => {});
  }, 3000);
}

async function handleInteraction(interaction) {
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === "ticket_type") {
      return createTicket(interaction, interaction.values[0]);
    }
  }

  if (interaction.isButton()) {
    switch (interaction.customId) {
      case "ticket_add":
        return addUser(interaction);

      case "ticket_claim":
        return claim(interaction);

      case "ticket_release":
        return release(interaction);

      case "ticket_close":
        return requestClose(interaction);

      case "ticket_rating":
        return showRatingModal(interaction);
    }
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId === "ticket_add_modal") {
      return addUserModal(interaction);
    }

    if (interaction.customId === "ticket_rating_modal") {
      return finishClose(interaction);
    }
  }
}

module.exports = {
  setupPanel,
  buildTicketPanel,
  buildTicketButtons,
  createTicket,
  handleInteraction,
  isStaff,
  findOpenTicket
};
