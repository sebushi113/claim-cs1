import { Api, JsonRpc } from "eosjs";
import { JsSignatureProvider } from "eosjs/dist/eosjs-jssig.js"; // development only
// import { JsSignatureProvider } from "eosjs/dist/eosjs-jssig";
import fetch from "node-fetch";
import * as cron from "node-cron";
import moment from "moment";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import * as notify from "./notify.js";
import * as http from "http";
import express from "express";

const privateKeys = [process.env.cs1c, process.env.cd3c];

const signatureProvider = new JsSignatureProvider(privateKeys);
// let rpc = new JsonRpc("https://wax.greymass.com", { fetch });
// let rpc = new JsonRpc("https://wax.eosusa.news/", { fetch }); //https://wax.eosio.online/endpoints
let rpc = new JsonRpc("http://wax.api.eosnation.io/", { fetch });
// let rpc = new JsonRpc("https://wax.greymass.com"); //required to read blockchain state
let api = new Api({ rpc, signatureProvider }); //required to submit transactions

const cs1 = process.env.cs1;
const cs1_perm = process.env.cs1perm;
const cd3 = process.env.cd3;
const cd3_perm = process.env.cd3perm;

// var rex = new RegExp("\\\\");
// var rex = new RegExp("\\)$|^(\\");
// var rex = /\\/;
const date = "YYYY-MM-DD HH:mm:ss";
// const telegram_date = `YYYY\\\\-MM\\-DD HH:mm:ss`;
// const telegram_date = String.raw`YYYY\\\\\\-MM\\-DD HH:mm:ss`;
// const telegram_date = "YYYY" + rex + "-MM" + rex + "-DD HH:mm:ss";
const telegram_date = "YYYY MM DD HH:mm:ss";
// const year = "YYYY";
// const month = "MM";
// const day = "DD";
// const hour = "HH";
// const minute = "mm";
// const second = "ss";

// let tx_message = `
// ${moment(new Date()).format(
//   year +
//     "\\-" +
//     month +
//     "\\-" +
//     day +
//     " " +
//     hour +
//     "\\-" +
//     minute +
//     "\\-" +
//     second
// )}`;

// console.log(tx_message);

const chat_id = process.env.chat_id;
const chat_id2 = process.env.chat_id2;

// let date = "2022\\-10\\-06 13:13";
// let account = "cryptosebus1";
// let action = "claim";
// // let tx = "66f21ad13d3fc13518bd2fcbc05ec34fd89d4d2ffdd66b9f9d5b0f0c0a9a634c";
// let tx = transaction.id;

// let tx_message = `;
// ${date}
// ${account}
// ${action}
// [view transaction](https://wax.bloks.io/transaction/${tx})
// `;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function cs1_claim_rplanet() {
  // while (true) {
  try {
    const transaction = await api.transact(
      {
        actions: [
          {
            account: "s.rplanet",
            name: "claim",
            authorization: [{ actor: cs1, permission: cs1_perm }],
            data: {
              to: cs1,
            },
          },
        ],
      },
      { useLastIrreversible: true, expireSeconds: 500 }
    );
    // console.log(
    //   `  🦁   | ${moment(new Date()).format(date)} | ${
    //     transaction.transaction_id
    //   }`
    // );
    // console.log("🦁 " + transaction.transaction_id);
    // console.log(tx);

    let tx = transaction.transaction_id;
    console.log("tx");
    console.log(tx);

    let processed = transaction.processed;
    // console.log("processed");
    // console.log(processed);
    let action_traces = transaction.processed.action_traces;
    // console.log("action_traces");
    // console.log(action_traces);
    let action_traces0 = transaction.processed.action_traces[0];
    // console.log("action_traces0");
    // console.log(action_traces0);

    let account_ram_deltas =
      transaction.processed.action_traces[0].account_ram_deltas[0];
    // console.log("account_ram_deltas");
    // console.log(account_ram_deltas);
    let account_ram_deltas0 =
      transaction.processed.action_traces[0].account_ram_deltas[0];
    // console.log("account_ram_deltas0");
    // console.log(account_ram_deltas0);

    let inline_traces = transaction.processed.action_traces[0].inline_traces[0];
    // console.log("inline_traces");
    // console.log(inline_traces);
    let inline_traces0 =
      transaction.processed.action_traces[0].inline_traces[0];
    // console.log("inline_traces0");
    // console.log(inline_traces0);

    let data = transaction.processed.action_traces[0].inline_traces[0].act.data;
    // console.log("data");
    // console.log(data);
    let data0 =
      transaction.processed.action_traces[0].inline_traces[0].act.data[0];
    // console.log("data0");
    // console.log(data0);

    let from =
      transaction.processed.action_traces[0].inline_traces[0].act.data.from;
    // console.log("from");
    // console.log(from);
    let to =
      transaction.processed.action_traces[0].inline_traces[0].act.data.to;
    // console.log("to");
    // console.log(to);
    let action =
      transaction.processed.action_traces[0].inline_traces[0].act.name;
    // console.log("action");
    // console.log(action);
    let quantity =
      transaction.processed.action_traces[0].inline_traces[0].act.data.quantity;
    // console.log("quantity");
    // console.log(quantity);
    // let tx = "66f21ad13d3fc13518bd2fcbc05ec34fd89d4d2ffdd66b9f9d5b0f0c0a9a634c";
    // let tx = transaction.id;

    // from: ${from}
    // quantity: ${quantity}

    let tx_message = `
    ${moment(new Date()).format(telegram_date)} 

    action: claim
    from: s\.rplanet
    to: ${to}

    [view transaction](https://wax.bloks.io/transaction/${tx})`;

    // console.log("tx_message");
    // console.log(tx_message);

    console.log("🦁 " + tx);
    notify.sendMessage(chat_id2, tx_message);

    // return tx;
    await sleep(5000);
    await cs1_claim_rplanet();
  } catch (error) {
    if (error.message == "assertion failure with message: E_NOTHING_TO_CLAIM") {
      console.log(" 🦁✅  | nothing to claim, waiting...");
    } else if (
      error.message ==
      "estimated CPU time (0 us) is not less than the maximum billable CPU time for the transaction (0 us)"
    ) {
      console.log(`  🦁   | ${moment(new Date()).format(date)} | api error`);
      await api_error();
      await sleep(3000);
      await cs1_claim_rplanet();
    } else {
      console.log(
        `  🦁   | ${moment(new Date()).format(date)} | unknown error`
      );
      console.log(error);
      await unknown_error();
      await sleep(5000);
      await cs1_claim_rplanet();
    }
  }
  // }
}

