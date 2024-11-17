const { Telegraf } = require("telegraf");
require("dotenv").config();
const { APP_TOKEN } = process.env;
const bot = new Telegraf(APP_TOKEN);

const bannedWords = ["спам", "реклама", "запрещённое_слово", "spam", "follow link"];

bot.on("text", (ctx) => {
  const messageText = ctx.message.text.toLowerCase();
  if (bannedWords.some((word) => messageText.includes(word))) {
    ctx.deleteMessage();
    ctx.reply(
      `@${ctx.message.from.username}, вашe сообщение нарушает правила группы. В этой группе запрещен спам.`
    );
  }
});

bot.on("new_chat_members", (ctx) => {
  ctx.reply("Добро пожаловать в группу! Пожалуйста, соблюдайте правила.");
});

bot.launch().then(() => console.log("Бот запущен и фильтрует спам!"));
