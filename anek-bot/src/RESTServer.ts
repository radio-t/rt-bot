/// <reference path="../typings/index.d.ts" />
import * as express from "express";
import * as bodyParser from 'body-parser';
import {Express} from "express";
import {Request, Response} from "express-serve-static-core";
import {RequestData} from "./RequestData";
import {AnekdotStorage} from "./AnekdotStorage";
import {EventEmitter} from "events";


export class RESTServer extends EventEmitter {
    constructor(private storage: AnekdotStorage) {
        super();

        var app: Express = express();
        app.use(bodyParser.json());
        app.get('/', this.defaultHandler.bind(this));
        app.get('/info', this.infoHandler.bind(this));
        app.post('/event', this.eventHandler.bind(this));
        app.listen(8080);
    }

    private defaultHandler(req: Request, res: Response) {
        res.send('anek-bot');
    }

    private infoHandler(req: Request, res: Response) {
        res.status(200);
        res.json(
            {
                info: 'anek-bot в ответ на фразу ' +
                '\'расскажи анекдот\' отвечает анекдотом ' +
                'полученным из RSS сайта anekdot.ru'
            }
        )
    }

    private eventHandler(req: Request, res: Response) {
        var requestData: RequestData = null;
        try {
            requestData = RequestData.parseFromObject(req.body);
        } catch (error) {
            res.status(400);
            res.json({error: error});
            return;
        }

        if (this.hasTriggerPhrase(requestData) && this.storage.hasNext()) {
            res.status(201);
            res.json({text: this.storage.getNext().description, bot: 'anek-bot'});
            return;
        }

        res.status(417);
        res.end();
    }

    private hasTriggerPhrase(data: RequestData): boolean {
        var text = data.text.toLowerCase();
        if (text.indexOf('расскажи') != -1 && text.indexOf('анекдот') != -1) {
            return true;
        }
        return false;
    }

}