async function cd3_claim_rplanet() {
  try {
    const transaction = await api.transact(
      {
        actions: [
          {
            account: "s.rplanet",
            name: "claim",
            authorization: [{ actor: cd3, permission: cd3_perm }],
            data: {
              to: cd3,
            },
          },
        ],
      },
      { useLastIrreversible: true, expireSeconds: 300 }
    );
    // console.log(
    //   `  🐵   | ${moment(new Date()).format(date)} | ${
    //     transaction.transaction_id
    //   }`
    // );
    let tx = transaction.transaction_id;
    console.log("tx");
    console.log(tx);

    let processed = transaction.processed;
    // console.log("processed");
    // console.log(processed);
    let action_traces = transaction.processed.action_traces;
    // console.log("action_traces");
    // console.log(action_traces);
    let action_traces0 = transaction.processed.action_traces[0];
    // console.log("action_traces0");
    // console.log(action_traces0);

    let account_ram_deltas =
      transaction.processed.action_traces[0].account_ram_deltas[0];
    // console.log("account_ram_deltas");
    // console.log(account_ram_deltas);
    let account_ram_deltas0 =
      transaction.processed.action_traces[0].account_ram_deltas[0];
    // console.log("account_ram_deltas0");
    // console.log(account_ram_deltas0);

    let inline_traces = transaction.processed.action_traces[0].inline_traces[0];
    // console.log("inline_traces");
    // console.log(inline_traces);
    let inline_traces0 =
      transaction.processed.action_traces[0].inline_traces[0];
    // console.log("inline_traces0");
    // console.log(inline_traces0);

    let data = transaction.processed.action_traces[0].inline_traces[0].act.data;
    // console.log("data");
    // console.log(data);
    let data0 =
      transaction.processed.action_traces[0].inline_traces[0].act.data[0];
    // console.log("data0");
    // console.log(data0);

    let from =
      transaction.processed.action_traces[0].inline_traces[0].act.data.from;
    // console.log("from");
    // console.log(from);
    let to =
      transaction.processed.action_traces[0].inline_traces[0].act.data.to;
    // console.log("to");
    // console.log(to);
    let action =
      transaction.processed.action_traces[0].inline_traces[0].act.name;
    // console.log("action");
    // console.log(action);
    let quantity =
      transaction.processed.action_traces[0].inline_traces[0].act.data.quantity;
    // console.log("quantity");
    // console.log(quantity);
    // let tx = "66f21ad13d3fc13518bd2fcbc05ec34fd89d4d2ffdd66b9f9d5b0f0c0a9a634c";
    // let tx = transaction.id;

    // from: ${from}
    // quantity: ${quantity}

    let tx_message = `
    ${moment(new Date()).format(telegram_date)} 

    action: claim
    from: s\.rplanet
    to: ${to}

    [view transaction](https://wax.bloks.io/transaction/${tx})`;

    // console.log("tx_message");
    // console.log(tx_message);

    console.log("🦁 " + tx);
    notify.sendMessage(chat_id2, tx_message);

    await sleep(5000);
    await cd3_claim_rplanet();
  } catch (error) {
    if (error.message == "assertion failure with message: E_NOTHING_TO_CLAIM") {
      console.log(" 🐵✅  | nothing to claim, waiting...");
    } else if (
      error.message ==
      "estimated CPU time (0 us) is not less than the maximum billable CPU time for the transaction (0 us)"
    ) {
      console.log(`  🐵   | ${moment(new Date()).format(date)} | api error`);
      await api_error();
      await sleep(5000);
      await cd3_claim_rplanet();
    } else {
      console.log(
        `  🐵   | ${moment(new Date()).format(date)} | unknown error`
      );
      await unknown_error();
      await sleep(5000);
      await cd3_claim_rplanet();
    }
  }
  // }
}

