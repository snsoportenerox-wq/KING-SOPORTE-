const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
  ChannelType,
  PermissionFlagsBits
} = require("discord.js");

const config = require("./config");
const database = require("./database");

const APPLICATION_TYPES = {
  staff: {
    name: "Staff",
    emoji: "👮",
    channel: config.applications.channels.staff,
    questions: [
      "¿Cuál es tu nombre o apodo?",
      "¿Cuántos años tienes?",
      "¿Cuál es tu zona horaria?",
      "¿Cuánto tiempo llevas en el servidor?",
      "¿Por qué quieres formar parte del Staff?",
      "¿Qué experiencia tienes como Staff?",
      "¿Qué cargos de moderación has tenido anteriormente?",
      "¿Qué funciones consideras importantes para un Staff?",
      "¿Cómo actuarías ante una discusión entre dos miembros?",
      "¿Qué harías si un amigo incumple las reglas?",
      "¿Cómo actuarías ante un usuario que provoca al Staff?",
      "¿Qué harías ante una situación que no sabes resolver?",
      "¿Qué tan activo puedes ser en el servidor?",
      "¿Cuántas horas aproximadamente puedes dedicar al servidor?",
      "¿Cómo trabajarías en equipo con los demás Staff?",
      "¿Qué aportarías al equipo Staff?",
      "¿Por qué deberíamos aceptarte?"
    ]
  },

  journalist: {
    name: "Periodista",
    emoji: "📰",
    channel: config.applications.channels.journalist,
    questions: [
      "¿Cuál es tu nombre o apodo?",
      "¿Cuántos años tienes?",
      "¿Cuál es tu zona horaria?",
      "¿Cuánto tiempo llevas en el servidor?",
      "¿Por qué quieres ser Periodista?",
      "¿Tienes experiencia creando noticias o contenido?",
      "¿Qué tipo de contenido te gustaría publicar?",
      "¿Cómo comprobarías que una noticia es verdadera?",
      "¿Qué harías si recibes información falsa?",
      "¿Cómo presentarías una noticia importante?",
      "¿Qué herramientas utilizas para crear contenido?",
      "¿Tienes experiencia editando imágenes o vídeos?",
      "¿Cómo trabajarías con otros periodistas?",
      "¿Qué harías si alguien pide publicar información privada?",
      "¿Cuánto tiempo puedes dedicar al área de Periodismo?",
      "¿Qué aportarías al equipo?",
      "¿Por qué deberíamos aceptarte?"
    ]
  },

  economy: {
    name: "Economía",
    emoji: "💰",
    channel: config.applications.channels.economy,
    questions: [
      "¿Cuál es tu nombre o apodo?",
      "¿Cuántos años tienes?",
      "¿Cuál es tu zona horaria?",
      "¿Cuánto tiempo llevas en el servidor?",
      "¿Por qué quieres entrar al área de Economía?",
      "¿Qué experiencia tienes administrando sistemas económicos?",
      "¿Qué entiendes por una economía equilibrada?",
      "¿Cómo evitarías una inflación excesiva?",
      "¿Cómo controlarías la cantidad de dinero existente?",
      "¿Qué harías ante una economía desequilibrada?",
      "¿Cómo detectarías posibles abusos económicos?",
      "¿Cómo actuarías ante un error económico?",
      "¿Qué ideas tienes para mejorar la economía?",
      "¿Cómo trabajarías con otros miembros del equipo?",
      "¿Qué tan activo puedes ser?",
      "¿Qué aportarías al área de Economía?",
      "¿Por qué deberíamos aceptarte?"
    ]
  }
};

