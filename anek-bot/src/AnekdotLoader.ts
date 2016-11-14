import request = require("request");
import xml2js = require('xml2js');
import {IncomingMessage} from "http";
import {AnekdotData} from "./AnekdotData";
import {EventEmitter} from "events";

export class AnekdotLoader extends EventEmitter {

    constructor() {
        super();
    }

    public load() {
        //var url = "https://www.anekdot.ru/rss/tag/21.xml"; // Анекдоты про твиттер
        var url = "https://www.anekdot.ru/rss/tag/26.xml"; // Анекдоты про программистов
        request({
            uri: url,
            method: 'GET',
            encoding: 'utf8'
        }, (error, response: IncomingMessage, body: any) => {
            if (error) {
                super.emit('error', error);
                return;
            }
            this.parseXML(body);
        });
    }

    private parseXML(xmlString: string) {
        var anekdots: AnekdotData[] = [];
        var parseString = xml2js.parseString;

        parseString(xmlString, (error, result) => {
            if (error) {
                super.emit('error', error);
            }
            var items: any[] = result.rss.channel[0].item;
            for (var item of items) {
                anekdots.push(AnekdotData.parseFromObject(item))
            }

            super.emit('complete', anekdots);
        });
    }
}