async function all_claim_greenrabbit() {
  // while (true) {
  try {
    const transaction = await api.transact(
      {
        actions: [
          {
            account: "staking.gr",
            name: "claim",
            authorization: [{ actor: cs1, permission: cs1_perm }],
            data: {
              user: cs1,
            },
          },
          {
            account: "driveless.gr",
            name: "claim",
            authorization: [{ actor: cs1, permission: cs1_perm }],
            data: {
              user: cs1,
              collection: "greenrabbit",
            },
          },
          {
            account: "staking.gr",
            name: "claim",
            authorization: [{ actor: cd3, permission: cd3_perm }],
            data: {
              user: cd3,
              collection: "greenrabbit",
            },
          },
        ],
      },
      // { blocksBehind: 3, expireSeconds: 30 }
      { useLastIrreversible: true, expireSeconds: 300 }
    );
    // console.log(
    //   ` 🦁🐵  | ${moment(new Date()).format(date)} | ${
    //     transaction.transaction_id
    //   }`
    // );

    let tx = transaction.transaction_id;
    console.log("🦁🐵 " + tx);
    console.log("tx");
    console.log(tx);

    let processed = transaction.processed;
    // console.log("processed");
    // console.log(processed);
    let action_traces = transaction.processed.action_traces;
    // console.log("action_traces");
    // console.log(action_traces);
    let action_traces0 = transaction.processed.action_traces[0];
    // console.log("action_traces0");
    // console.log(action_traces0);

    let account_ram_deltas =
      transaction.processed.action_traces[0].account_ram_deltas[0];
    // console.log("account_ram_deltas");
    // console.log(account_ram_deltas);
    let account_ram_deltas0 =
      transaction.processed.action_traces[0].account_ram_deltas[0];
    // console.log("account_ram_deltas0");
    // console.log(account_ram_deltas0);

    let inline_traces = transaction.processed.action_traces[0].inline_traces[0];
    // console.log("inline_traces");
    // console.log(inline_traces);
    let inline_traces0 =
      transaction.processed.action_traces[0].inline_traces[0];
    // console.log("inline_traces0");
    // console.log(inline_traces0);

    let data = transaction.processed.action_traces[0].inline_traces[0].act.data;
    // console.log("data");
    // console.log(data);
    let data0 =
      transaction.processed.action_traces[0].inline_traces[0].act.data[0];
    // console.log("data0");
    // console.log(data0);

    let from =
      transaction.processed.action_traces[0].inline_traces[0].act.data.from;
    // console.log("from");
    // console.log(from);
    let to =
      transaction.processed.action_traces[0].inline_traces[0].act.data.to;
    // console.log("to");
    // console.log(to);
    let action =
      transaction.processed.action_traces[0].inline_traces[0].act.name;
    // console.log("action");
    // console.log(action);
    let quantity =
      transaction.processed.action_traces[0].inline_traces[0].act.data.quantity;
    // console.log("quantity");
    // console.log(quantity);
    // let tx = "66f21ad13d3fc13518bd2fcbc05ec34fd89d4d2ffdd66b9f9d5b0f0c0a9a634c";
    // let tx = transaction.id;

    // from: ${from}
    // quantity: ${quantity}

    let tx_message = `
    ${moment(new Date()).format(telegram_date)} 

    action: claim
    from: green rabbit

    [view transaction](https://wax.bloks.io/transaction/${tx})`;

    // console.log("tx_message");
    // console.log(tx_message);

    console.log("🦁 " + tx);
    notify.sendMessage(chat_id2, tx_message);

    notify.sendMessage(chat_id2, tx);
    await sleep(10000);
    await all_claim_greenrabbit();
  } catch (error) {
    if (
      error.message ==
      "assertion failure with message: nothing to claim just yet"
    ) {
      console.log(" ✅✅  | nothing to claim, waiting...");
    } else if (
      error.message ==
      "estimated CPU time (0 us) is not less than the maximum billable CPU time for the transaction (0 us)"
    ) {
      console.log(` 🦁🐵  | ${moment(new Date()).format(date)} | api error`);
      await api_error();
      await all_claim_greenrabbit();
    } else {
      console.log(
        ` 🦁🐵  | ${moment(new Date()).format(date)} | unknown error`
      );
      await unknown_error();
      await all_claim_greenrabbit();
    }
    // }
  }
}

