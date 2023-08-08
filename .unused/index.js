import express from "express";
const app = express();
import moment from "moment";
const date = "YYYY-MM-DD HH:mm:ss";
import AWS from "aws-sdk";
const s3 = new AWS.S3();
import * as claim from "./claim.js";
import sendMessage from "./notify.js";
import bodyParser from "body-parser";
const chat_id2 = process.env.chat_id2;

app.all("/claim-gr", async (req, res) => {
  let startTime = performance.now();
  console.log("claim-gr started");
  let cs1_claim_gr = await claim.cs1_claim_gr();
  let cd3_claim_gr = await claim.cd3_claim_gr();
  console.log("claim-gr finished");
  let endTime = performance.now();
  let totalTime = (endTime - startTime).toFixed(3);
  console.log(`claim-gr: ${totalTime}ms`);
  let time = moment(new Date()).format(date);
  let tx_message = `${time}\n\n${cs1_claim_gr}\n\n${cd3_claim_gr}\n\ncyclic: ${totalTime}ms`;
  await sendMessage(chat_id2, tx_message);
  res.send(`green rabbit claimed<br/>${totalTime}ms`);
});

app.all("/withdraw-gr", async (req, res) => {
  let startTime = performance.now();
  console.log("withdraw-gr started");
  let cs1_withdraw_gr = await claim.cs1_withdraw_gr();
  let cd3_withdraw_gr = await claim.cd3_withdraw_gr();
  console.log("withdraw-gr finished");
  let endTime = performance.now();
  let totalTime = (endTime - startTime).toFixed(3);
  console.log(`withdraw-gr: ${totalTime}ms`);
  let time = moment(new Date()).format(date);
  let tx_message = `${time}\n\n${cs1_withdraw_gr}\n\n${cd3_withdraw_gr}\n\ncyclic: ${totalTime}ms`;
  await sendMessage(chat_id2, tx_message);
  res.send(`green rabbit withdrawn<br/>${totalTime}ms`);
});

app.use(bodyParser.json());

// curl -i some-app.cyclic.app/myFile.txt
app.get("*", async (req, res) => {
  let filename = req.path.slice(1);

  try {
    let s3File = await s3
      .getObject({
        Bucket: process.env.BUCKET,
        Key: filename,
      })
      .promise();

    res.set("Content-type", s3File.ContentType);
    res.send(s3File.Body.toString()).end();
  } catch (error) {
    if (error.code === "NoSuchKey") {
      console.log(`No such key ${filename}`);
      res.sendStatus(404).end();
    } else {
      console.log(error);
      res.sendStatus(500).end();
    }
  }
});

// curl -i -XPUT --data '{"k1":"value 1", "k2": "value 2"}' -H 'Content-type: application/json' https://some-app.cyclic.app/myFile.txt
app.put("*", async (req, res) => {
  let filename = req.path.slice(1);

  console.log(typeof req.body);

  await s3
    .putObject({
      Body: JSON.stringify(req.body),
      Bucket: process.env.BUCKET,
      Key: filename,
    })
    .promise();

  res.set("Content-type", "text/plain");
  res.send("ok").end();
});

// curl -i -XDELETE https://some-app.cyclic.app/myFile.txt
app.delete("*", async (req, res) => {
  let filename = req.path.slice(1);

  await s3
    .deleteObject({
      Bucket: process.env.BUCKET,
      Key: filename,
    })
    .promise();

  res.set("Content-type", "text/plain");
  res.send("ok").end();
});

// /////////////////////////////////////////////////////////////////////////////
// Catch all handler for all other request.
app.use("*", (req, res) => {
  res.sendStatus(404).end();
});

app.listen(process.env.PORT || 3000);
