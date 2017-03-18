package rt.bot.weatherbot

import com.fasterxml.jackson.core.JsonParseException
import com.fasterxml.jackson.jr.ob.JSONObjectException
import org.eclipse.jetty.http.HttpStatus
import org.eclipse.jetty.http.MimeTypes.Type.APPLICATION_JSON
import org.slf4j.LoggerFactory
import rt.bot.weatherbot.openweather.IWeatherService
import rt.bot.weatherbot.openweather.WeatherServiceImpl
import rt.bot.weatherbot.utils.StringUtils
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
        const val TEST_REQUEST = "!weather:!status"
        const val PREFIX = "!weather:"
        private const val COMMANDS = "[$PREFIX" + "cityname]"

        private val LOG = LoggerFactory.getLogger(Main::class.java)

        private val SERVICE: IWeatherService = WeatherServiceImpl

        private val JSON_TYPE = APPLICATION_JSON.toString()

        private val TEST_RESPONSE = BotResponse("weather-bot work fine")

        @JvmStatic fun main(args: Array<String>) {
            Spark.port(8080) // Spark will run on port 8080

            Spark.get("/info") { req, res ->
                res.type(JSON_TYPE)
                return@get "{author:$AUTHOR_NAME, info:$BOT_NAME, commands:$COMMANDS}"
            }

            Spark.post("/event") { req, res ->
                val eventJson = StringUtils.trim(req.body())
                if (eventJson != "") {
                    try {
                        val event = json.beanFrom(Event::class.java, eventJson)
                        if (TEST_REQUEST == event.text) {
                            res.type(JSON_TYPE)
                            res.status(HttpStatus.CREATED_201)
                            return@post json.asString(TEST_RESPONSE)
                        }
                        val cityName = StringUtils.parseRequest(event.text)
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
                Spark.halt(HttpStatus.EXPECTATION_FAILED_417)
            }
            printInfo()
        }

        private fun printInfo() {
            println("Weather-bot running successfully")
            println(":: Spark ::             (v2.5.4)")
        }
    }
}
