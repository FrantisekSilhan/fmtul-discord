import * as Dysnomia from "@projectdysnomia/dysnomia";
import shared from "./shared";

const bot = new Dysnomia.Client(process.env.TOKEN!, {
  restMode: true,
  gateway: {
    intents: [
      "all",
    ]
  }
});

const storage = {
  RR_MESSAGE_ID: "",
};

bot.on("ready", async () => {
  console.log(`Logged in as ${bot.user?.username}!`);

  await bot.bulkEditGuildCommands(shared.GUILD_ID, [
    {
      name: "ping",
      description: "Check latency",
      type: Dysnomia.Constants.ApplicationCommandTypes.CHAT_INPUT,
    },
  ]);
  console.log("Slash command registered ✅");

  const channel = bot.getChannel(shared.ROLE_CHANNEL_ID);
  if (!channel || channel.type !== Dysnomia.Constants.ChannelTypes.GUILD_TEXT)
    return;

  const messages = await bot.getMessages(shared.ROLE_CHANNEL_ID, { limit: 50 });

  const existing = messages.find(
    (m) =>
      m.author.id === bot.user.id &&
      m.embeds[0]?.title === "Vyber si roli oboru. :)"
  );

  if (!existing) {
    const sent = await bot.createMessage(shared.ROLE_CHANNEL_ID, {
      embeds: [
        {
          title: "Vyber si roli oboru. :)",
          fields: Object.entries(shared.ROLE_MAP).map(
            ([emoji, roleId]) => ({
              name: "",
              value: `${emoji} - <@&${roleId}>`,
            })
          ),
          color: 0xEA7603,
        }
      ],
    });
    storage.RR_MESSAGE_ID = sent.id;

    for (const emoji of Object.keys(shared.ROLE_MAP)) {
      await bot.addMessageReaction(sent.channel.id, sent.id, emoji);
    }

    console.log("Role message sent ✅");
  } else {
    storage.RR_MESSAGE_ID = existing.id;
  }
  console.log("Ready event finished ✅");
});

bot.on("messageReactionAdd", async (msg, emoji, user) => {
  if (msg.id !== storage.RR_MESSAGE_ID) return;
  if (user.id === bot.user?.id) return;

  const guildId = msg.guildID!;
  const roleId = shared.ROLE_MAP[emoji.name];
  if (!roleId) {
    bot.removeMessageReaction(msg.channel.id, msg.id, emoji.name, user.id).catch(() => {});
    return;
  }

  try {
    const guild = bot.guilds.get(guildId);
    const member = guild?.members.get(user.id) ?? await bot.getRESTGuildMember(guildId, user.id);

    const removeReactions = Object.keys(shared.ROLE_MAP)
      .filter((e) => e !== emoji.name)
      .map((e) => 
        bot.removeMessageReaction(msg.channel.id, msg.id, e, user.id).catch(() => {})
      );

    const removeRoles = Object.entries(shared.ROLE_MAP)
      .filter(([_, id]) => id !== roleId && member.roles.includes(id))
      .map(([_, id]) => 
        bot.removeGuildMemberRole(guildId, user.id, id).catch(() => {})
      );
      
    if (!member.roles.includes(roleId)) {
      bot.addGuildMemberRole(guildId, user.id, roleId, "Reaction role add")
    }
    await Promise.all(removeReactions.concat(removeRoles));
  } catch (err) {
    console.error("Failed to handle reaction add:", err);
  }
});

bot.on("messageReactionRemove", async (msg, emoji, userId) => {
  if (msg.id !== storage.RR_MESSAGE_ID) return;
  if (userId === bot.user?.id) return;

  const guildId = msg.guildID!;
  const roleId = shared.ROLE_MAP[emoji.name];
  if (!roleId) return;

  try {
    await bot.removeGuildMemberRole(guildId, userId, roleId, "Reaction role remove");
    console.log(`Removed role ${roleId} from user ${userId}`);
  } catch (err) {
    console.error("Failed to handle reaction remove:", err);
  }
});

bot.on("interactionCreate", async (interaction) => {
  if (interaction.type === Dysnomia.Constants.InteractionTypes.APPLICATION_COMMAND) {
    switch (interaction.data.name) {
      case "ping": {
        const start = Date.now();

        const wsLatency = bot.shards.get(0)?.latency ?? 0;

        const initial = await interaction.createMessage(
          `Pong! WS: ${wsLatency}ms | RT: calculating...`,
        );

        const roundTrip = Date.now() - start;

        await interaction.editMessage(
          initial.id,
          `Pong! WS: ${wsLatency}ms | RT: ${roundTrip}ms`,
        );
        break;
      }
    }
  }
});

bot.connect();