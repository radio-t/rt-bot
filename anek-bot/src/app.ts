/// <reference path="../typings/index.d.ts" />
import {RESTServer} from "./RESTServer";
import {AnekdotLoader} from "./AnekdotLoader";
import {AnekdotStorage} from "./AnekdotStorage";
import {AnekdotData} from "./AnekdotData";

console.log("Anek-bot starting");
var storage = new AnekdotStorage();

var loader = new AnekdotLoader();
loader.on('complete', (anekdots: AnekdotData[])=> {
    storage.update(anekdots);
});
loader.on('error', (error: string)=> {
    console.log('Error loading RSS');
    console.log(error);
});
loader.load();

var server = new RESTServer(storage);