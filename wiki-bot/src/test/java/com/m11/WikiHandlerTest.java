package com.m11;

import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;

public class WikiHandlerTest {

    private static WikiHandler wikiHandler;

    @BeforeClass
    public static void setUp(){
        wikiHandler = new WikiHandler();
    }

    @Test
    public void emptyUrl() throws Exception {



        String empty = wikiHandler.getWikiUrl("");

        Assert.assertEquals("", empty);

        String empty2 = wikiHandler.getWikiUrl("wiki ");

        Assert.assertEquals("", empty2);
    }

    @Test
    public void validUrl() throws Exception {

        String validUrl = wikiHandler.getWikiUrl("wikibarak obama");

        Assert.assertNotNull(validUrl);

        String validUrl2 = wikiHandler.getWikiUrl("barak obama");

        Assert.assertNotNull(validUrl2);
    }
}