function buildApplicationPanel() {
  const embed = new EmbedBuilder()
    .setTitle("♛ 𝑲𝒊𝒏𝒈 𝒕𝒉𝒆 𝑳𝒂𝒏𝒅 ♛")
    .setDescription(
      [
        "👑 **Centro de Postulaciones**",
        "",
        "¿Quieres formar parte del equipo de **King the Land**?",
        "",
        "Selecciona el área a la que deseas postularte:",
        "",
        "👮 **Staff**",
        "Forma parte del equipo encargado de ayudar y moderar el servidor.",
        "",
        "📰 **Periodista**",
        "Participa en noticias, novedades y contenido del servidor.",
        "",
        "💰 **Economía**",
        "Ayuda a gestionar y mejorar el sistema económico.",
        "",
        "✨ La postulación será realizada mediante MD."
      ].join("\n")
    )
    .setFooter({
      text: "KING SUPPORT • Postulaciones"
    });

  const menu = new StringSelectMenuBuilder()
    .setCustomId("application_type")
    .setPlaceholder("Selecciona una postulación")
    .addOptions(
      {
        label: "Staff",
        description: "Postúlate para formar parte del Staff.",
        value: "staff",
        emoji: "👮"
      },
      {
        label: "Periodista",
        description: "Postúlate para el área de Periodismo.",
        value: "journalist",
        emoji: "📰"
      },
      {
        label: "Economía",
        description: "Postúlate para el área de Economía.",
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

async function setupPanel(client) {
  const channel = await client.channels.fetch(
    config.channels.postulationPanel
  );

  if (!channel || channel.type !== ChannelType.GuildText) {
    throw new Error(
      "❌ El canal del panel de postulaciones no es válido."
    );
  }

  const messages = await channel.messages.fetch({
    limit: 50
  });

  const existing = messages.find(
    message =>
      message.author.id === client.user.id &&
      message.embeds?.[0]?.title === "♛ 𝑲𝒊𝒏𝒈 𝒕𝒉𝒆 𝑳𝒂𝒏𝒅 ♛"
  );

  const panel = buildApplicationPanel();

  if (existing) {
    await existing.edit(panel);
    return existing;
  }

  return channel.send(panel);
}

async function setupApplicationChannels(guild) {
  if (!config.applications.autoCreateChannels) return;

  const categoryName = "📋・POSTULACIONES";

  let category = guild.channels.cache.find(
    channel =>
      channel.type === ChannelType.GuildCategory &&
      channel.name === categoryName
  );

  if (!category) {
    category = await guild.channels.create({
      name: categoryName,
      type: ChannelType.GuildCategory
    });
  }

  for (const application of Object.values(APPLICATION_TYPES)) {
    let channel = guild.channels.cache.find(
      channel =>
        channel.name === application.channel &&
        channel.parentId === category.id
    );

    if (!channel) {
      channel = await guild.channels.create({
        name: application.channel,
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
            id: config.roles.postulationReview,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory
            ]
          }
        ]
      });

      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(`${application.emoji} Postulaciones de ${application.name}`)
            .setDescription(
              `Aquí aparecerán las postulaciones de **${application.name}**.\n\nSolo el personal autorizado puede revisarlas.`
            )
            .setFooter({
              text: "KING SUPPORT"
            })
        ]
      });
    }
  }
}

async function startApplication(interaction, type) {
  const application = APPLICATION_TYPES[type];

  if (!application) {
    return interaction.reply({
      content: "❌ Tipo de postulación inválido.",
      ephemeral: true
    });
  }

  const existing = database.findApplicationByUser(
    interaction.user.id
  );

  if (existing && existing.status === "pending") {
    return interaction.reply({
      content:
        "❌ Ya tienes una postulación pendiente. Espera a que sea revisada.",
      ephemeral: true
    });
  }

  database.createApplication(interaction.user.id, {
    id: `${interaction.user.id}-${Date.now()}`,
    userId: interaction.user.id,
    username: interaction.user.username,
    type: application.name,
    typeKey: type,
    status: "answering",
    currentQuestion: 0,
    answers: [],
    createdAt: new Date().toISOString()
  });

  await interaction.reply({
    content:
      "📩 Te he enviado un MD para comenzar tu postulación.",
    ephemeral: true
  });

  try {
    await interaction.user.send(
      [
        `👑 **KING SUPPORT — Postulación de ${application.name}**`,
        "",
        `Vas a responder **${application.questions.length} preguntas**.`,
        "",
        "📌 Responde una pregunta a la vez.",
        "📌 No cierres el MD hasta terminar.",
        "",
        `**Pregunta 1/${application.questions.length}:**`,
        application.questions[0]
      ].join("\n")
    );
  } catch {
    database.updateApplication(
      database.getApplication(
        interaction.user.id
      )?.id,
      {
        status: "cancelled"
      }
    );

    return interaction.followUp({
      content:
        "❌ No pude enviarte un MD. Activa los mensajes directos e inténtalo nuevamente.",
      ephemeral: true
    });
  }
}

async function handleDirectMessage(message, client) {
  if (message.author.bot) return;

  const application = database.findApplicationByUser(
    message.author.id
  );

  if (!application || application.status !== "answering") {
    return;
  }

  const type = APPLICATION_TYPES[application.typeKey];

  if (!type) return;

  const answer = message.content.trim();

  if (!answer) {
    await message.reply(
      "❌ Debes escribir una respuesta antes de continuar."
    );
    return;
  }

  const answers = Array.isArray(application.answers)
    ? application.answers
    : [];

  answers.push({
    question: type.questions[application.currentQuestion],
    answer
  });

  const nextQuestion = application.currentQuestion + 1;

  if (nextQuestion < type.questions.length) {
    database.updateApplication(application.id, {
      answers,
      currentQuestion: nextQuestion
    });

    await message.reply(
      [
        `**Pregunta ${nextQuestion + 1}/${type.questions.length}:**`,
        type.questions[nextQuestion]
      ].join("\n")
    );

    return;
  }

  database.updateApplication(application.id, {
    answers,
    currentQuestion: nextQuestion,
    status: "pending"
  });

  await sendApplicationToReviewChannel(
    client,
    {
      ...application,
      answers,
      status: "pending"
    },
    type
  );

  await message.reply(
    [
      "✅ **Postulación completada.**",
      "",
      "Tu solicitud fue enviada al equipo encargado.",
      "📋 Ahora será revisada por el personal autorizado.",
      "",
      "Te avisaremos por MD cuando haya una decisión."
    ].join("\n")
  );
}

