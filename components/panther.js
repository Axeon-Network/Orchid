// Axeon Panther for JavaScript
// Copyright 2026 Axeon Network

const { execSync } = require("child_process");
const fs = require('fs');
const path = require("path");
const os = require("os");

// version number config
const major = 0;
const minor = 3;

console.log(`Axeon Panther Version Tracker Utility Version 5.0 [Build 5400]`);
console.log(`Copyright (C) 2025-2026 Axeon Network.`);
console.log(``);
console.log(`Check us out over at https://www.github.com/Axeon-Network!`);

const versionHeaderDir = path.join(__dirname, "./version.json");

const verboseEnabled = bot.verbose_panther;

let lab;
try {
    lab = execSync("git rev-parse --abbrev-ref HEAD", {stdio: ["ignore", "pipe", "ignore"]}).toString().trim();
    if (!lab) throw new Error();
    if (verboseEnabled) console.log("Panther:", `Using Git branch ${lab}`);
} catch {
    // if git isn't present, or if we simply can't get a lab, set a dummy one
    const now = new Date();
    const labDate =
        String(now.getFullYear()).slice(2) + "-" +
        String(now.getMonth() + 1).padStart(2, "0") + "-" +
        String(now.getDate()).padStart(2, "0");
    const labUser = process.env.USERNAME || process.env.USER || os.userInfo().username || "dummy";
    const lab = `${labDate}_${labUser}`;
    console.log("Panther:", `Cannot find a valid Git branch. Panther will load ${lab} instead.`)
}

const isDebug = process.env.WHD_BUILD_TYPE === "chk" || bot.debugMode;
const canHasDelta = process.env.WHD_IS_DELTA_ENABLED === "yes" || bot.buildDelta;
const isPrivate = process.env.WHD_PRIVATE_BUILD === "yes" || bot.privateBuild;

module.exports = {isDebug};

if (isPrivate) {
    const currentUser = process.env.USERNAME || process.env.USER || os.userInfo().username || "dummy";
    const lab = `private/${lab}(${currentUser})`; 
    if (verboseEnabled) console.log("Panther:", `User ${currentUser} will be appended to lab.`)
}

// component identifies and build numbers
const idPrefix = core.idPrefix ?? "dp";
const idSuffix = isDebug ? "chk" : "fre";
const id = `${idPrefix}${idSuffix}`;

const storedNumber = 1700;
const deltaNbr = canHasDelta && isDebug ? 1 : 0;

let prevBuild = storedNumber ?? null;
let prevDelta = deltaNbr ?? null;

if (fs.existsSync(versionHeaderDir)) {
    try {
        const version = JSON.parse(fs.readFileSync(versionHeaderDir, "utf8"));
        prevBuild = version.PTH_BUILD ?? null;
        prevDelta = version.PTH_DELTA ?? null;
    } catch {}
}

let currentBuild = prevBuild;
let currentDelta = prevDelta;

// if we're in retail mode, don't make a new timestamp.
let savedTimestamp = null;
if (fs.existsSync(versionHeaderDir)) {
  const version = JSON.parse(fs.readFileSync(versionHeaderDir, "utf8"));
  savedTimestamp = version.PTH_TIMESTAMP ?? null;
}

const now = new Date();
const generateTimestamp =
    String(now.getFullYear()).slice(2) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    "-" +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0");

// log if private build or delta numbering is ON
if (verboseEnabled) {
  if (isPrivate) console.log("Panther:", `Private build enabled (${process.env.WHD_PRIVATE_BUILD ? "WHD_PRIVATE_BUILD=yes" : "default"})`);
  if (canHasDelta) console.log("Panther:", `Delta numbering enabled (${process.env.WHD_IS_DELTA_ENABLED ? "WHD_IS_DELTA_ENABLED=yes" : "default"})`);
}

if (isDebug) {
    try {
        if (canHasDelta) {
            currentDelta++;
        } else {
            currentBuild++;
            currentDelta = 0;
        }
    } catch (err) {
        log('error', `Panther: Failed to increment build tag`);
        log('error', err);
    }
}

let timestamp;
if (isDebug) {
    timestamp = generateTimestamp;
    if (verboseEnabled) console.log("Panther:", `Build tag '${major}.${minor}.${currentBuild}.${currentDelta} (${lab}.${timestamp})' has been loaded.`)
} else {
    timestamp = savedTimestamp ?? generateTimestamp;
    if (verboseEnabled) console.log("Panther:", `Retail tag '${major}.${minor}.${currentBuild}.${currentDelta} (${lab}.${timestamp})' has been loaded.`)
}

const buildtag = `${major}.${minor}.${currentBuild}.${currentDelta}.${id}.${lab}.${timestamp}`;

const version = {
    PTH_MAJOR: major,
    PTH_MINOR: minor,
    PTH_BUILD: currentBuild,
    PTH_DELTA: currentDelta,
    PTH_ID: id,
    PTH_LAB: lab,
    PTH_TIMESTAMP: timestamp,
    PTH_VERSION: buildtag
};

fs.writeFileSync(versionHeaderDir, JSON.stringify(version, null, 4));
if (verboseEnabled) console.log("Panther:", `Aforementioned build tag has been written to ${versionHeaderDir}.`);
