const { Telegraf } = require("telegraf");
const path = require("path");
require("dotenv").config();

const { APP_TOKEN, ADMIN_ID } = process.env;
const bot = new Telegraf(APP_TOKEN);

const bannedWords = ["спам", "реклама", "запрещённое_слово", "spam", "follow link"];
const admins = ADMIN_ID;

bot.command("add_banned_word", (ctx) => {
  const userId = ctx.message.from.id;

  if (!admins.includes(userId)) {
    ctx.reply("У вас нет прав на добавление запрещённых слов.");
    return;
  }

  const word = ctx.message.text.split(" ")[1];
  if (word) {
    bannedWords.push(word.toLowerCase());
    ctx.reply(`Слово "${word}" добавлено в список запрещённых.`);
  } else {
    ctx.reply("Пожалуйста, укажите слово для добавления.");
  }
});

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
    // ctx.reply(
    //   `@${ctx.message.from.username}, вы снова отправили голосовое сообщение. Пожалуйста, следуйте правилам!`
    // );
    const imagePath = path.join(__dirname, "./images/memes/voice-msg_bart-meme.jpg");
    ctx.replyWithPhoto(
      { source: imagePath },
      { caption: `@${ctx.message.from.username}, не, не прокатит. Голосовые сообщения запрещены` }
    );
  } else {
    // ctx.reply(
    //   `@${ctx.message.from.username}, голосовые сообщения запрещены в этой группе. Пожалуйста, отправьте текст.`
    // );
    const imagePath = path.join(__dirname, "./images/memes/voice-msg_picket.jpg");
    ctx.replyWithPhoto(
      { source: imagePath },
      { caption: `@${ctx.message.from.username}, голосовые сообщения запрещены` }
    );
  }

  // Сбросим попытки после 2-х повторений
  setTimeout(() => {
    userAttempts[userId] = 0;
  }, 60000); // Через 1 минуту можно будет отправить голосовое сообщение без ограничений
});

// Функция для обработки сообщений
bot.on("text", (ctx) => {
  const message = ctx.message.text.toLowerCase();

  // Проверяем, содержит ли сообщение запрещённые слова
  bannedWords.forEach((word) => {
    if (message.includes(word)) {
      ctx.deleteMessage(); // Удаляем сообщение
      ctx.reply("Это сообщение содержит запрещённые слова!");
      return;
    }
  });
});

bot.on("new_chat_members", (ctx) => {
  ctx.reply("Добро пожаловать в группу! Пожалуйста, соблюдайте правила.");
});

bot.launch().then(() => console.log("Bot is running"));
