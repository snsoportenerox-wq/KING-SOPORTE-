const {
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");

const config = require("./config");
const database = require("./database");
const transcripts = require("./transcripts");

// ═══════════════════════════════════════
// 🔎 BUSCAR TICKET MD
// ═══════════════════════════════════════

function findOpenMDTicket(userId) {
  const tickets = database.getTickets();

  return Object.values(tickets).find(
    ticket =>
      ticket.source === "md" &&
      ticket.userId === userId &&
      ticket.status !== "closed"
  ) || null;
}

// ═══════════════════════════════════════
// 📩 CREAR TICKET MD
// ═══════════════════════════════════════

async function createMDTicket(user, client) {
  const existing = findOpenMDTicket(user.id);

  if (existing) {
    return existing;
  }

  const guild = await client.guilds.fetch(config.guildId);

  const staffRole = await guild.roles.fetch(
    config.roles.ticketStaff
  );

  const channel = await guild.channels.create({
    name: `md-${user.username}`
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "-")
      .slice(0, 90),

    type: ChannelType.GuildText,

    permissionOverwrites: [
      {
        id: guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel]
      },
      {
        id: staffRole.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory
        ]
      }
    ]
  });

  const ticket = database.createTicket(channel.id, {
    id: channel.id,
    channelId: channel.id,
    userId: user.id,
    type: "MD",
    source: "md",
    status: "open",
    claimedBy: null,
    createdAt: new Date().toISOString(),
    addedUsers: []
  });

  const embed = new EmbedBuilder()
    .setTitle("📩 Ticket por MD")
    .setDescription(
      [
        `👤 **Usuario:** <@${user.id}>`,
        "",
        "Este canal es privado y está destinado al Staff.",
        "",
        "📩 El usuario se comunica mediante MD con el bot.",
        "🛠️ El Staff responde desde este canal.",
        "",
        "🔗 **Puente de comunicación**",
        "👤 Usuario ↔ 🤖 KING SUPPORT ↔ 🔒 Canal privado ↔ 🛠️ Staff"
      ].join("\n")
    )
    .setColor(0x5865f2)
    .setTimestamp();

  await channel.send({
    content: `|| <@&${staffRole.id}> ||`,
    embeds: [embed],
    components: [
      require("./tickets").buildTicketButtons()
    ]
  });

  return ticket;
}

// ═══════════════════════════════════════
// 📤 ENVIAR MENSAJE DEL USUARIO AL STAFF
// ═══════════════════════════════════════

async function handleDirectMessage(message, client) {
  if (message.author.bot) {
    return false;
  }

  // Si el usuario tiene una postulación activa,
  // este sistema no debe crear un ticket MD.
  const activeApplication =
    database.findApplicationByUser(message.author.id);

  if (
    activeApplication &&
    (
      activeApplication.status === "active" ||
      activeApplication.status === "in_progress"
    )
  ) {
    return false;
  }

  let ticket = findOpenMDTicket(message.author.id);

  if (!ticket) {
    ticket = await createMDTicket(
      message.author,
      client
    );
  }

  const channel = await client.channels.fetch(
    ticket.channelId
  );

  if (!channel) {
    return false;
  }

  let content = message.content || "";

  if (message.attachments?.size) {
    const attachments = [...message.attachments.values()]
      .map(attachment => attachment.url)
      .join("\n");

    content += content
      ? `\n\n📎 **Adjuntos:**\n${attachments}`
      : `📎 **Adjuntos:**\n${attachments}`;
  }

  const embed = new EmbedBuilder()
    .setAuthor({
      name: message.author.tag,
      iconURL: message.author.displayAvatarURL()
    })
    .setDescription(
      content || "📎 El usuario envió un archivo."
    )
    .setColor(0x5865f2)
    .setFooter({
      text: `Usuario: ${message.author.id}`
    })
    .setTimestamp();

  await channel.send({
    embeds: [embed]
  });

  await message.react("✅").catch(() => {});

  return true;
}

// ═══════════════════════════════════════
// 📤 ENVIAR RESPUESTA DEL STAFF AL USUARIO
// ═══════════════════════════════════════

async function handleGuildMessage(message, client) {
  if (message.author.bot) {
    return false;
  }

  const ticket = database.getTicket(
    message.channel.id
  );

  if (
    !ticket ||
    ticket.source !== "md"
  ) {
    return false;
  }

  const member = message.member;

  if (
    !member ||
    !member.roles.cache.has(
      config.roles.ticketStaff
    )
  ) {
    return false;
  }

  const user = await client.users.fetch(
    ticket.userId
  ).catch(() => null);

  if (!user) {
    return false;
  }

  let content = message.content || "";

  if (message.attachments?.size) {
    const attachments = [...message.attachments.values()]
      .map(attachment => attachment.url)
      .join("\n");

    content += content
      ? `\n\n📎 **Adjuntos:**\n${attachments}`
      : `📎 **Adjuntos:**\n${attachments}`;
  }

  if (!content) {
    content = "📎 El Staff envió un archivo.";
  }

  const embed = new EmbedBuilder()
    .setAuthor({
      name: "KING SUPPORT • Staff"
    })
    .setDescription(content)
    .setColor(0x57f287)
    .setTimestamp();

  await user.send({
    embeds: [embed]
  }).catch(() => {});

  await message.react("✅").catch(() => {});

  return true;
}

