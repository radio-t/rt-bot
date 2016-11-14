package com.m11;

import org.json.JSONObject;
import org.json.JSONString;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;

import java.lang.reflect.Array;

import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

@RestController
public class RtbotController {

        @RequestMapping(value = "/info", method=GET)
        public String info () throws Exception {
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("author", "Mike Shemanskiy [@shamanskiy11](https://twitter.com/shamanskiy11)");
            jsonObject.put("info", "wiki-bot return first url form wiki search engine");
            jsonObject.put("commands", "['wiki-bot java8', 'wiki-bot rest']");
            return jsonObject.toString();
        }


    @RequestMapping(value = "/event", method=POST)
    public String event(@RequestBody Bot bot, HttpServletResponse rsp) throws Exception {

        String botName = "wiki-bot";
        WikiHandler wikiHandler = new WikiHandler();

        String wikiUrl = wikiHandler.getWikiUrl(bot.getText());
        String result = wikiHandler.send(wikiUrl);
        //String result = "";

        if (!result.isEmpty()){
            rsp.setStatus(HttpStatus.CREATED.value());
            return result;
        } else {
            rsp.setStatus(HttpStatus.EXPECTATION_FAILED.value());
            return "I don't know, ask Bobuk!";
        }
    }
}
