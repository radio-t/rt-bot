"use strict";
/// <reference path="../typings/index.d.ts" />
var RESTServer_1 = require("./RESTServer");
var AnekdotLoader_1 = require("./AnekdotLoader");
var AnekdotStorage_1 = require("./AnekdotStorage");
var storage = new AnekdotStorage_1.AnekdotStorage();
var loader = new AnekdotLoader_1.AnekdotLoader();
loader.on('complete', function (anekdots) {
    storage.update(anekdots);
});
loader.on('error', function (error) {
    console.log('Error loading RSS');
    console.log(error);
});
loader.load();
var server = new RESTServer_1.RESTServer(storage);
