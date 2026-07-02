// (Mini-)Panther Version Master Utility for JavaScript (PantherJS)
// Copyright 2026 Axeon Network

const fs = require('fs');

const bot = require("../config/config.json");
const core = require("../config/core.json");

function incrementBuildNumber(core, corePath) {
    core.build++;
    fs.writeFileSync(
        corePath,
        JSON.stringify(core, null, 2)
    );
}

function displayVersion() {
    const isDebug = bot.debug_mode;
    const label = isDebug ? "Checked" : "Retail";

    console.log(`${core.name} Engine ${core.dev_stage} (${label}) [Version ${core.version}.${core.build}]`);
    console.log(`               (C) 2026 Axeon Network. All Rights Reserved.`);
}

module.exports = {
    incrementBuildNumber,
    displayVersion
}