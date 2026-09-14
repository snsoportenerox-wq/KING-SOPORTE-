const {
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const config = require("./config");
const database = require("./database");

// ═══════════════════════════════════════
// 👑 PREGUNTAS DE POSTULACIONES
// ═══════════════════════════════════════

const APPLICATION_TYPES = {
  staff: {
    name: "Staff",
    emoji: "👮",
    channel: config.applications.channels.staff,

    questions: [
      "¿Cuál es tu nombre o cómo prefieres que te llamemos?",
      "¿Qué edad tienes?",
      "¿Cuánto tiempo llevas en el servidor?",
      "¿Por qué quieres formar parte del Staff?",
      "¿Qué experiencia tienes como moderador o staff?",
      "¿Qué harías si dos usuarios empiezan una discusión?",
      "¿Qué harías si un amigo tuyo rompe las reglas?",
      "¿Cómo actuarías ante un usuario que insulta repetidamente?",
      "¿Qué harías si otro miembro del Staff abusa de sus permisos?",
      "¿Qué significa para ti ser imparcial?",
      "¿Cómo reaccionas cuando un usuario no está de acuerdo con una sanción?",
      "¿Qué disponibilidad tienes para ayudar en el servidor?",
      "¿Qué cualidades crees que debe tener un buen Staff?",
      "¿Cómo trabajarías en equipo con los demás miembros del Staff?",
      "¿Qué harías ante una situación que no sabes resolver?",
      "¿Por qué deberíamos elegirte a ti?",
      "¿Hay algo más que quieras añadir sobre tu postulación?"
    ]
  },

  journalist: {
    name: "Periodista",
    emoji: "📰",
    channel: config.applications.channels.journalist,

    questions: [
      "¿Cuál es tu nombre o cómo prefieres que te llamemos?",
      "¿Qué edad tienes?",
      "¿Cuánto tiempo llevas en el servidor?",
      "¿Por qué quieres ser Periodista?",
      "¿Tienes experiencia redactando noticias o contenido?",
      "¿Qué tipo de noticias te gustaría publicar?",
      "¿Cómo comprobarías que una noticia es verdadera antes de publicarla?",
      "¿Qué harías si recibes información que podría ser falsa?",
      "¿Cómo presentarías una noticia de forma neutral?",
      "¿Qué importancia tiene citar las fuentes?",
      "¿Cómo reaccionarías si alguien critica una noticia que publicaste?",
      "¿Qué harías si descubres un error después de publicar una noticia?",
      "¿Con qué frecuencia podrías aportar contenido?",
      "¿Qué ideas tienes para mejorar la sección de noticias?",
      "¿Cómo trabajarías con otros periodistas?",
      "¿Por qué deberíamos aceptarte como Periodista?",
      "¿Hay algo más que quieras añadir sobre tu postulación?"
    ]
  },

  economy: {
    name: "Economía",
    emoji: "💰",
    channel: config.applications.channels.economy,

    questions: [
      "¿Cuál es tu nombre o cómo prefieres que te llamemos?",
      "¿Qué edad tienes?",
      "¿Cuánto tiempo llevas en el servidor?",
      "¿Por qué quieres formar parte del área de Economía?",
      "¿Tienes experiencia administrando sistemas económicos?",
      "¿Qué entiendes por una economía equilibrada?",
      "¿Cómo evitarías una inflación excesiva dentro del servidor?",
      "¿Cómo controlarías la cantidad de dinero que entra y sale?",
      "¿Qué harías si detectas una actividad económica sospechosa?",
      "¿Cómo actuarías ante un posible abuso del sistema económico?",
      "¿Qué ideas tienes para mejorar la economía del servidor?",
      "¿Cómo trabajarías con otros miembros del equipo de Economía?",
      "¿Cómo comprobarías que una modificación económica es segura?",
      "¿Qué harías si una decisión económica genera problemas?",
      "¿Qué disponibilidad tienes para revisar el sistema?",
      "¿Por qué deberíamos elegirte para Economía?",
      "¿Hay algo más que quieras añadir sobre tu postulación?"
    ]
  }
};

// ═══════════════════════════════════════
// 📋 PANEL DE POSTULACIONES
// ═══════════════════════════════════════

function buildApplicationPanel() {
  const embed = new EmbedBuilder()
    .setTitle("♛ 𝑲𝒊𝒏𝒈 𝒕𝒉𝒆 𝑳𝒂𝒏𝒅 ♛")
    .setDescription(
      [
        "",
        "👑 **POSTULACIONES**",
        "",
        "Selecciona el área a la que deseas postularte.",
        "",
        "👮 **Staff**",
        "📰 **Periodista**",
        "💰 **Economía**",
        ""
      ].join("\n")
    )
    .setColor(0x5865f2);

  const menu = new StringSelectMenuBuilder()
    .setCustomId("application_select")
    .setPlaceholder("Selecciona una postulación")
    .addOptions(
      {
        label: "Staff",
        description: "Postulación para formar parte del Staff",
        value: "staff",
        emoji: "👮"
      },
      {
        label: "Periodista",
        description: "Postulación para formar parte de Periodistas",
        value: "journalist",
        emoji: "📰"
      },
      {
        label: "Economía",
        description: "Postulación para el área de Economía",
        value: "economy",
        emoji: "💰"
      }
    );

  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder().addComponents(menu)
    ]
  };
}

