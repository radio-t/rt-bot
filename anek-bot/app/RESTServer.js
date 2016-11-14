"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../typings/index.d.ts" />
var express = require("express");
var bodyParser = require('body-parser');
var RequestData_1 = require("./RequestData");
var events_1 = require("events");
var RESTServer = (function (_super) {
    __extends(RESTServer, _super);
    function RESTServer(storage) {
        _super.call(this);
        this.storage = storage;
        var app = express();
        app.use(bodyParser.json());
        app.get('/', this.defaultHandler.bind(this));
        app.get('/info', this.infoHandler.bind(this));
        app.post('/event', this.eventHandler.bind(this));
        app.listen(8080);
    }
    RESTServer.prototype.defaultHandler = function (req, res) {
        res.send('anek-bot');
    };
    RESTServer.prototype.infoHandler = function (req, res) {
        res.status(200);
        res.json({
            info: 'anek-bot в ответ на фразу ' +
                '\'расскажи анекдот\' отвечает анекдотом ' +
                'полученным из RSS сайта anekdot.ru'
        });
    };
    RESTServer.prototype.eventHandler = function (req, res) {
        var requestData = null;
        try {
            requestData = RequestData_1.RequestData.parseFromObject(req.body);
        }
        catch (error) {
            res.status(400);
            res.json({ error: error });
            return;
        }
        if (this.hasTriggerPhrase(requestData) && this.storage.hasNext()) {
            res.status(201);
            res.json({ text: this.storage.getNext().description, bot: 'anek-bot' });
            return;
        }
        res.status(417);
        res.end();
    };
    RESTServer.prototype.hasTriggerPhrase = function (data) {
        var text = data.text.toLowerCase();
        if (text.indexOf('расскажи') != -1 && text.indexOf('анекдот') != -1) {
            return true;
        }
        return false;
    };
    return RESTServer;
}(events_1.EventEmitter));
exports.RESTServer = RESTServer;
