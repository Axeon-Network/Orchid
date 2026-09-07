exports.ascii = function() {
  if (bot.showASCII) {
    console.log(`                                        `);
    console.log(`                #######                 `);
    console.log(`               #########                `);
    console.log(`               #########                `);
    console.log(`         ###### ####### ######          `);
    console.log(`         ######## ### #########         `);
    console.log(`         ##########  ##########         `);
    console.log(`          ########   *#######:          `);
    console.log(`                 ## ###                 `);
    console.log(`             ###### ######              `);
    console.log(`           ######## #########           `);
    console.log(`          ########   ########           `);
    console.log(`           ######   . ######            `);
    console.log(`                                        `);
  }
}

exports.log = function(type, args) {
  if (type === "debug" && process.env.WHD_BUILD_TYPE !== "chk") return;

  let label;
  if (type === "warn") {
    label = `\x1b[33m` + `[WARN]`;
  } else if (type === "error") {
    label = `\x1b[31m` + `[ERROR]`;
  } else if (type === "debug") {
    label = `\x1b[0m` + `[DEBUG]`;
  } else {
    label = `\x1b[36m` + `[INFO]`;
  }
  
  const time = new Date().toLocaleTimeString('en-GB', {hour12: false});
  const prefix = `\x1b[90m${time} ${label}\x1b[0m`;

  if (type === "warn") { 
    console.warn(prefix, args);
  } else if (type === "error") {
    console.error(prefix, args);
  } else if (type === "debug") {
    console.debug(prefix, args);
  } else {
    console.log(prefix, args);
  }
}

exports.logToFile = function() {
  const fs = require("fs");
  const log = fs.createWriteStream("./process.log", { flags: "a" });
  
  const stdout = process.stdout.write.bind(process.stdout);
  const stderr = process.stderr.write.bind(process.stderr);
  
  process.stdout.write = (chunk, ...args) => { log.write(chunk); return stdout(chunk, ...args)};
  process.stderr.write = (chunk, ...args) => { log.write(chunk); return stderr(chunk, ...args)};
}