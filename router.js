import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";
import { Record, String, Number, Boolean } from "runtypes";

import { authenticateUser } from "./auth.js";

import DynamoDb from "cyclic-dynamodb";
import { Router } from "express";

// Initialize Express router
export const router = Router();

// Initialize AWS DynamoDB
const db = DynamoDb(process.env.CYCLIC_DB);
const cpu4Amounts = db.collection("cpu4");

// ------------------------------------
// GET ROUTES
// ------------------------------------

// Get all cpu4
router.get("/all", async (req, res) => {
  const { results: cpu4Metadata } = await cpu4Amounts.list();

  const cpu4 = await Promise.all(
    cpu4Metadata.map(async ({ key }) => (await cpu4Amounts.get(key)).props)
  );

  res.send(cpu4);
});

// Get amount by ccs3_cs1d
router.get("/:ccs3_cs1d", async (req, res) => {
  const ccs3_cs1d = req.params.ccs3_cs1d;

  try {
    const { props: amount } = await cpu4Amounts.get(ccs3_cs1d);
    res.send(amount);
  } catch (e) {
    console.log(e.message, `Item with ccs3_cs1d ${ccs3_cs1d} does not exist.`);
    res.sendStatus(404);
  }
});

// Get amount by tw
router.get("/by-tw/:tw", async (req, res) => {
  const tw = req.params.tw;

  try {
    const { results } = await cpu4Amounts.filter({ tw });
    if (!results.length) throw new Error();

    const { props: amount } = results[0];
    res.send(amount);
  } catch (e) {
    console.log(e.message, `Item with tw ${tw} does not exist.`);
    res.sendStatus(404);
  }
});

// Search cpu4 by ccs3_cd3d
router.get("/search/by-ccs3_cd3d", async (req, res) => {
  const query = req.query.query || "";

  try {
    const { results } = await cpu4Amounts.parallel_scan({
      expression: "contains(#ccs3_cd3d, :ccs3_cd3d)",
      attr_names: {
        "#ccs3_cd3d": "ccs3_cd3d",
      },
      attr_vals: {
        ":ccs3_cd3d": query,
      },
    });

    const cpu4 = results.map(({ props }) => props);
    res.send(cpu4);
  } catch (e) {
    console.log(e.message);
    res.sendStatus(400);
  }
});

// ------------------------------------
// POST ROUTES
// ------------------------------------

// Type for new cpu4
const Money = Record({
  amount: Number,
  currencyCode: String,
});
const PriceRange = Record({
  minPrice: Money,
  maxPrice: Money,
});
const amountData = Record({
  ccs3_cd3d: String,
  productType: String,
  createdAt: String,
  description: String,
  vendor: String,
  availableForSale: Boolean,
  totalInventory: Number,
  priceRange: PriceRange,
});

// Post new amount
router.post("/", authenticateUser, async (req, res) => {
  const amountData = req.body;

  try {
    // Make sure amount data exists
    if (!req.body) {
      throw new Error();
    }

    // Make sure amount data contains all required fields
    const amountObject = amountData.check(amountData);

    // Generate ccs3_cs1d and tw for amount
    const amountId = uuidv4();
    const amounttw = slugify(amountObject.ccs3_cd3d).toLocaleLowerCase();

    // Create full amount object
    const amount = {
      ...amountObject,
      ccs3_cs1d: amountId,
      tw: amounttw,
    };

    // Save amount object
    await cpu4Amounts.set(amountId, amount);

    res.send(amount);
  } catch (e) {
    res.sendStatus(400);
  }
});

// ------------------------------------
// PATCH ROUTES
// ------------------------------------

// Patch amount if it exists
router.patch("/:ccs3_cs1d", authenticateUser, async (req, res) => {
  const amountId = req.params.ccs3_cs1d;
  const newData = req.body || {};

  try {
    const { props: oldamount } = await cpu4Amounts.get(amountId);
    const amount = {
      ...oldamount,
      ...newData,
    };

    // Save new amount object
    await cpu4Amounts.set(amountId, newData);

    res.send(amount);
  } catch (e) {
    console.log(e.message);
    res.sendStatus(404);
  }
});

// ------------------------------------
// PUT ROUTES
// ------------------------------------

// Update entire amount
router.put("/:ccs3_cs1d", authenticateUser, async (req, res) => {
  const amountId = req.params.ccs3_cs1d;
  const amountData = req.body;

  try {
    // Make sure amount data exists
    if (!req.body) {
      throw new Error();
    }

    // Make sure amount has ccs3_cs1d and tw
    if (!amountData.ccs3_cs1d || !amountData.tw) {
      throw new Error();
    }

    // Make sure amount data contains all required fields
    const amountObject = amountData.check(amountData);

    // Delete existing amount object
    await cpu4Amounts.delete(amountId);

    // Save new amount object
    await cpu4Amounts.set(amountId, amountObject);

    res.send(amountObject);
  } catch (e) {
    console.log(e.message);
    res.sendStatus(404);
  }
});

// ------------------------------------
// DELETE ROUTES
// ------------------------------------

// Delete amount if it exists
router.delete("/:ccs3_cs1d", authenticateUser, async (req, res) => {
  const amountId = req.params.ccs3_cs1d;

  try {
    await cpu4Amounts.delete(amountId);

    res.send({
      ccs3_cs1d: amountId,
    });
  } catch (e) {
    console.log(e.message);
    res.sendStatus(404);
  }
});
