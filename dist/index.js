"use strict";

var fs = require("node:fs");
var csv = require("csvtojson/v2");
var readline = require("readline");
var readStream = fs.createReadStream("./csv/example.csv", {
  encoding: "utf-8"
});
var writeStream = fs.createWriteStream("./txt/example.txt", {
  encoding: "utf8"
});
var rl = readline.createInterface({
  input: csv({
    downstreamFormat: "array"
  }).fromStream(readStream),
  crlfDelay: Infinity
});
rl.on("line", function (line) {
  writeStream.write(line);
});