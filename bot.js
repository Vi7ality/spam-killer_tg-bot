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

const userAttempts = {};

bot.on("voice", (ctx) => {
  const userId = ctx.message.from.id;

  ctx.deleteMessage();

  // Проверяем, сколько раз пользователь отправлял голосовые сообщения
  if (userAttempts[userId]) {
    userAttempts[userId]++;
  } else {
    userAttempts[userId] = 1;
  }

  // Если пользователь отправил голосовое сообщение 2-й раз
  if (userAttempts[userId] === 2) {
    ctx.reply("Вы снова отправили голосовое сообщение. Пожалуйста, следуйте правилам!");
  } else {
    ctx.reply("Голосовые сообщения запрещены в этой группе. Пожалуйста, отправьте текст.");
  }

  // Сбросим попытки после 2-х повторений
  setTimeout(() => {
    userAttempts[userId] = 0;
  }, 60000); // Через 1 минуту можно будет отправить голосовое сообщение без ограничений
});

bot.on("new_chat_members", (ctx) => {
  ctx.reply("Добро пожаловать в группу! Пожалуйста, соблюдайте правила.");
});

bot.launch().then(() => console.log("Bot is running"));