// ═══════════════════════════════════════
// 📋 CONFIGURAR PANEL
// ═══════════════════════════════════════

async function setupPanel(client) {
  const channel = await client.channels.fetch(
    config.channels.postulationPanel
  ).catch(() => null);

  if (!channel) {
    console.error(
      "❌ No se encontró el canal del panel de postulaciones."
    );
    return;
  }

  const messages = await channel.messages.fetch({
    limit: 100
  });

  const existing = messages.find(
    message =>
      message.author.id === client.user.id &&
      message.embeds?.[0]?.title ===
        "♛ 𝑲𝒊𝒏𝒈 𝒕𝒉𝒆 𝑳𝒂𝒏𝒅 ♛"
  );

  const panel = buildApplicationPanel();

  if (existing) {
    await existing.edit(panel);
    return existing;
  }

  return await channel.send(panel);
}

// ═══════════════════════════════════════
// 📁 CREAR CANALES DE POSTULACIONES
// ═══════════════════════════════════════

async function setupApplicationChannels(guild) {
  if (!config.applications.autoCreateChannels) {
    return;
  }

  const reviewRole = await guild.roles.fetch(
    config.roles.postulationReview
  ).catch(() => null);

  if (!reviewRole) {
    console.error(
      "❌ No se encontró el rol de revisión de postulaciones."
    );
    return;
  }

  let category = guild.channels.cache.find(
    channel =>
      channel.type === ChannelType.GuildCategory &&
      channel.name === "📋・POSTULACIONES"
  );

  if (!category) {
    category = await guild.channels.create({
      name: "📋・POSTULACIONES",
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [
            PermissionFlagsBits.ViewChannel
          ]
        },
        {
          id: reviewRole.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory
          ]
        }
      ]
    });
  }

  for (const type of Object.values(
    APPLICATION_TYPES
  )) {
    let channel = guild.channels.cache.find(
      c =>
        c.type === ChannelType.GuildText &&
        c.name === type.channel
    );

    if (!channel) {
      channel = await guild.channels.create({
        name: type.channel,
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [
              PermissionFlagsBits.ViewChannel
            ]
          },
          {
            id: reviewRole.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory
            ]
          }
        ]
      });
    }
  }
}

// ═══════════════════════════════════════
// 👑 INICIAR POSTULACIÓN
// ═══════════════════════════════════════

async function startApplication(
  interaction,
  type
) {
  const applicationType =
    APPLICATION_TYPES[type];

  if (!applicationType) {
    await interaction.reply({
      content:
        "❌ Tipo de postulación inválido.",
      ephemeral: true
    });

    return true;
  }

  // 🚫 Comprobar si ya tiene una postulación activa
  const existing =
    database.findApplicationByUser(
      interaction.user.id
    );

  if (
    existing &&
    (
      existing.status === "active" ||
      existing.status === "in_progress"
    )
  ) {
    await interaction.reply({
      content:
        `❌ Ya tienes una postulación activa para **${existing.type}**.`,
      ephemeral: true
    });

    return true;
  }

  const applicationId =
    `${interaction.user.id}-${Date.now()}`;

  const application =
    database.createApplication(
      applicationId,
      {
        id: applicationId,
        userId: interaction.user.id,
        type: applicationType.name,
        typeKey: type,
        status: "active",
        currentQuestion: 0,
        answers: [],
        createdAt: new Date().toISOString()
      }
    );

  await interaction.reply({
    content:
      "📩 Te he enviado la primera pregunta por MD.",
    ephemeral: true
  });

  const user =
    await interaction.client.users.fetch(
      interaction.user.id
    );

  await sendNextQuestion(
    user,
    application
  );

  return true;
}

// ═══════════════════════════════════════
// ❓ ENVIAR SIGUIENTE PREGUNTA
// ═══════════════════════════════════════