// ═══════════════════════════════════════
// 🔎 COMPROBAR SI ES TICKET MD
// ═══════════════════════════════════════

function isMDTicket(channelId) {
  const ticket = database.getTicket(channelId);

  return Boolean(
    ticket &&
    ticket.source === "md"
  );
}

// ═══════════════════════════════════════
// ❌ CERRAR TICKET MD
// ═══════════════════════════════════════

async function requestMDClose(interaction) {
  const ticket = database.getTicket(
    interaction.channel.id
  );

  if (
    !ticket ||
    ticket.source !== "md"
  ) {
    return false;
  }

  const member = interaction.member;

  if (
    !member ||
    !member.roles.cache.has(
      config.roles.ticketStaff
    )
  ) {
    await interaction.reply({
      content:
        "❌ No tienes permiso para cerrar este ticket.",
      ephemeral: true
    });

    return true;
  }

  // Solo el staff que reclamó puede cerrarlo,
  // si existe un reclamante.
  if (
    ticket.claimedBy &&
    ticket.claimedBy !== interaction.user.id
  ) {
    await interaction.reply({
      content:
        "❌ Este ticket está siendo atendido por otro miembro del Staff.",
      ephemeral: true
    });

    return true;
  }

  const user = await interaction.client.users.fetch(
    ticket.userId
  ).catch(() => null);

  if (!user) {
    await interaction.reply({
      content:
        "❌ No pude encontrar al usuario.",
      ephemeral: true
    });

    return true;
  }

  database.updateTicket(
    interaction.channel.id,
    {
      status: "pending_rating",
      closeRequestedBy: interaction.user.id,
      closeRequestedAt: new Date().toISOString()
    }
  );

  // ⭐ LA RESEÑA SE ENVÍA AL MD DEL USUARIO
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(
          `md_rating_start_${interaction.channel.id}`
        )
        .setLabel("Calificar y cerrar")
        .setEmoji("⭐")
        .setStyle(ButtonStyle.Primary)
    );

  await user.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("⭐ Califica tu atención")
        .setDescription(
          [
            "El Staff ha solicitado cerrar tu ticket.",
            "",
            "Antes de cerrarlo, queremos conocer tu experiencia.",
            "",
            "Pulsa **Calificar y cerrar** para dejar tu calificación y reseña.",
            "",
            "⭐ Tu opinión será enviada al canal de reseñas del servidor."
          ].join("\n")
        )
        .setColor(0xfee75c)
        .setTimestamp()
    ],
    components: [row]
  }).catch(async () => {
    await interaction.reply({
      content:
        "❌ No pude enviar el mensaje de calificación al MD del usuario.",
      ephemeral: true
    });
  });

  await interaction.reply({
    content:
      "📩 Se envió la solicitud de calificación al MD del usuario.",
    ephemeral: true
  });

  return true;
}

// ═══════════════════════════════════════
// ⭐ MOSTRAR MODAL DE CALIFICACIÓN
// ═══════════════════════════════════════

async function showMDRatingModal(interaction) {
  const parts = interaction.customId.split("_");
  const channelId = parts[3];

  const ticket = database.getTicket(channelId);

  if (
    !ticket ||
    ticket.source !== "md"
  ) {
    await interaction.reply({
      content:
        "❌ Este ticket MD ya no existe.",
      ephemeral: true
    });

    return true;
  }

  if (
    ticket.userId !== interaction.user.id
  ) {
    await interaction.reply({
      content:
        "❌ Esta calificación no corresponde a tu cuenta.",
      ephemeral: true
    });

    return true;
  }

  const modal = new ModalBuilder()
    .setCustomId(
      `md_rating_submit_${channelId}`
    )
    .setTitle("⭐ Calificar atención MD");

  const rating = new TextInputBuilder()
    .setCustomId("rating")
    .setLabel("Calificación de 1 a 5")
    .setPlaceholder("Ejemplo: 5")
    .setStyle(TextInputStyle.Short)
    .setMinLength(1)
    .setMaxLength(1)
    .setRequired(true);

  const review = new TextInputBuilder()
    .setCustomId("review")
    .setLabel("Escribe tu reseña")
    .setPlaceholder(
      "Cuéntanos cómo fue la atención..."
    )
    .setStyle(TextInputStyle.Paragraph)
    .setMaxLength(1000)
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder().addComponents(rating),
    new ActionRowBuilder().addComponents(review)
  );

  await interaction.showModal(modal);

  return true;
}

