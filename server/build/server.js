"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server.js
var http_1 = require("http");
var url_1 = require("url");
var next_1 = __importDefault(require("next"));
console.log(process.env.NODE_ENV);
var dev = process.env.NODE_ENV !== "production";
var app = (0, next_1.default)({ dev: dev });
var handle = app.getRequestHandler();
app.prepare().then(function () {
    (0, http_1.createServer)(function (req, res) {
        var _a;
        var parsedUrl = (0, url_1.parse)((_a = req.url) !== null && _a !== void 0 ? _a : "", true);
        handle(req, res, parsedUrl);
    }).listen(3000, function () {
        console.log('> Ready on http://localhost:3000');
    });
});
