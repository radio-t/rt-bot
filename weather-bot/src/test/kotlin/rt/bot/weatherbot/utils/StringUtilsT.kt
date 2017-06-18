package rt.bot.weatherbot.utils

import org.junit.Test
import kotlin.test.assertEquals

/**
 * @author Dmitrii Kniazev
 * @since 10.02.2017
 */
class StringUtilsT {
    @Test fun testTrim() {
        var testStr: String? = null
        assertEquals("", StringUtils.trim(testStr))

        testStr = "abc defg"
        assertEquals("abc defg", StringUtils.trim(testStr))

        testStr = "  abc defg "
        assertEquals("abc defg", StringUtils.trim(testStr))
    }

    @Test fun testParseRequest() {
        var request = "!weather:LoNdon"
        assertEquals("london", StringUtils.parseRequest(request))

        request = "!weather:  New     York   "
        assertEquals("new+york", StringUtils.parseRequest(request))

        request = "!weather: ny"
        assertEquals("ny", StringUtils.parseRequest(request))

        request = "!weather:  NeW-----yorK   "
        assertEquals("new-york", StringUtils.parseRequest(request))

        request = "!weather:  -new york   "
        assertEquals("", StringUtils.parseRequest(request))

        request = "!weather: york 23   "
        assertEquals("", StringUtils.parseRequest(request))

        request = "!weather: лондон   "
        assertEquals("", StringUtils.parseRequest(request))

        request = "!weather:  m   "
        assertEquals("", StringUtils.parseRequest(request))

        request = "some text"
        assertEquals("", StringUtils.parseRequest(request))
    }

}
