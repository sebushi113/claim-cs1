import CyclicDB from "@cyclic.sh/dynamodb";
import * as dotenv from "dotenv";

dotenv.config();

const db = CyclicDb(process.env.cyclicDB);

const set = async function () {
  let cpu4 = db.collection("cpu4");

  let amounts = await cpu4.set("amounts", {
    ccs3_cs1d: cpu4_cs1d,
    ccs3_cd3d: cpu4_cd3d,
    tw: tw,
  });
  console.log(amounts);
};

const get = async function () {
  let cpu4 = db.collection("cpu4");

  let item = await cpu4.get("amounts");
  console.log(item);
};
