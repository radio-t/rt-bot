"use strict";
const   express         = require('express'),
        bodyParser      = require('body-parser'),
        request         = require('request'),
        waterfall       = require('async/waterfall'),
        cron            = require('node-cron'),
        fs              = require('fs');
const app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
const currency_RegExp = {
    d: /(((\$|usd)\s?)(([0-9]+\s[0-9]+\s[0-9]+|[0-9]+\s[0-9]+|[0-9]+)((,|\.)[0-9]+)?)|(([0-9]+\s[0-9]+\s[0-9]+|[0-9]+\s[0-9]+|[0-9]+)((,|\.)[0-9]+)?(\s(милион|тысяч|сотень|сотни|k|к)\s?)?(\s?(\$|дол|dol|баксов|usd))))/i,
    e: /(((€|eur)\s?)(([0-9]+\s[0-9]+\s[0-9]+|[0-9]+\s[0-9]+|[0-9]+)((,|\.)[0-9]+)?)|(([0-9]+\s[0-9]+\s[0-9]+|[0-9]+\s[0-9]+|[0-9]+)((,|\.)[0-9]+)?(\s(милион|тысяч|сотень|сотни|k|к)\s?)?(\s?(€|евро|эвро|eur|ewro))))/i,
    h: /(((₴|uah)\s?)(([0-9]+\s[0-9]+\s[0-9]+|[0-9]+\s[0-9]+|[0-9]+)((,|\.)[0-9]+)?)|(([0-9]+\s[0-9]+\s[0-9]+|[0-9]+\s[0-9]+|[0-9]+)((,|\.)[0-9]+)?(\s(милион|тысяч|сотень|сотни|k|к)\s?)?(\s?(₴|грн|гривень|гривны|hrn|hriven|uah))))/i,
    r: /(((₽|rub)\s?)(([0-9]+\s[0-9]+\s[0-9]+|[0-9]+\s[0-9]+|[0-9]+)((,|\.)[0-9]+)?)|(([0-9]+\s[0-9]+\s[0-9]+|[0-9]+\s[0-9]+|[0-9]+)((,|\.)[0-9]+)?(\s(милион|тысяч|сотень|сотни|k|к)\s?)?(\s?(₽|руб|rub))))/i
};
let currency = {
    USD_EUR: 0,
    USD_UAH: 0,
    USD_RUB: 0,
    EUR_USD: 0,
    EUR_UAH: 0,
    EUR_RUB: 0,
    UAH_USD: 0,
    UAH_EUR: 0,
    UAH_RUB: 0,
    RUB_USD: 0,
    RUB_EUR: 0,
    RUB_UAH: 0
};