async function sendNextQuestion(
  user,
  application
) {
  const type =
    APPLICATION_TYPES[
      application.typeKey
    ];

  if (!type) {
    return;
  }

  const questionIndex =
    application.currentQuestion;

  const question =
    type.questions[questionIndex];

  if (!question) {
    return;
  }

  const total =
    type.questions.length;

  const embed = new EmbedBuilder()
    .setTitle(
      `${type.emoji} Postulación • ${type.name}`
    )
    .setDescription(
      [
        `**Pregunta ${questionIndex + 1}/${total}**`,
        "",
        question,
        "",
        "✏️ Responde directamente a este mensaje."
      ].join("\n")
    )
    .setColor(0x5865f2)
    .setFooter({
      text: "KING SUPPORT • Postulaciones"
    });

  await user.send({
    embeds: [embed]
  });
}

// ═══════════════════════════════════════
// 📩 RESPUESTAS POR MD
// ═══════════════════════════════════════

async function handleDirectMessage(
  message,
  client
) {
  if (message.author.bot) {
    return false;
  }

  const application =
    database.findApplicationByUser(
      message.author.id
    );

  // ❌ No hay postulación activa.
  // mdTickets.js podrá encargarse del mensaje.
  if (
    !application ||
    !(
      application.status === "active" ||
      application.status === "in_progress"
    )
  ) {
    return false;
  }

  const type =
    APPLICATION_TYPES[
      application.typeKey
    ];

  if (!type) {
    return false;
  }

  const answer =
    message.content?.trim();

  if (!answer) {
    await message.reply(
      "❌ Debes escribir una respuesta."
    );

    return true;
  }

  const answers =
    Array.isArray(application.answers)
      ? application.answers
      : [];

  answers.push({
    question:
      type.questions[
        application.currentQuestion
      ],
    answer,
    answeredAt:
      new Date().toISOString()
  });

  const nextQuestion =
    application.currentQuestion + 1;

  // ═══════════════════════════════════
  // ✅ POSTULACIÓN TERMINADA
  // ═══════════════════════════════════

  if (
    nextQuestion >= type.questions.length
  ) {
    database.updateApplication(
      application.id,
      {
        status: "completed",
        currentQuestion: nextQuestion,
        answers,
        completedAt:
          new Date().toISOString()
      }
    );

    await sendApplicationForReview(
      client,
      database.getApplication(
        application.id
      )
    );

    await message.reply(
      [
        "✅ **Postulación completada.**",
        "",
        "📋 Tu postulación fue enviada al equipo encargado.",
        "📩 Te avisaremos por MD cuando haya una decisión."
      ].join("\n")
    );

    return true;
  }

  // ═══════════════════════════════════
  // ➡️ SIGUIENTE PREGUNTA
  // ═══════════════════════════════════

  database.updateApplication(
    application.id,
    {
      status: "in_progress",
      currentQuestion: nextQuestion,
      answers
    }
  );

  const updated =
    database.getApplication(
      application.id
    );

  await sendNextQuestion(
    message.author,
    updated
  );

  return true;
}

// ═══════════════════════════════════════
// 📋 ENVIAR POSTULACIÓN A REVISIÓN
// ═══════════════════════════════════════

async function sendApplicationForReview(
  client,
  application
) {
  const type =
    APPLICATION_TYPES[
      application.typeKey
    ];

  if (!type) {
    return;
  }

  const channel =
    await client.channels.fetch(
      getApplicationChannelId(
        client,
        type.channel
      )
    ).catch(() => null);

  // Si no se puede encontrar por ID,
  // buscar por nombre en el servidor.
  let targetChannel = channel;

  if (!targetChannel) {
    const guild =
      await client.guilds.fetch(
        config.guildId
      ).catch(() => null);

    if (guild) {
      targetChannel =
        guild.channels.cache.find(
          c =>
            c.type === ChannelType.GuildText &&
            c.name === type.channel
        );
    }
  }

  if (!targetChannel) {
    console.error(
      `❌ No se encontró el canal de ${type.name}.`
    );
    return;
  }

  const answers =
    application.answers || [];

  const answerText =
    answers
      .map(
        (item, index) =>
          `**${index + 1}. ${item.question}**\n${item.answer}`
      )
      .join("\n\n");

  const embed =
    new EmbedBuilder()
      .setTitle(
        `${type.emoji} Nueva postulación • ${type.name}`
      )
      .setDescription(
        [
          `👤 **Usuario:** <@${application.userId}>`,
          `🆔 **ID:** ${application.userId}`,
          "",
          answerText
        ].join("\n")
      )
      .setColor(0x5865f2)
      .setTimestamp();

  const row =
    new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(
            `application_accept_${application.id}`
          )
          .setLabel("Aceptar")
          .setEmoji("✅")
          .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
          .setCustomId(
            `application_reject_${application.id}`
          )
          .setLabel("Rechazar")
          .setEmoji("❌")
          .setStyle(ButtonStyle.Danger)
      );

  await targetChannel.send({
    embeds: [embed],
    components: [row]
  });
}

