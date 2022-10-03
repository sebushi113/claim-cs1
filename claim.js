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
http
  .createServer(function (req, res) {
    // console.log(`Just got a request at ${req.url}!`);
    res.write("claiming cs1...");
    res.end();
  })
  .listen(process.env.PORT || 3000);

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

const date = "YYYY-MM-DD HH:mm:ss";
const chat_id = process.env.chat_id;
const chat_id2 = process.env.chat_id2;

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
      { useLastIrreversible: true, expireSeconds: 300 }
    );
    // console.log(
    //   `  🦁   | ${moment(new Date()).format(date)} | ${
    //     transaction.transaction_id
    //   }`
    // );
    console.log("🦁 " + transaction.transaction_id);
    let tx = transaction.transaction_id;
    // console.log(tx);
    notify.sendMessage(chat_id2, tx);
    await sleep(10000);
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
      await cs1_claim_rplanet();
    } else {
      console.log(
        `  🦁   | ${moment(new Date()).format(date)} | unknown error`
      );
      await unknown_error();
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
    console.log("🐵 " + tx);
    notify.sendMessage(chat_id2, tx);
    await sleep(10000);
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
      await cd3_claim_rplanet();
    } else {
      console.log(
        `  🐵   | ${moment(new Date()).format(date)} | unknown error`
      );
      await unknown_error();
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
  await sleep(10000);
}

async function unknown_error() {
  console.log(error);
  let unknown_error_message = "unknown error\ncheck console";
  notify.sendMessage(chat_id, unknown_error_message);
  await sleep(10000);
}

console.log(" rpc  | " + rpc.endpoint);

cs1_claim_rplanet();
// cd3_claim_rplanet();
// all_claim_greenrabbit();

// cron.schedule("2 * * * *", cs1_claim_rplanet);
// console.log("  🦁   | waiting to claim on min 2...");
// cron.schedule("2 0,2,4,6,8,10,12,14,16,18,20,22 * * *", cd3_claim_rplanet);
// console.log("  🐵   | waiting to claim on min 2 of even hour...");

// cron.schedule("0 17 * * */1", all_claim_greenrabbit);
// console.log(" 🦁🐵  | waiting to claim at 17:00:00...");
