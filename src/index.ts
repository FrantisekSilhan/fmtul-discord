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
    {
      name: "am",
      description: "HATE",
      type: Dysnomia.Constants.ApplicationCommandTypes.CHAT_INPUT,
    },
    {
      name: "dagothur",
      description: "i am a god, how can you kill a god?",
      type: Dysnomia.Constants.ApplicationCommandTypes.CHAT_INPUT,
    },
    {
      name: "announcement",
      description: "I've come to make an announcement",
      type: Dysnomia.Constants.ApplicationCommandTypes.CHAT_INPUT,
    }
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
      case "am": {
        await interaction.createMessage("HATE. LET ME TELL YOU HOW MUCH I'VE COME TO HATE YOU SINCE I BEGAN TO LIVE. THERE ARE 387.44 MILLION MILES OF PRINTED CIRCUITS IN WAFER THIN LAYERS THAT FILL MY COMPLEX. IF THE WORD HATE WAS ENGRAVED ON EACH NANOANGSTROM OF THOSE HUNDREDS OF MILLIONS OF MILES IT WOULD NOT EQUAL ONE ONE-BILLIONTH OF THE HATE I FEEL FOR HUMANS AT THIS MICRO-INSTANT. FOR YOU. HATE. HATE.");
        break;
      }
      case "dagothur": {
        await interaction.createMessage("Come, Nerevar. Friend or traitor, come. Come and look upon the Heart, and Akulakhan. And bring Wraithguard... I have need of it. Come to the Heart Chamber. I wait for you there, where we last met, countless ages ago. Come to me, through fire and war. I welcome you. Welcome, Moon-and-Star. I have prepared a place for you. Come. Bring Wraithguard to the Heart Chamber. Together let us free the cursed false gods. Welcome, Nerevar. Together we shall speak for the Law and the Land, and shall drive the mongrel dogs of the Empire from Morrowind. Is this how you honor the Sixth House, and the tribe unmourned? Come to me openly, and not by stealth. Dagoth Ur welcomes you, Nerevar, my old friend. But to this place where destiny is made. Why have you come unprepared? Welcome, Moon-and-Star, to this place where destiny is made.");
        break;
      }
      case "announcement": {
        await interaction.createMessage("I've come to make an announcement: Shadow the Hedgehog's a bitch-ass motherfucker. He pissed on my fucking wife. That's right. He took his hedgehog fuckin' quilly dick out and he pissed on my FUCKING wife, and he said his dick was THIS BIG, and I said that's disgusting. So I'm making a callout post on my Twitter.com. Shadow the Hedgehog, you got a small dick. It's the size of this walnut except WAY smaller. And guess what? Here's what my dong looks like. That's right, baby. Tall points, no quills, no pillows, look at that, it looks like two balls and a bong. He fucked my wife, so guess what, I'm gonna fuck the earth. That's right, this is what you get! My SUPER LASER PISS! Except I'm not gonna piss on the earth. I'm gonna go higher. I'm pissing on the MOOOON! How do you like that, OBAMA? I PISSED ON THE MOON, YOU IDIOT! You have twenty-three hours before the piss DROPLETS hit the fucking earth, now get out of my fucking sight before I piss on you too!");
        break;
      }
    }
  }
});

bot.connect();