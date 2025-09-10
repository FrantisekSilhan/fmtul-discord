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
    "🔧": "1415389100726554725",
    "💻": "1415389111941988362",
    "🫃": "1415389114194464930",
    "⚛️": "1415389116182564875",
  },
  ROLE_CHANNEL_ID: "1415390054267748516",
};

export default shared;