async function sendApplicationToReviewChannel(
  client,
  application,
  type
) {
  const guild = await client.guilds.fetch(config.guildId);

  const channel = guild.channels.cache.find(
    c =>
      c.name === type.channel &&
      c.type === ChannelType.GuildText
  );

  if (!channel) {
    console.error(
      `❌ No existe el canal de ${type.name}.`
    );
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle(`${type.emoji} Nueva postulación — ${type.name}`)
    .setDescription(
      `👤 **Postulante:** <@${application.userId}>\n🆔 **ID:** \`${application.userId}\``
    )
    .setFooter({
      text: "KING SUPPORT • Revisión de postulaciones"
    });

  const fields = application.answers.map(
    (item, index) => ({
      name: `${index + 1}. ${item.question}`,
      value: item.answer.slice(0, 1024) || "Sin respuesta"
    })
  );

  embed.addFields(fields);

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`application_accept:${application.id}`)
      .setLabel("Aceptar")
      .setEmoji("✅")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId(`application_reject:${application.id}`)
      .setLabel("Rechazar")
      .setEmoji("❌")
      .setStyle(ButtonStyle.Danger)
  );

  await channel.send({
    embeds: [embed],
    components: [buttons]
  });
}

async function decideApplication(
  interaction,
  applicationId,
  accepted
) {
  if (
    !interaction.member?.roles?.cache?.has(
      config.roles.postulationReview
    )
  ) {
    return interaction.reply({
      content:
        "❌ No tienes permiso para aceptar o rechazar postulaciones.",
      ephemeral: true
    });
  }

  const application = database.getApplication(
    applicationId
  );

  if (!application) {
    return interaction.reply({
      content: "❌ No encontré esta postulación.",
      ephemeral: true
    });
  }

  if (application.status !== "pending") {
    return interaction.reply({
      content: "❌ Esta postulación ya fue procesada.",
      ephemeral: true
    });
  }

  const newStatus = accepted
    ? "accepted"
    : "rejected";

  database.updateApplication(applicationId, {
    status: newStatus,
    reviewedBy: interaction.user.id,
    reviewedAt: new Date().toISOString()
  });

  const user = await interaction.client.users
    .fetch(application.userId)
    .catch(() => null);

  if (user) {
    await user.send(
      accepted
        ? [
            "🎉 **Tu postulación ha sido aceptada.**",
            "",
            `Tu postulación para **${application.type}** fue aceptada.`,
            "",
            `👮 Revisor: <@${interaction.user.id}>`,
            "",
            "¡Bienvenido al equipo de King the Land! 👑"
          ].join("\n")
        : [
            "❌ **Tu postulación ha sido rechazada.**",
            "",
            `Tu postulación para **${application.type}** no fue aceptada en esta ocasión.`,
            "",
            `👮 Revisor: <@${interaction.user.id}>`,
            "",
            "Gracias por haber participado."
          ].join("\n")
    ).catch(() => {});
  }

  await interaction.update({
    embeds: [
      ...interaction.message.embeds
    ],
    components: [],
    content: accepted
      ? "✅ **POSTULACIÓN ACEPTADA**"
      : "❌ **POSTULACIÓN RECHAZADA**"
  });
}

async function handleInteraction(interaction) {
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === "application_type") {
      return startApplication(
        interaction,
        interaction.values[0]
      );
    }
  }

  if (interaction.isButton()) {
    if (
      interaction.customId.startsWith(
        "application_accept:"
      )
    ) {
      const applicationId =
        interaction.customId.split(":")[1];

      return decideApplication(
        interaction,
        applicationId,
        true
      );
    }

    if (
      interaction.customId.startsWith(
        "application_reject:"
      )
    ) {
      const applicationId =
        interaction.customId.split(":")[1];

      return decideApplication(
        interaction,
        applicationId,
        false
      );
    }
  }
}

module.exports = {
  setupPanel,
  setupApplicationChannels,
  handleInteraction,
  handleDirectMessage,
  APPLICATION_TYPES
};
