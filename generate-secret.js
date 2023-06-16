// generate-secret.js
// require("crypto").randomBytes(64).toString("hex");

import { randomBytes } from "crypto";

const randomHexString = randomBytes(64).toString("hex");
console.log(randomHexString);
