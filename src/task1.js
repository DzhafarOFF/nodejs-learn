process.stdin.on("data", (data) => {
  data = [...data.toString()].reverse().join("");
  process.stdout.write(data + "\n");
});