async function successful_tx() {
  let tx = transaction.transaction_id;
  console.log(tx);
  notify.sendMessage(chat_id2, tx);
}

async function api_error() {
  rpc = new JsonRpc("http://wax.api.eosnation.io", { fetch });
  api = new Api({ rpc, signatureProvider }); //required to submit transactions
  console.log("  🔁  | switching api -> " + rpc.endpoint);
  let api_error_message =
    "api error 🔁\nswitching api to: http://wax\\.api\\.eosnation\\.io";
  notify.sendMessage(chat_id, api_error_message);
  await sleep(5000);
}

async function unknown_error() {
  console.log(error);
  let unknown_error_message = "unknown error\ncheck console";
  notify.sendMessage(chat_id, unknown_error_message);
  await sleep(5000);
}

console.log(" rpc  | " + rpc.endpoint);
// console.log(cs1_claim_rplanet());

// let claimed = await cs1_claim_rplanet();

// import express from "express";
// const app = express();
// app.all("/", (req, res) => {
//   console.log("Just got a request!");
//   res.send("claiming cs1...");
//   // res.send("claimed" + claimed);
// });
// app.listen(process.env.PORT || 3000);

// import * as http from "http";
// http
//   .createServer(async function (req, res) {
//     // console.log(`Just got a request at ${req.url}!`);
//     res.write("claiming cs1...\n");
//     // await sleep(20000);
//     // await cs1_claim_rplanet();
//     res.write("claimed\n" + (await cs1_claim_rplanet()));
//     res.end();
//   })
//   .listen(process.env.PORT || 3000);

// http.get("http://localhost:3000/cs1", function (response) {
//   // console.log("Status:", response.statusCode);
//   // console.log("Headers: ", response.headers);
//   response.pipe(process.stdout);
// });

// http.get("http://localhost:3000/cd3", function (response) {
//   // console.log("Status:", response.statusCode);
//   // console.log("Headers: ", response.headers);
//   response.pipe(process.stdout);
// });

// const app = express();
// // app.use(async function (req, res, next) {
// //   //do stuff
// //   // res.send("claiming cl...");
// //   res.write("claiming cl...");
// //   await cs1_claim_rplanet();
// //   // res.write(cs1_claim_rplanet());
// //   // res.send("claimed");
// //   // res.send(cl);
// //   // res.send("claimed");
// //   next();
// // });
// app.all("/cs1", async (req, res) => {
//   // console.log("Just got a request!");
//   await cs1_claim_rplanet();
//   res.send("claiming cs1...");
//   // res.write("claimed");
//   // res.end;
//   // res.write(cs1_claim_rplanet());
// });
// app.all("/cd3", async (req, res) => {
//   // console.log("Just got a request!");
//   await cd3_claim_rplanet();
//   res.send("claiming cd3...");
//   // res.write("claimed");
//   // res.end;
//   // res.write(cd3_claim_rplanet());
// });
// app.listen(process.env.PORT || 3000);

cs1_claim_rplanet();
// cd3_claim_rplanet();
// all_claim_greenrabbit();

// let tx_message = `test\n${moment(new Date()).format(date)}`;
// console.log(tx_message);

// cron.schedule("2 * * * *", cs1_claim_rplanet);
// console.log("  🦁   | waiting to claim on min 2...");
// cron.schedule("2 0,2,4,6,8,10,12,14,16,18,20,22 * * *", cd3_claim_rplanet);
// console.log("  🐵   | waiting to claim on min 2 of even hour...");

// cron.schedule("0 17 * * */1", all_claim_greenrabbit);
// console.log(" 🦁🐵  | waiting to claim at 17:00:00...");
