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
    d: /(((\$|usd)\s?)((\d+\s\d+\s\d+|\d+\s\d+|\d+)((,|\.)\d+)?)(\s?(миллион(а|ов)?|миллиард(а|ов)?|млн|млрд|тысячи|тыс|тысяч|сотен|сотни|k|к)\.?\s?)?|((\d+\s\d+\s\d+|\d+\s\d+|\d+)((,|\.)\d+)?(\s?(миллион(а|ов)?|миллиард(а|ов)?|млн|млрд|тысячи|тыс|тысяч|сотен|сотни|k|к)\.?\s?)?(\s?(\$|дол|dol|баксов|бакса|usd))))/i,
    e: /(((€|eur)\s?)((\d+\s\d+\s\d+|\d+\s\d+|\d+)((,|\.)\d+)?)(\s?(миллион(а|ов)?|миллиард(а|ов)?|млн|млрд|тысячи|тыс|тысяч|сотен|сотни|k|к)\.?\s?)?|((\d+\s\d+\s\d+|\d+\s\d+|\d+)((,|\.)\d+)?(\s?(миллион(а|ов)?|миллиард(а|ов)?|млн|млрд|тысячи|тыс|тысяч|сотен|сотни|k|к)\.?\s?)?(\s?(€|евро|эвро|eur|ewro))))/i,
    h: /(((₴|uah)\s?)((\d+\s\d+\s\d+|\d+\s\d+|\d+)((,|\.)\d+)?)(\s?(миллион(а|ов)?|миллиард(а|ов)?|млн|млрд|тысячи|тыс|тысяч|сотен|сотни|k|к)\.?\s?)?|((\d+\s\d+\s\d+|\d+\s\d+|\d+)((,|\.)\d+)?(\s?(миллион(а|ов)?|миллиард(а|ов)?|млн|млрд|тысячи|тыс|тысяч|сотен|сотни|k|к)\.?\s?)?(\s?(₴|грн|гривень|гривны|hrn|hriven|uah))))/i,
    r: /(((₽|rub)\s?)((\d+\s\d+\s\d+|\d+\s\d+|\d+)((,|\.)\d+)?)(\s?(миллион(а|ов)?|миллиард(а|ов)?|млн|млрд|тысячи|тыс|тысяч|сотен|сотни|k|к)\.?\s?)?|((\d+\s\d+\s\d+|\d+\s\d+|\d+)((,|\.)\d+)?(\s?(миллион(а|ов)?|миллиард(а|ов)?|млн|млрд|тысячи|тыс|тысяч|сотен|сотни|k|к)\.?\s?)?(\s?(₽|руб|rub))))/i,
    b: /(((Br|BYN)\s?)((\d+\s\d+\s\d+|\d+\s\d+|\d+)((,|\.)\d+)?)(\s?(миллион(а|ов)?|миллиард(а|ов)?|млн|млрд|тысячи|тыс|тысяч|сотен|сотни|k|к)\.?\s?)?|((\d+\s\d+\s\d+|\d+\s\d+|\d+)((,|\.)\d+)?(\s?(миллион(а|ов)?|миллиард(а|ов)?|млн|млрд|тысячи|тыс|тысяч|сотен|сотни|k|к)\.?\s?)?(\s?(Br|белорусских рублей|белорусских|BYN))))/i,
    btc: /(((BTC)\s?)((\d+\s\d+\s\d+|\d+\s\d+|\d+)((,|\.)\d+)?)(\s?(миллион(а|ов)?|миллиард(а|ов)?|млн|млрд|тысячи|тыс|тысяч|сотен|сотни|k|к)\.?\s?)?|((\d+\s\d+\s\d+|\d+\s\d+|\d+)((,|\.)\d+)?(\s?(миллион(а|ов)?|миллиард(а|ов)?|млн|млрд|тысячи|тыс|тысяч|сотен|сотни|k|к)\.?\s?)?(\s?(BTC|биткоин(а|ов)?|биток|битк(а|ов)?))))/i
};
let currency = {
    USD_EUR: 0,
    USD_UAH: 0,
    USD_RUB: 0,
    USD_BYN: 0,
    USD_BTC: 0,
    EUR_USD: 0,
    EUR_UAH: 0,
    EUR_RUB: 0,
    EUR_BYN: 0,
    EUR_BTC: 0,
    UAH_USD: 0,
    UAH_EUR: 0,
    UAH_RUB: 0,
    UAH_BYN: 0,
    UAH_BTC: 0,
    RUB_USD: 0,
    RUB_EUR: 0,
    RUB_UAH: 0,
    RUB_BYN: 0,
    RUB_BTC: 0,
    BYN_USD: 0,
    BYN_EUR: 0,
    BYN_UAH: 0,
    BYN_RUB: 0,
    BYN_BTC: 0,
    BTC_USD: 0,
    BTC_EUR: 0,
    BTC_UAH: 0,
    BTC_RUB: 0,
    BTC_BYN: 0
};


