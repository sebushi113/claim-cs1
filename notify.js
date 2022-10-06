import { Telegraf } from "telegraf";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const chat_id = process.env.chat_id;
const chat_id2 = process.env.chat_id2;
// const message = "error: *claim experienced an error*";
// const error = "error";

// let date = "2022\\-10\\-06 13:13";
// let account = "cryptosebus1";
// let action = "claim";
// // let tx = "66f21ad13d3fc13518bd2fcbc05ec34fd89d4d2ffdd66b9f9d5b0f0c0a9a634c";
// let tx = transaction.id;

// let tx_message = `
// ${date}
// ${account}
// ${action}
// [view transaction](https://wax.bloks.io/transaction/${tx})
// `;
// let tx_message = `
// 2022 10 06 19:24:20

// from: s rplanet
// to: cryptosebus1
// action: transfer
// quantity: 106 3361 AETHER`;

export async function sendMessage(chat_id, error) {
  await bot.telegram.sendMessage(chat_id, error, {
    parse_mode: "MarkdownV2",
    disable_web_page_preview: true,
  });
}

// sendMessage(chat_id2, tx_message);
// console.log(sendMessage());

// Enable graceful stop
// process.once("SIGINT", () => bot.stop("SIGINT"));
// process.once("SIGTERM", () => bot.stop("SIGTERM"));

// exports.send = send;
// module.exports = { send };
// export function sendMessage()
// export function send()
