// Axeon Panther for JavaScript
// Copyright 2026 Axeon Network

const { execSync } = require("child_process");
const fs = require('fs');
const path = require("path");
const os = require("os");

const bot = require("../config/config.json");
const core = require("../config/core.json");

const major = 0;
const minor = 2;

const isDebug = process.env.WhdBuildType === "chk" || (process.env.WhdBuildType == null && bot.debug_mode);
const isRetail = process.env.WhdBuildType === "fre" || (process.env.WhdBuildType == null && !bot.debug_mode);

const storedNumber = "1200";
const deltaEnabled = process.env.WhdIsDeltaEnabled !== "no";
const deltaNumber = deltaEnabled && isDebug ? 1 : 0;

let prevBUILD = storedNumber ?? null;
let prevDELTA = deltaNumber ?? null;

const devPhase = core.devStage || "Gold Release";
const type = isDebug ? "Debug" : isRetail ? "Retail" : "";

const versionFile = path.join(__dirname, "./version.json");

if (fs.existsSync(versionFile)) {
    try {
        const version = JSON.parse(fs.readFileSync(versionFile, "utf8"));
        prevBUILD = version.BUILD ?? null;
        prevDELTA = version.DELTA ?? null;
    } catch (err) {
        console.error(`\x1b[31m[ERROR]\x1b[0m Panther: Failed to read version.json`);
        if (bot.debug_mode) console.error(`\x1b[31m[ERROR]\x1b[0m ` + err);
    }
}

console.log(`${core.name} Engine Version ${major}.${minor} (Build ${prevBUILD}.${prevDELTA}: ${devPhase}) (${type})`);
console.log(`               (C) 2026 Axeon Network. All Rights Reserved.\n\n`);
console.log(`Axeon Panther Version Master Utility for JavaScript [Version 4.0.5250]`);
console.log(`               (C) 2026 Axeon Network.`);
console.log(`               Written by KitSixtyFour for the Axeon Network`);
console.log(`               Adapted to JavaScript by AveryEclipse\n\n`)

const user = process.env.USERNAME || process.env.USER || os.userInfo().username || "dummy";

let lab;
try {
    lab = execSync("git rev-parse --abbrev-ref HEAD", {stdio: ["ignore", "pipe", "ignore"]}).toString().trim();
    if (!lab) throw new Error();
} catch {
    const now = new Date();
    const dateStub =
        String(now.getFullYear()).slice(2) + "-" +
        String(now.getMonth() + 1).padStart(2, "0") + "-" +
        String(now.getDate()).padStart(2, "0");

    lab = `${dateStub}_${user}`;
}

const privateBuild = process.env.WhdPrivateBuild === "yes";
if (privateBuild) lab = `private/${lab}(${user})`; 

const idPrefix = bot.idPrefix ?? "dp";
const idSuffix = isDebug ? "chk" : "fre";
const id = `${idPrefix}${idSuffix}`;

let currentIncrementalNumber = prevBUILD;
let currentDelta = prevDELTA;

let savedTimestamp = null;
if (fs.existsSync(versionFile)) {
    try {
        const version = JSON.parse(fs.readFileSync(versionFile, "utf8"));
        savedTimestamp = version.TIMESTAMP ?? null;
    } catch {}
}

const now = new Date();
const generateTimestamp =
    String(now.getFullYear()).slice(2) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    "-" +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0");

let timestamp;
if (isDebug) {
    timestamp = generateTimestamp;
} else {
    timestamp = savedTimestamp ?? generateTimestamp;
}

if (isDebug) {
    try {
        if (deltaEnabled) {
            currentDelta++;
        } else {
            currentIncrementalNumber++;
            currentDelta = 0;
        }
        console.log(`\x1b[36m[INFO]\x1b[0m Panther: Loading Orchid ${currentIncrementalNumber}.${currentDelta} (${lab}.${timestamp})`)
    } catch (err) {
        console.error(`\x1b[31m[ERROR]\x1b[0m Panther: Failed to increment build tag`);
        console.error(`\x1b[31m[ERROR]\x1b[0m` + err);
    }
}

const buildtag = `${major}.${minor}.${currentIncrementalNumber}.${currentDelta}.${id}.${lab}.${timestamp}`;

const version = {
    MAJOR: major,
    MINOR: minor,
    BUILD: currentIncrementalNumber,
    DELTA: currentDelta,
    ID: id,
    LAB: lab,
    TIMESTAMP: timestamp,
    VERSION: buildtag
};

fs.writeFileSync(
    versionFile,
    JSON.stringify(version, null, 4)
);