// ═══════════════════════════════════════
// 🔎 OBTENER CANAL
// ═══════════════════════════════════════

function getApplicationChannelId(
  client,
  channelName
) {
  const guild =
    client.guilds.cache.get(
      config.guildId
    );

  if (!guild) {
    return null;
  }

  const channel =
    guild.channels.cache.find(
      c =>
        c.type === ChannelType.GuildText &&
        c.name === channelName
    );

  return channel?.id || null;
}

// ═══════════════════════════════════════
// ⚖️ DECISIÓN DE POSTULACIÓN
// ═══════════════════════════════════════

async function decideApplication(
  interaction,
  applicationId,
  accepted
) {
  const member =
    interaction.member;

  if (
    !member ||
    !member.roles.cache.has(
      config.roles.postulationReview
    )
  ) {
    await interaction.reply({
      content:
        "❌ No tienes permiso para revisar postulaciones.",
      ephemeral: true
    });

    return true;
  }

  const application =
    database.getApplication(
      applicationId
    );

  if (!application) {
    await interaction.reply({
      content:
        "❌ No se encontró la postulación.",
      ephemeral: true
    });

    return true;
  }

  if (
    application.status !== "completed"
  ) {
    await interaction.reply({
      content:
        "❌ Esta postulación ya fue procesada o todavía no está terminada.",
      ephemeral: true
    });

    return true;
  }

  const newStatus =
    accepted
      ? "accepted"
      : "rejected";

  database.updateApplication(
    applicationId,
    {
      status: newStatus,
      decidedBy: interaction.user.id,
      decidedAt:
        new Date().toISOString()
    }
  );

  const user =
    await interaction.client.users.fetch(
      application.userId
    ).catch(() => null);

  if (user) {
    if (accepted) {
      await user.send(
        [
          "🎉 **¡Tu postulación fue aceptada!**",
          "",
          `👑 Área: **${application.type}**`,
          "",
          "El equipo ha aprobado tu postulación."
        ].join("\n")
      ).catch(() => {});
    } else {
      await user.send(
        [
          "❌ **Tu postulación fue rechazada.**",
          "",
          `📋 Área: **${application.type}**`,
          "",
          "Gracias por participar en el proceso."
        ].join("\n")
      ).catch(() => {});
    }
  }

  const resultText =
    accepted
      ? "✅ **ACEPTADA**"
      : "❌ **RECHAZADA**";

  const oldEmbed =
    interaction.message?.embeds?.[0];

  const updatedEmbed =
    oldEmbed
      ? EmbedBuilder.from(oldEmbed)
          .setColor(
            accepted
              ? 0x57f287
              : 0xed4245
          )
          .addFields({
            name: "📋 Resultado",
            value: resultText,
            inline: true
          })
          .addFields({
            name: "👮 Revisado por",
            value: `<@${interaction.user.id}>`,
            inline: true
          })
      : new EmbedBuilder()
          .setTitle(
            `📋 Postulación ${application.type}`
          )
          .setDescription(
            resultText
          );

  await interaction.update({
    embeds: [updatedEmbed],
    components: []
  });

  return true;
}

// ═══════════════════════════════════════
// 🖱️ INTERACCIONES
// ═══════════════════════════════════════

async function handleInteraction(
  interaction
) {
  if (
    interaction.isStringSelectMenu() &&
    interaction.customId ===
      "application_select"
  ) {
    const type =
      interaction.values[0];

    return await startApplication(
      interaction,
      type
    );
  }

  if (
    interaction.isButton() &&
    interaction.customId.startsWith(
      "application_accept_"
    )
  ) {
    const applicationId =
      interaction.customId.replace(
        "application_accept_",
        ""
      );

    return await decideApplication(
      interaction,
      applicationId,
      true
    );
  }

  if (
    interaction.isButton() &&
    interaction.customId.startsWith(
      "application_reject_"
    )
  ) {
    const applicationId =
      interaction.customId.replace(
        "application_reject_",
        ""
      );

    return await decideApplication(
      interaction,
      applicationId,
      false
    );
  }

  return false;
}

// ═══════════════════════════════════════
// 📤 EXPORTACIONES
// ═══════════════════════════════════════

module.exports = {
  APPLICATION_TYPES,

  buildApplicationPanel,

  setupPanel,
  setupApplicationChannels,

  startApplication,
  handleDirectMessage,
  handleInteraction,

  sendNextQuestion,
  sendApplicationForReview,

  decideApplication
};
