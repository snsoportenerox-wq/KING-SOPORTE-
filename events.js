module.exports = {
  async onReady(client) {
    console.log(`✅ KING SUPPORT conectado como ${client.user.tag}`);
  },

  async onInteraction(interaction, handlers) {
    try {
      if (
        interaction.isChatInputCommand() ||
        interaction.isButton() ||
        interaction.isStringSelectMenu() ||
        interaction.isModalSubmit()
      ) {
        await handlers.handleInteraction(interaction);
      }
    } catch (error) {
      console.error("❌ Error en interacción:", error);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "❌ Ocurrió un error al procesar esta acción.",
          ephemeral: true
        }).catch(() => {});
      }
    }
  },

  async onMessage(message, handlers) {
    try {
      if (message.author.bot) return;

      // Mensaje recibido por MD
      if (!message.guild) {
        await handlers.handleDirectMessage(message);
        return;
      }

      // Mensaje recibido dentro del servidor
      await handlers.handleGuildMessage(message);

    } catch (error) {
      console.error("❌ Error procesando mensaje:", error);
    }
  }
};