app.post('/event', function(req, res) {
    let text = req.body.text;
    waterfall([
        function(callback){
            let v = 0;
            let c = 0;
            if(text.match(currency_RegExp.d)!=null){
                v = text.match(currency_RegExp.d)[0];
                c = "USD";
                callback(null, v, c);
            }
            else if(text.match(currency_RegExp.e)!=null){
                v = text.match(currency_RegExp.e)[0];
                c = "EUR";
                callback(null, v, c);
            }
            else if(text.match(currency_RegExp.h)!=null){
                v = text.match(currency_RegExp.h)[0];
                c = "UAH";
                callback(null, v, c);
            }
            else if(text.match(currency_RegExp.r)!=null){
                v = text.match(currency_RegExp.r)[0];
                c = "RUB";
                callback(null, v, c);
            }
            else callback(true);
        },
        function(v, c, callback){
            if(~text.indexOf("сотень")) v = v + "00";
            if(~text.indexOf("сотни")) v = v + "00";
            if(~text.indexOf("тысяч")) v = v + "000";
            if(~text.indexOf("тысячи")) v = v + "000";
            if(~text.indexOf("милион")) v = v + "000000";
            if(~text.indexOf("милионов")) v = v + "000000";
            if(~text.indexOf("k")) v = v + "000";
            if(~text.indexOf("к")) v = v + "000";
            v = v.replace(/[^\d(,|\.)-]/g, '');
            callback(null, v, c);
        },
        function(v, c, callback){
            let res_1 = 0,
                res_2 = 0,
                res_3 = 0;

            if(c=="USD"){
                res_1 = ((currency.USD_EUR*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') + " €").replace(".00", "");
                res_2 = ((currency.USD_UAH*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') + " грн.").replace(".00", "");
                res_3 = ((currency.USD_RUB*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') + " руб.").replace(".00", "");
            }
            else if(c=="EUR"){
                res_1 = ((currency.EUR_USD*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') + " $").replace(".00", "");
                res_2 = ((currency.EUR_UAH*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') + " грн.").replace(".00", "");
                res_3 = ((currency.EUR_RUB*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') + " руб.").replace(".00", "");
            }
            else if(c=="UAH"){
                res_1 = ((currency.UAH_USD*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') + " $").replace(".00", "");
                res_2 = ((currency.UAH_EUR*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') + " €").replace(".00", "");
                res_3 = ((currency.UAH_RUB*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') + " руб.").replace(".00", "");
            }
            else if(c=="RUB"){
                res_1 = ((currency.RUB_USD*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') + " $").replace(".00", "");
                res_2 = ((currency.RUB_EUR*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') + " €").replace(".00", "");
                res_3 = ((currency.RUB_UAH*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') + " грн.").replace(".00", "");
            }
            let responseText = res_1+" | "+res_2+" | "+res_3;
            callback(null, responseText);
        }
    ], function (err, result) {
        if(err) res.status(417).end();
        else {
            res.status(201);
            res.json({
                bot: "money_bot",
                text: result
            });
            res.end();
        }
    });
});
app.all('/info', function(req, res) {
    res.json({
        author: 'exelban',
        info: 'Если в сообщение была упомянутая какая-то валюта (USD, EUR, UAH, RUB), бот конвертирует ее в доллары, евро, грн, руб. (5€ = 5.30 $ | 136.67 грн. | 335.51 руб.)'
    });
    res.end();
});

function get_currency(){
    waterfall([
        function(callback){
            request("http://free.currencyconverterapi.com/api/v3/convert?q=USD_EUR,USD_UAH,USD_RUB,EUR_USD,EUR_UAH,EUR_RUB,UAH_USD,UAH_EUR,UAH_RUB", {timeout: 3000}, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    let results = JSON.parse(body).results;
                    let quotes = Object.keys(results).map(function (key) { return results[key]; });
                    currency.USD_EUR = quotes[0].val;
                    currency.USD_UAH = quotes[1].val;
                    currency.USD_RUB = quotes[2].val;
                    currency.EUR_USD = quotes[3].val;
                    currency.EUR_UAH = quotes[4].val;
                    currency.EUR_RUB = quotes[5].val;
                    currency.UAH_USD = quotes[6].val;
                    currency.UAH_EUR = quotes[7].val;
                    currency.UAH_RUB = quotes[8].val;
                    callback(null);
                }
                else {
                    callback(true);
                }
            });
        },
        function(callback){
            request("http://free.currencyconverterapi.com/api/v3/convert?q=RUB_USD,RUB_EUR,RUB_UAH", {timeout: 3000}, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    let results = JSON.parse(body).results;
                    let quotes = Object.keys(results).map(function (key) { return results[key]; });
                    currency.RUB_USD = quotes[0].val;
                    currency.RUB_EUR = quotes[1].val;
                    currency.RUB_UAH = quotes[2].val;
                    callback(null);
                }
                else callback(true);
            });
        }
    ], function (err) {
        if(err) {
            fs.readFile('currency.json', 'utf8', function (err, data) {
                if (err) throw err;
                currency = JSON.parse(data);
            });
        }
        else fs.writeFileSync("currency.json", JSON.stringify(currency));
    });
}

cron.schedule('56 * * * *', get_currency());
get_currency();
app.listen(8080);
