"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.playAudio = exports.joinVoice = exports.initialize = void 0;
var discord_js_1 = require("discord.js");
var voice_1 = require("@discordjs/voice");
var config_1 = __importDefault(require("config"));
var stream_1 = require("stream");
var logger_1 = __importDefault(require("../logger"));
var log = logger_1.default.extend("DISCORD_CLIENT");
var DISCORD_BOT_TOKEN = config_1.default.DISCORD_BOT_TOKEN;
var discordClient = new discord_js_1.Client({ intents: [discord_js_1.Intents.FLAGS.GUILDS, discord_js_1.Intents.FLAGS.GUILD_VOICE_STATES] });
var initialize = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                log("Initializing Discord client...");
                discordClient.on("error", console.log);
                return [4 /*yield*/, new Promise(function (resolve, reject) {
                        discordClient.once("ready", resolve);
                        discordClient.once("error", reject);
                        discordClient.login(DISCORD_BOT_TOKEN);
                    })];
            case 1:
                _a.sent();
                log("Discord client ready.");
                return [2 /*return*/];
        }
    });
}); };
exports.initialize = initialize;
var voiceConnections = {};
var joinVoice = function (channelId) { return __awaiter(void 0, void 0, void 0, function () {
    var channel, _a, connection;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                log("Discord client joining voice channel " + channelId + "...");
                if (!((_b = discordClient.channels.cache.get(channelId)) !== null && _b !== void 0)) return [3 /*break*/, 1];
                _a = _b;
                return [3 /*break*/, 3];
            case 1: return [4 /*yield*/, discordClient.channels.fetch(channelId)];
            case 2:
                _a = _c.sent();
                _c.label = 3;
            case 3:
                channel = (_a);
                return [4 /*yield*/, (0, voice_1.joinVoiceChannel)({
                        channelId: channelId,
                        guildId: channel.guild.id,
                        adapterCreator: channel.guild.voiceAdapterCreator
                    })];
            case 4:
                connection = _c.sent();
                return [4 /*yield*/, (0, voice_1.entersState)(connection, voice_1.VoiceConnectionStatus.Ready, 30e3)];
            case 5:
                _c.sent();
                voiceConnections[channel.id] = connection;
                log("Voice channel " + channelId + " joined successfully.");
                return [2 /*return*/];
        }
    });
}); };
exports.joinVoice = joinVoice;
var playAudio = function (channelId, audioContent) { return __awaiter(void 0, void 0, void 0, function () {
    var connection, audioStream, resource, player;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                log("Playing audio to voice channel " + channelId + "...");
                connection = voiceConnections[channelId];
                if (!!connection) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, exports.joinVoice)(channelId)];
            case 1:
                _a.sent();
                connection = voiceConnections[channelId];
                _a.label = 2;
            case 2:
                audioStream = new stream_1.Readable({ read: function () { } });
                audioStream.push(audioContent);
                audioStream.push(null);
                resource = (0, voice_1.createAudioResource)(audioStream);
                player = (0, voice_1.createAudioPlayer)();
                player.play(resource);
                return [4 /*yield*/, (0, voice_1.entersState)(player, voice_1.AudioPlayerStatus.Playing, 10e3)];
            case 3:
                _a.sent();
                connection.setSpeaking(true);
                connection.subscribe(player);
                return [4 /*yield*/, (0, voice_1.entersState)(player, voice_1.AudioPlayerStatus.Idle, 60e3)];
            case 4:
                _a.sent();
                connection.setSpeaking(false);
                log("Audio finished playing in channel " + channelId + ".");
                return [2 /*return*/];
        }
    });
}); };
exports.playAudio = playAudio;
