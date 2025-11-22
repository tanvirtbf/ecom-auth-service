import fs from "fs";
import rsaPemToJwk from "rsa-pem-to-jwk";

// Path fix করুন - '../certs' থেকে './certs'
const privateKey = fs.readFileSync("./certs/private.pem");

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const jwk = rsaPemToJwk(privateKey, { use: "sig" }, "public");

console.log(JSON.stringify(jwk));
