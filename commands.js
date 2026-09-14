const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const config = require("./config");

const commands = [

  // ═══════════════════════════════════════
  // 🎫 TICKETS
  // ═══════════════════════════════════════

  new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Crear un ticket manualmente.")
    .addStringOption(option =>
      option
        .setName("tipo")
        .setDescription("Tipo de ticket.")
        .setRequired(true)
        .addChoices(
          { name: "🤝 Alianza", value: "alliance" },
          { name: "🛠️ Soporte", value: "support" },
          { name: "🎯 Claim", value: "claim" },
          { name: "👥 Staff", value: "staff" }
        )
    ),

  new SlashCommandBuilder()
    .setName("ticket-add")
    .setDescription("Añadir un usuario al ticket.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que quieres añadir.")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("ticket-remove")
    .setDescription("Eliminar un usuario del ticket.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que quieres eliminar.")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("ticket-claim")
    .setDescription("Reclamar el ticket actual."),

  new SlashCommandBuilder()
    .setName("ticket-release")
    .setDescription("Liberar el ticket actual."),

  new SlashCommandBuilder()
    .setName("ticket-close")
    .setDescription("Solicitar el cierre del ticket."),

  new SlashCommandBuilder()
    .setName("ticket-info")
    .setDescription("Ver información del ticket actual."),

  new SlashCommandBuilder()
    .setName("ticket-transcript")
    .setDescription("Generar el transcript del ticket actual."),

  // ═══════════════════════════════════════
  // 👑 POSTULACIONES
  // ═══════════════════════════════════════

  new SlashCommandBuilder()
    .setName("postulacion")
    .setDescription("Iniciar una postulación.")
    .addStringOption(option =>
      option
        .setName("tipo")
        .setDescription("Tipo de postulación.")
        .setRequired(true)
        .addChoices(
          { name: "👮 Staff", value: "staff" },
          { name: "📰 Periodista", value: "journalist" },
          { name: "💰 Economía", value: "economy" }
        )
    ),

  new SlashCommandBuilder()
    .setName("postulacion-info")
    .setDescription("Ver información de tu postulación."),

  new SlashCommandBuilder()
    .setName("postulaciones")
    .setDescription("Ver las postulaciones pendientes."),

  new SlashCommandBuilder()
    .setName("aceptar")
    .setDescription("Aceptar una postulación.")
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("ID de la postulación.")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("rechazar")
    .setDescription("Rechazar una postulación.")
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("ID de la postulación.")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("cancelar-postulacion")
    .setDescription("Cancelar tu postulación."),

  // ═══════════════════════════════════════
  // 🛡️ MODERACIÓN
  // ═══════════════════════════════════════

  new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Advertir a un usuario.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("razon")
        .setDescription("Razón.")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("Ver las advertencias de un usuario.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario.")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Eliminar mensajes.")
    .addIntegerOption(option =>
      option
        .setName("cantidad")
        .setDescription("Cantidad de mensajes.")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),

  new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Aplicar timeout a un usuario.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario.")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("minutos")
        .setDescription("Duración en minutos.")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(40320)
    )
    .addStringOption(option =>
      option
        .setName("razon")
        .setDescription("Razón.")
    ),

  new SlashCommandBuilder()
    .setName("untimeout")
    .setDescription("Quitar timeout a un usuario.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario.")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Expulsar un usuario.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("razon")
        .setDescription("Razón.")
    ),

  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Banear un usuario.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("razon")
        .setDescription("Razón.")
    ),

  new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Quitar el ban de un usuario.")
    .addStringOption(option =>
      option
        .setName("usuario")
        .setDescription("ID del usuario.")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Bloquear el canal actual."),

  new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Desbloquear el canal actual."),

  // ═══════════════════════════════════════
  // ⚙️ CONFIGURACIÓN
  // ═══════════════════════════════════════

  new SlashCommandBuilder()
    .setName("config")
    .setDescription("Ver la configuración del bot."),

  new SlashCommandBuilder()
    .setName("config-tickets")
    .setDescription("Configurar el sistema de tickets."),

  new SlashCommandBuilder()
    .setName("config-postulaciones")
    .setDescription("Configurar postulaciones."),

  new SlashCommandBuilder()
    .setName("config-logs")
    .setDescription("Configurar los logs."),

  new SlashCommandBuilder()
    .setName("config-staff")
    .setDescription("Configurar el Staff."),

  new SlashCommandBuilder()
    .setName("config-roles")
    .setDescription("Ver los roles configurados."),

  new SlashCommandBuilder()
    .setName("config-canales")
    .setDescription("Ver los canales configurados."),

  new SlashCommandBuilder()
    .setName("config-reset")
    .setDescription("Restablecer la configuración."),

  // ═══════════════════════════════════════
  // 📋 LOGS
  // ═══════════════════════════════════════

  new SlashCommandBuilder()
    .setName("logs")
    .setDescription("Ver información de los logs."),

  new SlashCommandBuilder()
    .setName("log-user")
    .setDescription("Consultar logs de un usuario.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario.")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("log-ticket")
    .setDescription("Consultar información de un ticket.")
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("ID del ticket.")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("log-postulacion")
    .setDescription("Consultar una postulación.")
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("ID de la postulación.")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("audit")
    .setDescription("Consultar información de auditoría."),

  // ═══════════════════════════════════════
  // 🤖 BOT
  // ═══════════════════════════════════════

  new SlashCommandBuilder()
    .setName("status")
    .setDescription("Ver el estado del bot."),

  new SlashCommandBuilder()
    .setName("reload")
    .setDescription("Recargar configuración."),

  new SlashCommandBuilder()
    .setName("maintenance")
    .setDescription("Activar o desactivar mantenimiento.")
    .addBooleanOption(option =>
      option
        .setName("estado")
        .setDescription("Estado del mantenimiento.")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Ver estadísticas del bot."),

  new SlashCommandBuilder()
    .setName("restart")
    .setDescription("Reiniciar el proceso del bot."),

  // ═══════════════════════════════════════
  // 🧰 UTILIDAD
  // ═══════════════════════════════════════

  new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Ver el avatar de un usuario.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario.")
    ),

  new SlashCommandBuilder()
    .setName("banner")
    .setDescription("Ver el banner de un usuario.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario.")
    ),

  new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Ver información de un usuario.")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario.")
    ),

  new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Ver información del servidor."),

  new SlashCommandBuilder()
    .setName("servericon")
    .setDescription("Ver el icono del servidor."),

  new SlashCommandBuilder()
    .setName("membercount")
    .setDescription("Ver cantidad de miembros."),

  new SlashCommandBuilder()
    .setName("roles")
    .setDescription("Ver los roles del servidor."),

  new SlashCommandBuilder()
    .setName("roleinfo")
    .setDescription("Ver información de un rol.")
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Rol.")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("canales")
    .setDescription("Ver los canales del servidor."),

  new SlashCommandBuilder()
    .setName("channelinfo")
    .setDescription("Ver información del canal actual."),

  new SlashCommandBuilder()
    .setName("emoji")
    .setDescription("Ver información de un emoji.")
    .addStringOption(option =>
      option
        .setName("emoji")
        .setDescription("Emoji.")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("listemojis")
    .setDescription("Ver los emojis del servidor."),

  new SlashCommandBuilder()
    .setName("permissions")
    .setDescription("Ver tus permisos."),

  new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("Ver información de KING SUPPORT."),

  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Ver la latencia del bot."),

  new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("Ver cuánto lleva conectado el bot."),

  new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Obtener información para invitar al bot."),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Ver la lista de comandos."),

  new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Crear un embed.")
    .addStringOption(option =>
      option
        .setName("titulo")
        .setDescription("Título.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("descripcion")
        .setDescription("Descripción.")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("say")
    .setDescription("Enviar un mensaje.")
    .addStringOption(option =>
      option
        .setName("mensaje")
        .setDescription("Mensaje.")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Crear una encuesta.")
    .addStringOption(option =>
      option
        .setName("pregunta")
        .setDescription("Pregunta.")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("reminder")
    .setDescription("Crear un recordatorio.")
    .addIntegerOption(option =>
      option
        .setName("minutos")
        .setDescription("Minutos.")
        .setRequired(true)
        .setMinValue(1)
    )
    .addStringOption(option =>
      option
        .setName("mensaje")
        .setDescription("Recordatorio.")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("afk")
    .setDescription("Activar tu estado AFK.")
    .addStringOption(option =>
      option
        .setName("razon")
        .setDescription("Razón.")
    ),

  new SlashCommandBuilder()
    .setName("firstmessage")
    .setDescription("Buscar el primer mensaje del canal."),

  new SlashCommandBuilder()
    .setName("timestamp")
    .setDescription("Crear un timestamp.")
    .addIntegerOption(option =>
      option
        .setName("timestamp")
        .setDescription("Timestamp Unix.")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("snowflake")
    .setDescription("Información de un ID de Discord.")
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("ID.")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("color")
    .setDescription("Mostrar un color hexadecimal.")
    .addStringOption(option =>
      option
        .setName("hex")
        .setDescription("Color hexadecimal.")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("choose")
    .setDescription("Elegir entre varias opciones.")
    .addStringOption(option =>
      option
        .setName("opciones")
        .setDescription("Opciones separadas por comas.")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Hacer una pregunta a la bola 8.")
    .addStringOption(option =>
      option
        .setName("pregunta")
        .setDescription("Pregunta.")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("calculate")
    .setDescription("Realizar un cálculo.")
    .addStringOption(option =>
      option
        .setName("operacion")
        .setDescription("Operación matemática.")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("translate")
    .setDescription("Mostrar información sobre traducción.")
    .addStringOption(option =>
      option
        .setName("texto")
        .setDescription("Texto.")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("weather")
    .setDescription("Consultar información del clima.")
    .addStringOption(option =>
      option
        .setName("ciudad")
        .setDescription("Ciudad.")
        .setRequired(true)
    )
];

function getCommandsJSON() {
  return commands.map(command => command.toJSON());
}

function isStaff(interaction) {
  return interaction.member?.roles?.cache?.has(
    config.roles.ticketStaff
  );
}

function isPostulationReviewer(interaction) {
  return interaction.member?.roles?.cache?.has(
    config.roles.postulationReview
  );
}

async function handleCommand(interaction, handlers) {
  const command = interaction.commandName;

  // ═══════════════════════════════════════
  // 🎫 TICKETS
  // ═══════════════════════════════════════

  if (command === "ticket") {
    return handlers.tickets.createTicket(
      interaction,
      interaction.options.getString("tipo")
    );
  }

  if (command === "ticket-add") {
    if (!isStaff(interaction)) {
      return interaction.reply({
        content: "❌ Solo el Staff puede utilizar este comando.",
        ephemeral: true
      });
    }

    const user = interaction.options.getUser("usuario");

    await interaction.channel.permissionOverwrites.edit(
      user.id,
      {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
      }
    );

    return interaction.reply(
      `✅ <@${user.id}> fue añadido al ticket.`
    );
  }

  if (command === "ticket-remove") {
    if (!isStaff(interaction)) {
      return interaction.reply({
        content: "❌ Solo el Staff puede utilizar este comando.",
        ephemeral: true
      });
    }

    const user = interaction.options.getUser("usuario");

    await interaction.channel.permissionOverwrites.delete(
      user.id
    ).catch(() => {});

    return interaction.reply(
      `✅ <@${user.id}> fue eliminado del ticket.`
    );
  }

  if (command === "ticket-claim") {
    return handlers.tickets.handleInteraction({
      ...interaction,
      isButton: () => true,
      customId: "ticket_claim"
    });
  }

  if (command === "ticket-release") {
    return handlers.tickets.handleInteraction({
      ...interaction,
      isButton: () => true,
      customId: "ticket_release"
    });
  }

  if (command === "ticket-close") {
    return handlers.tickets.handleInteraction({
      ...interaction,
      isButton: () => true,
      customId: "ticket_close"
    });
  }

  if (command === "ticket-info") {
    const ticket = handlers.database.getTicket(
      interaction.channel.id
    );

    if (!ticket) {
      return interaction.reply({
        content: "❌ Este canal no es un ticket.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("🎫 Información del ticket")
      .addFields(
        {
          name: "👤 Usuario",
          value: `<@${ticket.userId}>`,
          inline: true
        },
        {
          name: "🎫 Tipo",
          value: ticket.type,
          inline: true
        },
        {
          name: "📊 Estado",
          value: ticket.status,
          inline: true
        },
        {
          name: "🛠️ Staff",
          value: ticket.claimedBy
            ? `<@${ticket.claimedBy}>`
            : "Sin reclamar",
          inline: true
        }
      );

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }

  if (command === "ticket-transcript") {
    if (!isStaff(interaction)) {
      return interaction.reply({
        content: "❌ Solo el Staff puede generar transcripts.",
        ephemeral: true
      });
    }

    await interaction.deferReply({
      ephemeral: true
    });

    const ticket = handlers.database.getTicket(
      interaction.channel.id
    );

    if (!ticket) {
      return interaction.editReply(
        "❌ Este canal no es un ticket."
      );
    }

    const file = await handlers.transcripts.createTranscript(
      interaction.channel,
      ticket
    );

    return interaction.editReply({
      content: "📄 Transcript generado.",
      files: [file]
    });
  }

  // ═══════════════════════════════════════
  // 👑 POSTULACIONES
  // ═══════════════════════════════════════

  if (command === "postulacion") {
    return handlers.postulaciones.startApplication(
      interaction,
      interaction.options.getString("tipo")
    );
  }

  if (command === "postulacion-info") {
    const application =
      handlers.database.findApplicationByUser(
        interaction.user.id
      );

    if (!application) {
      return interaction.reply({
        content: "ℹ️ No tienes ninguna postulación.",
        ephemeral: true
      });
    }

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("📋 Tu postulación")
          .addFields(
            {
              name: "📌 Tipo",
              value: application.type,
              inline: true
            },
            {
              name: "📊 Estado",
              value: application.status,
              inline: true
            }
          )
      ],
      ephemeral: true
    });
  }

  if (command === "postulaciones") {
    if (!isPostulationReviewer(interaction)) {
      return interaction.reply({
        content: "❌ No tienes permiso para ver las postulaciones.",
        ephemeral: true
      });
    }

    const applications =
      handlers.database.getApplications();

    const pending = Object.values(applications)
      .filter(app => app.status === "pending")
      .slice(0, 20);

    if (!pending.length) {
      return interaction.reply({
        content: "📋 No hay postulaciones pendientes.",
        ephemeral: true
      });
    }

    const description = pending
      .map(
        app =>
          `• \`${app.id}\` — <@${app.userId}> — **${app.type}**`
      )
      .join("\n");

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("📋 Postulaciones pendientes")
          .setDescription(description)
      ],
      ephemeral: true
    });
  }

  if (command === "aceptar") {
    if (!isPostulationReviewer(interaction)) {
      return interaction.reply({
        content: "❌ No tienes permiso.",
        ephemeral: true
      });
    }

    return handlers.postulaciones.decideApplication(
      interaction,
      interaction.options.getString("id"),
      true
    );
  }

  if (command === "rechazar") {
    if (!isPostulationReviewer(interaction)) {
      return interaction.reply({
        content: "❌ No tienes permiso.",
        ephemeral: true
      });
    }

    return handlers.postulaciones.decideApplication(
      interaction,
      interaction.options.getString("id"),
      false
    );
  }

  if (command === "cancelar-postulacion") {
    const application =
      handlers.database.findApplicationByUser(
        interaction.user.id
      );

    if (!application) {
      return interaction.reply({
        content: "❌ No tienes una postulación activa.",
        ephemeral: true
      });
    }

    handlers.database.updateApplication(
      application.id,
      {
        status: "cancelled"
      }
    );

    return interaction.reply({
      content: "✅ Tu postulación fue cancelada.",
      ephemeral: true
    });
  }

  // ═══════════════════════════════════════
  // 🛡️ MODERACIÓN
  // ═══════════════════════════════════════

  if (command === "warn") {
    if (!isStaff(interaction)) {
      return interaction.reply({
        content: "❌ Solo el Staff puede usar este comando.",
        ephemeral: true
      });
    }

    const user = interaction.options.getUser("usuario");
    const reason = interaction.options.getString("razon");

    handlers.database.addWarning(
      user.id,
      {
        moderatorId: interaction.user.id,
        reason,
        createdAt: new Date().toISOString()
      }
    );

    await user.send(
      `⚠️ Has recibido una advertencia en **${interaction.guild.name}**.\nRazón: ${reason}`
    ).catch(() => {});

    return interaction.reply(
      `⚠️ <@${user.id}> recibió una advertencia.\n**Razón:** ${reason}`
    );
  }

  if (command === "warnings") {
    const user = interaction.options.getUser("usuario");

    const warnings =
      handlers.database.getWarnings(user.id);

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("⚠️ Advertencias")
          .setDescription(
            warnings.length
              ? warnings
                  .map(
                    (w, i) =>
                      `**${i + 1}.** ${w.reason}\n👮 <@${w.moderatorId}>`
                  )
                  .join("\n\n")
              : "Este usuario no tiene advertencias."
          )
      ],
      ephemeral: true
    });
  }

  if (command === "clear") {
    if (!isStaff(interaction)) {
      return interaction.reply({
        content: "❌ Solo el Staff puede usar este comando.",
        ephemeral: true
      });
    }

    const amount =
      interaction.options.getInteger("cantidad");

    await interaction.channel.bulkDelete(
      amount,
      true
    );

    return interaction.reply({
      content: `🧹 Se eliminaron hasta ${amount} mensajes.`,
      ephemeral: true
    });
  }

  if (command === "timeout") {
    if (!isStaff(interaction)) {
      return interaction.reply({
        content: "❌ Solo el Staff puede usar este comando.",
        ephemeral: true
      });
    }

    const user = interaction.options.getMember("usuario");
    const minutes =
      interaction.options.getInteger("minutos");

    const reason =
      interaction.options.getString("razon") ||
      "Sin razón especificada";

    await user.timeout(
      minutes * 60 * 1000,
      reason
    );

    return interaction.reply(
      `🔇 <@${user.id}> recibió timeout durante **${minutes} minutos**.`
    );
  }

  if (command === "untimeout") {
    if (!isStaff(interaction)) {
      return interaction.reply({
        content: "❌ Solo el Staff puede usar este comando.",
        ephemeral: true
      });
    }

    const user =
      interaction.options.getMember("usuario");

    await user.timeout(null);

    return interaction.reply(
      `🔊 Se quitó el timeout a <@${user.id}>.`
    );
  }

  if (command === "kick") {
    if (!isStaff(interaction)) {
      return interaction.reply({
        content: "❌ Solo el Staff puede usar este comando.",
        ephemeral: true
      });
    }

    const user =
      interaction.options.getMember("usuario");

    const reason =
      interaction.options.getString("razon") ||
      "Sin razón especificada";

    await user.kick(reason);

    return interaction.reply(
      `👢 <@${user.id}> fue expulsado.`
    );
  }

  if (command === "ban") {
    if (!isStaff(interaction)) {
      return interaction.reply({
        content: "❌ Solo el Staff puede usar este comando.",
        ephemeral: true
      });
    }

    const user =
      interaction.options.getMember("usuario");

    const reason =
      interaction.options.getString("razon") ||
      "Sin razón especificada";

    await user.ban({
      reason
    });

    return interaction.reply(
      `🔨 <@${user.id}> fue baneado.`
    );
  }

  if (command === "unban") {
    if (!isStaff(interaction)) {
      return interaction.reply({
        content: "❌ Solo el Staff puede usar este comando.",
        ephemeral: true
      });
    }

    const userId =
      interaction.options.getString("usuario");

    await interaction.guild.members.unban(
      userId
    );

    return interaction.reply(
      `✅ Se quitó el ban a \`${userId}\`.`
    );
  }

  if (command === "lock" || command === "unlock") {
    if (!isStaff(interaction)) {
      return interaction.reply({
        content: "❌ Solo el Staff puede usar este comando.",
        ephemeral: true
      });
    }

    const locked = command === "lock";

    await interaction.channel.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      {
        SendMessages: !locked
      }
    );

    return interaction.reply(
      locked
        ? "🔒 Canal bloqueado."
        : "🔓 Canal desbloqueado."
    );
  }

  // ═══════════════════════════════════════
  // 🧰 UTILIDAD
  // ═══════════════════════════════════════

  if (command === "ping") {
    return interaction.reply(
      `🏓 Pong: **${interaction.client.ws.ping}ms**`
    );
  }

  if (command === "uptime") {
    const seconds =
      Math.floor(interaction.client.uptime / 1000);

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor(
      (seconds % 86400) / 3600
    );
    const minutes = Math.floor(
      (seconds % 3600) / 60
    );

    return interaction.reply(
      `⏱️ Uptime: **${days}d ${hours}h ${minutes}m**`
    );
  }

  if (command === "avatar") {
    const user =
      interaction.options.getUser("usuario") ||
      interaction.user;

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`🖼️ Avatar de ${user.username}`)
          .setImage(
            user.displayAvatarURL({
              size: 1024,
              extension: "png"
            })
          )
      ]
    });
  }

  if (command === "userinfo") {
    const user =
      interaction.options.getUser("usuario") ||
      interaction.user;

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("👤 Información del usuario")
          .addFields(
            {
              name: "Usuario",
              value: `<@${user.id}>`
            },
            {
              name: "ID",
              value: user.id
            },
            {
              name: "Cuenta creada",
              value: `<t:${Math.floor(
                user.createdTimestamp / 1000
              )}:F>`
            }
          )
      ]
    });
  }

  if (command === "serverinfo") {
    const guild = interaction.guild;

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`🏰 ${guild.name}`)
          .addFields(
            {
              name: "👥 Miembros",
              value: `${guild.memberCount}`,
              inline: true
            },
            {
              name: "💬 Canales",
              value: `${guild.channels.cache.size}`,
              inline: true
            },
            {
              name: "🎭 Roles",
              value: `${guild.roles.cache.size}`,
              inline: true
            }
          )
      ]
    });
  }

  if (command === "membercount") {
    return interaction.reply(
      `👥 El servidor tiene **${interaction.guild.memberCount} miembros**.`
    );
  }

  if (command === "permissions") {
    return interaction.reply({
      content:
        `🛡️ Tus permisos principales:\n\`${interaction.member.permissions.toArray().join(", ")}\``,
      ephemeral: true
    });
  }

  if (command === "botinfo") {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🤖 KING SUPPORT")
          .setDescription(
            "Bot de soporte para **King the Land**."
          )
          .addFields(
            {
              name: "📡 Ping",
              value: `${interaction.client.ws.ping}ms`,
              inline: true
            },
            {
              name: "🛠️ Discord.js",
              value: "v14",
              inline: true
            }
          )
      ]
    });
  }

  if (command === "status") {
    return interaction.reply(
      `🟢 **KING SUPPORT está operativo.**\n🏓 Ping: ${interaction.client.ws.ping}ms`
    );
  }

  if (command === "help") {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("📚 KING SUPPORT — Ayuda")
          .setDescription(
            [
              "🎫 **Tickets**",
              "`/ticket` `/ticket-info` `/ticket-close`",
              "",
              "👑 **Postulaciones**",
              "`/postulacion` `/postulacion-info`",
              "",
              "🛡️ **Moderación**",
              "`/warn` `/warnings` `/clear` `/timeout`",
              "",
              "🧰 **Utilidad**",
              "`/avatar` `/userinfo` `/serverinfo` `/ping` `/uptime`"
            ].join("\n")
          )
      ]
    });
  }

  return interaction.reply({
    content:
      "ℹ️ Este comando está registrado y será conectado con su módulo correspondiente.",
    ephemeral: true
  });
}

module.exports = {
  commands,
  getCommandsJSON,
  handleCommand,
  isStaff,
  isPostulationReviewer
};