// ═══════════════════════════════════════
// ⭐ PROCESAR RESEÑA MD
// ═══════════════════════════════════════

async function submitMDRating(interaction) {
  const parts = interaction.customId.split("_");
  const channelId = parts[3];

  const ticket = database.getTicket(channelId);

  if (
    !ticket ||
    ticket.source !== "md"
  ) {
    await interaction.reply({
      content:
        "❌ Este ticket ya no está disponible.",
      ephemeral: true
    });

    return true;
  }

  if (
    ticket.userId !== interaction.user.id
  ) {
    await interaction.reply({
      content:
        "❌ Esta reseña no corresponde a tu cuenta.",
      ephemeral: true
    });

    return true;
  }

  const rating = Number(
    interaction.fields.getTextInputValue(
      "rating"
    )
  );

  const review =
    interaction.fields.getTextInputValue(
      "review"
    ).trim();

  if (
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    await interaction.reply({
      content:
        "❌ La calificación debe ser un número del uno al cinco.",
      ephemeral: true
    });

    return true;
  }

  // 💾 Guardar reseña
  database.createRating(
    channelId,
    {
      userId: ticket.userId,
      staffId: ticket.claimedBy || null,
      rating,
      review,
      source: "md",
      createdAt: new Date().toISOString()
    }
  );

  database.updateTicket(
    channelId,
    {
      status: "closed",
      rating,
      review,
      closedAt: new Date().toISOString()
    }
  );

  // 📋 Enviar reseña al canal de reviews
  const reviewsChannel =
    await interaction.client.channels.fetch(
      config.channels.ticketReviews
    ).catch(() => null);

  if (reviewsChannel) {
    const stars = "⭐".repeat(rating);

    const embed = new EmbedBuilder()
      .setTitle("📋 Nueva reseña • Ticket MD")
      .addFields(
        {
          name: "👤 Usuario",
          value: `<@${ticket.userId}>`,
          inline: true
        },
        {
          name: "🛠️ Staff",
          value: ticket.claimedBy
            ? `<@${ticket.claimedBy}>`
            : "No reclamado",
          inline: true
        },
        {
          name: "⭐ Calificación",
          value: `${stars} (${rating}/5)`,
          inline: true
        },
        {
          name: "📝 Reseña",
          value: review.slice(0, 1024)
        }
      )
      .setColor(0xfee75c)
      .setTimestamp();

    await reviewsChannel.send({
      embeds: [embed]
    });
  }

  // 📜 Transcripción
  const channel =
    await interaction.client.channels.fetch(
      channelId
    ).catch(() => null);

  if (channel) {
    try {
      const transcriptPath =
        await transcripts.createTranscript(
          channel,
          database.getTicket(channelId)
        );

      const logsChannel =
        await interaction.client.channels.fetch(
          config.channels.logs
        ).catch(() => null);

      if (logsChannel) {
        await logsChannel.send({
          content:
            `📜 **Transcripción de ticket MD**\n👤 <@${ticket.userId}>`,
          files: [transcriptPath]
        });
      }

      await interaction.client.users
        .fetch(ticket.userId)
        .then(user =>
          user.send({
            content:
              "📜 Aquí tienes la transcripción de tu ticket MD.",
            files: [transcriptPath]
          })
        )
        .catch(() => {});
    } catch (error) {
      console.error(
        "❌ Error creando transcripción MD:",
        error
      );
    }
  }

  await interaction.reply({
    content:
      "✅ Gracias por tu reseña. Tu ticket MD ha sido cerrado.",
    ephemeral: true
  });

  // 🔒 Eliminar canal del servidor
  if (channel) {
    setTimeout(async () => {
      await channel.delete(
        "Ticket MD cerrado después de recibir la reseña"
      ).catch(() => {});
    }, 3000);
  }

  return true;
}

// ═══════════════════════════════════════
// 🖱️ INTERACCIONES MD
// ═══════════════════════════════════════

async function handleInteraction(interaction) {
  if (!interaction.customId) {
    return false;
  }

  // ❌ Cerrar desde el canal del Staff
  if (
    interaction.isButton() &&
    interaction.customId === "ticket_close" &&
    isMDTicket(interaction.channel?.id)
  ) {
    return await requestMDClose(interaction);
  }

  // ⭐ Botón que recibe el usuario por MD
  if (
    interaction.isButton() &&
    interaction.customId.startsWith(
      "md_rating_start_"
    )
  ) {
    return await showMDRatingModal(interaction);
  }

  // ⭐ Modal de reseña
  if (
    interaction.isModalSubmit() &&
    interaction.customId.startsWith(
      "md_rating_submit_"
    )
  ) {
    return await submitMDRating(interaction);
  }

  return false;
}

module.exports = {
  findOpenMDTicket,
  createMDTicket,
  handleDirectMessage,
  handleGuildMessage,
  isMDTicket,
  requestMDClose,
  showMDRatingModal,
  submitMDRating,
  handleInteraction
};
