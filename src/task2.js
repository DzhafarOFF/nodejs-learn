const fs = require("node:fs");
const csv = require("csvtojson/v2");
const readline = require("readline");

const readStream = fs.createReadStream("./csv/example.csv", {
  encoding: "utf-8",
});

const writeStream = fs.createWriteStream("./txt/example.txt", {
  encoding: "utf8",
});

const rl = readline.createInterface({
  input: csv({ downstreamFormat: "array" }).fromStream(readStream),
  crlfDelay: Infinity,
});

rl.on("line", (line) => {
  writeStream.write(line);
});
