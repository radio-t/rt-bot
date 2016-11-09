package com.m11;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;

import static org.springframework.web.bind.annotation.RequestMethod.POST;

@RestController
public class RtbotController {
    @RequestMapping(value = "/event", method=POST)
    public Bot event(
            @RequestParam("text") String text,
            @RequestParam("username") String username,
            @RequestParam("display_name") String display_name,
            HttpServletResponse rsp
    ) throws Exception {

        String botName = "RT_WIKI";
        WikiHandler wikiHandler = new WikiHandler();

        String wikiUrl = wikiHandler.getWikiUrl(text);
        String result = wikiHandler.send(wikiUrl);

        if (!result.isEmpty()){
            rsp.setStatus(HttpStatus.CREATED.value());
            return new Bot(result, botName);
        } else {
            rsp.setStatus(HttpStatus.EXPECTATION_FAILED.value());
            return new Bot("I don't know, ask Bobuk!", botName);
        }
    }
}
