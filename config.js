module.exports = {
  guildId: process.env.GUILD_ID,

  channels: {
    ticketPanel: "1538681130293923896",
    postulationPanel: "1538681130293923897",
    ticketReviews: "1538681130293923898",
    logs: "1538681131543695403"
  },

  roles: {
    ticketStaff: "1541517711970934884",
    postulationReview: "1538681128360214546"
  },

  tickets: {
    types: {
      alliance: "Alianza",
      support: "Soporte",
      claim: "Claim",
      staff: "Staff"
    },

    rating: {
      min: 1,
      max: 5
    }
  },

  applications: {
    types: {
      staff: "Staff",
      journalist: "Periodista",
      economy: "Economía"
    },

    channels: {
      staff: "👮・formularios-staff",
      journalist: "📰・formularios-periodista",
      economy: "💰・formularios-economia"
    },

    autoCreateChannels: true,
    minimumQuestions: 17
  },

  bot: {
    name: "KING SUPPORT",
    language: "es",
    timezone: "America/Bogota"
  }
};
