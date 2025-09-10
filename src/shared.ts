const shared: {
  GUILD_ID: string;
  ROLE_MAP: {
    [key: string]: string;
    "🔧": string;
    "💻": string;
    "🫃": string;
    "⚛️": string;
  };
  ROLE_CHANNEL_ID: string;
} = {
  GUILD_ID: process.env.GUILD_ID!,
  ROLE_MAP: {
    "🔧": "1415342093202624572",
    "💻": "1415342098613272626",
    "🫃": "1415342099947061278",
    "⚛️": "1415342104506269726",
  },
  ROLE_CHANNEL_ID: "1415335304713474079",
};

export default shared;