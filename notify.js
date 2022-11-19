import { Telegraf } from "telegraf";
import * as dotenv from "dotenv";
dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

export default async function sendMessage(chat_id, message) {
  await bot.telegram.sendMessage(chat_id, message, {
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
  console.log("\x1b[36m%s\x1b[0m", "message sent");
}
