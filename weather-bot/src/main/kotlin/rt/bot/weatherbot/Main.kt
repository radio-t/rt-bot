package rt.bot.weatherbot

import com.fasterxml.jackson.core.JsonParseException
import com.fasterxml.jackson.jr.ob.JSONObjectException
import org.eclipse.jetty.http.HttpStatus
import org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON
import org.slf4j.LoggerFactory
import rt.bot.weatherbot.openweather.IWeatherService
import rt.bot.weatherbot.openweather.WeatherServiceImpl
import spark.Spark
import com.fasterxml.jackson.jr.ob.JSON.std as json

/**
 * @author Dmitrii Kniazev
 * @since 05.02.2017
 */

class Main {

    companion object Main {
        const val BOT_NAME = "weather-bot"
        const val AUTHOR_NAME = "mylog00"
        private const val PREFIX = "@weather:"
        private const val COMMANDS = "[$PREFIX" + "cityname]"

        private val LOG = LoggerFactory.getLogger(Main::class.java)

        private val SERVICE: IWeatherService = WeatherServiceImpl

        private val JSON_TYPE = APPLICATION_JSON.toString()
        private val REGEX = Regex("[a-z+-]")

        @JvmStatic fun main(args: Array<String>) {

            Spark.get("/info") { req, res ->
                res.type(JSON_TYPE)
                return@get "{author:$AUTHOR_NAME,info:$BOT_NAME,commands: $COMMANDS}"
            }

            Spark.post("/event") { req, res ->
                val eventJson = trim(req.body())
                if (eventJson != "") {
                    try {
                        val event = json.beanFrom(Event::class.java, eventJson)
                        val cityName = parseRequest(event.text)
                        if (cityName != "") {
                            val response = SERVICE.getWeather(cityName)
                            res.type(JSON_TYPE)
                            res.status(HttpStatus.CREATED_201)
                            return@post json.asString(response)
                        }

                    } catch (ex: JSONObjectException) {
                        LOG.error("Can't process: $eventJson", ex.cause)
                    } catch (ex: JsonParseException) {
                        LOG.error("Can't parse: $eventJson", ex.cause)
                    } catch (ex: Exception) {
                        LOG.error("Can't process request", ex.cause)
                    }
                }
                res.status(HttpStatus.EXPECTATION_FAILED_417)
                return@post ""
            }

        }

        private fun trim(str: String?): String {
            if (str == null) return ""
            return str.trim()
        }

        private fun parseRequest(reqStr: String): String {
            if (reqStr.startsWith(PREFIX, true)) {
                val cityName = reqStr.drop(PREFIX.length)
                        .trim()
                        .toLowerCase()
                        .replace(" ", "+")
                if (cityName.length > 1 &&
                        cityName.matches(REGEX)) {
                    return cityName
                }
            }
            return ""
        }
    }
}
