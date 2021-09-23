"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var configKeys = [
    "APP_URL",
    "DISCORD_BOT_TOKEN",
    "DISCORD_CLIENT_ID",
    "DISCORD_CLIENT_SECRET",
    "NODE_ENV",
    "SESSION_SECRET"
];
var config = configKeys.reduce(function (config, key) {
    if (!process.env[key])
        throw new Error("Environment variable " + key + " is not defined but is required for this app to run.");
    config[key] = process.env[key];
    switch (key) {
        case "APP_URL":
            process.env.NEXTAUTH_URL = config[key];
            break;
    }
    return config;
}, {});
exports.default = config;