app.post('/event', function(req, res) {
    let text = req.body.text.toLowerCase();
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
            else if(text.match(currency_RegExp.b)!=null){
                v = text.match(currency_RegExp.b)[0];
                c = "BYN";
                callback(null, v, c);
            }
            else if(text.match(currency_RegExp.btc)!=null){
                v = text.match(currency_RegExp.btc)[0];
                c = "BTC";
                callback(null, v, c);
            }
            else callback(true);
        },
        function(v, c, callback){
            // remove keywords with 'к' symbols
            v = v.replace(/бакс/gi, '')
            v = v.replace(/(биткоин(а|ов)?|биток|битк(а|ов)?)/gi, '')

            let val = v.replace(/[^\d(,|\.)-]/g, '');
            val = parseFloat(val);
            if(~v.indexOf("k")) val = val * 1000;
            else if(~v.indexOf("к")) val = val * 1000;
            else if(~v.indexOf("млрд")) val = val * 1000000000;
            else if(~v.indexOf("миллиард")) val = val * 1000000000;
            else if(~v.indexOf("миллион")) val = val * 1000000;
            else if(~v.indexOf("млн")) val = val * 1000000;
            else if(~v.indexOf("тысяч")) val = val * 1000;
            else if(~v.indexOf("тыс")) val = val * 1000;
            else if(~v.indexOf("сотен")) val = val * 100;
            else if(~v.indexOf("сотни")) val = val * 100;
            callback(null, val, c);
        },
        function(v, c, callback){
            let res_1 = 0,
                res_2 = 0,
                res_3 = 0,
                res_4 = 0,
                res_5 = 0,
                cur_1 = 0,
                cur_2 = 0,
                cur_3 = 0,
                cur_4 = 0,
                cur_5 = 0,
                name_1 = 0,
                name_2 = 0,
                name_3 = 0,
                name_4 = 0,
                name_5 = 0;

            if(c=="USD"){
                res_1 = ((currency.USD_EUR*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                res_2 = ((currency.USD_UAH*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                res_3 = ((currency.USD_RUB*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                res_4 = ((currency.USD_BYN*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                res_5 = ((currency.USD_BTC*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                cur_1 = currency.USD_EUR;
                cur_2 = currency.USD_UAH;
                cur_3 = currency.USD_RUB;
                cur_4 = currency.USD_BYN;
                cur_5 = currency.USD_BTC;
                name_1 = "EUR";
                name_2 = "UAH";
                name_3 = "RUB";
                name_4 = "BYN";
                name_5 = "BTC";
            }
            else if(c=="EUR"){
                res_1 = ((currency.EUR_USD*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                res_2 = ((currency.EUR_UAH*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                res_3 = ((currency.EUR_RUB*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                res_4 = ((currency.EUR_BYN*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                res_5 = ((currency.EUR_BTC*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                cur_1 = currency.EUR_USD;
                cur_2 = currency.EUR_UAH;
                cur_3 = currency.EUR_RUB;
                cur_4 = currency.EUR_BYN;
                cur_5 = currency.EUR_BTC;
                name_1 = "USD";
                name_2 = "UAH";
                name_3 = "RUB";
                name_4 = "BYN";
                name_5 = "BTC";
            }
            else if(c=="UAH"){
                res_1 = ((currency.UAH_USD*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                res_2 = ((currency.UAH_EUR*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                res_3 = ((currency.UAH_RUB*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                res_4 = ((currency.UAH_BYN*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                res_5 = ((currency.UAH_BTC*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                cur_1 = currency.UAH_USD;
                cur_2 = currency.UAH_EUR;
                cur_3 = currency.UAH_RUB;
                cur_4 = currency.UAH_BYN;
                cur_5 = currency.UAH_BTC;
                name_1 = "USD";
                name_2 = "EUR";
                name_3 = "RUB";
                name_4 = "BYN";
                name_5 = "BTC";
            }
            else if(c=="RUB"){
                res_1 = ((currency.RUB_USD*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                res_2 = ((currency.RUB_EUR*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                res_3 = ((currency.RUB_UAH*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                res_4 = ((currency.RUB_BYN*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                res_5 = ((currency.RUB_BTC*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                cur_1 = currency.RUB_USD;
                cur_2 = currency.RUB_EUR;
                cur_3 = currency.RUB_UAH;
                cur_4 = currency.RUB_BYN;
                cur_5 = currency.RUB_BTC;
                name_1 = "USD";
                name_2 = "EUR";
                name_3 = "UAH";
                name_4 = "BYN";
                name_5 = "BTC";
            }
            else if(c=="BYN"){
                res_1 = ((currency.BYN_USD*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                res_2 = ((currency.BYN_EUR*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                res_3 = ((currency.BYN_UAH*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                res_4 = ((currency.BYN_RUB*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                res_5 = ((currency.BYN_BTC*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                cur_1 = currency.BYN_USD;
                cur_2 = currency.BYN_EUR;
                cur_3 = currency.BYN_UAH;
                cur_4 = currency.BYN_RUB;
                cur_5 = currency.BYN_BTC;
                name_1 = "USD";
                name_2 = "EUR";
                name_3 = "UAH";
                name_4 = "RUB";
                name_5 = "BTC";
            }
            else if(c=="BTC"){
                res_1 = ((currency.BTC_USD*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                res_2 = ((currency.BTC_EUR*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                res_3 = ((currency.BTC_UAH*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                res_4 = ((currency.BTC_RUB*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                res_5 = ((currency.BTC_BYN*parseFloat(v)).toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')).replace(".00", "");
                cur_1 = currency.BTC_USD;
                cur_2 = currency.BTC_EUR;
                cur_3 = currency.BTC_UAH;
                cur_4 = currency.BTC_RUB;
                cur_5 = currency.BTC_BYN;
                name_1 = "USD";
                name_2 = "EUR";
                name_3 = "UAH";
                name_4 = "RUB";
                name_5 = "BYN";
            }

            let pretty_value = v.toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ').replace(".00", "");

            let responseText = "**_"+req.body.username+"_** упомянул " + pretty_value + " "+ c + "\\n\\n"+
                "| "+c+"      | "+v+"     | Курсы                | \\n"+
                "|:----------:|:---------:|:--------------------:|\\n"+
                "| "+name_1+" | "+res_1+" | "+cur_1.toFixed(2)+" |\\n"+
                "| "+name_2+" | "+res_2+" | "+cur_2.toFixed(2)+" |\\n"+
                "| "+name_3+" | "+res_3+" | "+cur_3.toFixed(2)+" |\\n"+
                "| "+name_4+" | "+res_4+" | "+cur_4.toFixed(2)+" |\\n"+
                "| "+name_5+" | "+res_5+" | "+cur_5.toFixed(2)+" |";

            callback(null, responseText);
        }
    ], function (err, result) {
        if(err) res.status(417).end();
        else {
            res.status(201);
            res.json({
                bot: "money-bot",
                text: result
            });
            res.end();
        }
    });
});
app.all('/info', function(req, res) {
    res.json({
        author: 'exelban',
        info: 'Если в сообщение была упомянутая какая-то валюта (USD, EUR, UAH, RUB, BTC), бот конвертирует ее в доллары, евро, грн, руб.'
    });
    res.end();
});


function get_currency(){
    waterfall([
        function(callback){
            request("http://free.currencyconverterapi.com/api/v3/convert?q=USD_EUR,USD_UAH", {timeout: 3000}, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    let results = JSON.parse(body).results;
                    let quotes = Object.keys(results).map(function (key) { return results[key]; });
                    currency.USD_EUR = quotes[0].val;
                    currency.USD_UAH = quotes[1].val;

                    callback(null);
                }
                else {
                    callback(true);
                }
            });
        },
        function(callback){
            request("http://free.currencyconverterapi.com/api/v3/convert?q=USD_RUB,USD_BYN", {timeout: 3000}, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    let results = JSON.parse(body).results;
                    let quotes = Object.keys(results).map(function (key) { return results[key]; });
                    currency.USD_RUB = quotes[0].val;
                    currency.USD_BYN = quotes[1].val;

                    currency.EUR_USD = 1 / currency.USD_EUR;
                    currency.EUR_UAH = currency.EUR_USD * currency.USD_UAH;
                    currency.EUR_RUB = currency.EUR_USD * currency.USD_RUB;
                    currency.EUR_BYN = currency.EUR_USD * currency.USD_BYN;

                    currency.UAH_USD = 1 / currency.USD_UAH;
                    currency.UAH_EUR = currency.UAH_USD * currency.USD_EUR;
                    currency.UAH_RUB = currency.UAH_USD * currency.USD_RUB;
                    currency.UAH_BYN = currency.UAH_USD * currency.USD_BYN;

                    currency.RUB_USD = 1 / currency.USD_RUB;
                    currency.RUB_EUR = currency.RUB_USD * currency.USD_EUR;
                    currency.RUB_UAH = currency.RUB_USD * currency.USD_UAH;
                    currency.RUB_BYN = currency.RUB_USD * currency.USD_BYN;

                    currency.BYN_USD = 1 / currency.USD_BYN;
                    currency.BYN_EUR = currency.BYN_USD * currency.USD_EUR;
                    currency.BYN_UAH = currency.BYN_USD * currency.USD_UAH;
                    currency.BYN_RUB = currency.BYN_USD * currency.USD_RUB;

                    callback(null);
                }
                else callback(true);
            });
        },
        function(callback){
            request("http://free.currencyconverterapi.com/api/v3/convert?q=USD_BTC", {timeout: 3000}, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    let results = JSON.parse(body).results;
                    let quotes = Object.keys(results).map(function (key) { return results[key]; });
                    currency.USD_BTC = quotes[0].val;

                    currency.BTC_USD = 1 / currency.USD_BTC;
                    currency.BTC_EUR = currency.BTC_USD * currency.USD_EUR;
                    currency.BTC_UAH = currency.BTC_USD * currency.USD_UAH;
                    currency.BTC_RUB = currency.BTC_USD * currency.USD_RUB;
                    currency.BTC_BYN = currency.BTC_USD * currency.USD_BYN;
                    currency.EUR_BTC = 1 / currency.BTC_EUR;
                    currency.UAH_BTC = 1 / currency.BTC_UAH;
                    currency.RUB_BTC = 1 / currency.BTC_RUB;
                    currency.BYN_BTC = 1 / currency.BTC_BYN;

                    console.log('currencies updated.');

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


cron.schedule('56 * * * *', get_currency);
get_currency();
app.listen(8080);