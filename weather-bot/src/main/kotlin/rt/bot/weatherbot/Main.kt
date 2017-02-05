package rt.bot.weatherbot

import com.fasterxml.jackson.jr.ob.JSONObjectException
import org.eclipse.jetty.http.HttpStatus
import org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON
import org.slf4j.LoggerFactory
import spark.Spark
import com.fasterxml.jackson.jr.ob.JSON.std as json

/**
 * @author Dmitrii Kniazev
 * @since 05.02.2017
 */

private const val BOT_NAME = "weather-bot"
private const val AUTHOR_NAME = "mylog00"
private const val COMMANDS = "[TODO]"

private val LOG = LoggerFactory.getLogger("Main.class")

fun main(args: Array<String>) {

    Spark.get("/info") { req, res ->
        res.type(APPLICATION_JSON.toString())
        "{author: ${AUTHOR_NAME}, info: ${BOT_NAME}, commands: ${COMMANDS}}"
    }

    Spark.post("/event") { req, res ->

        res.type(APPLICATION_JSON.toString())

        val eventJson = trim(res.body())
        if (eventJson != "") {
            try {
                val event = json.beanFrom(Event::class.java, eventJson)
                res.status(HttpStatus.CREATED_201)
                //TODO
                val response = Response("answer", BOT_NAME)
                return@post json.asString(response)
            } catch (ex: JSONObjectException) {
                ex.printStackTrace()
                LOG.error("Can't parse: $eventJson")
            }
        }
        res.status(HttpStatus.EXPECTATION_FAILED_417)
        return@post null
    }

}

private fun trim(str: String?): String {
    if (str == null) return ""
    return str.trim()
}
