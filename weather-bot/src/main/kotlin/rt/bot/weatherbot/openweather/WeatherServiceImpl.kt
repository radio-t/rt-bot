package rt.bot.weatherbot.openweather

import org.apache.http.client.methods.HttpGet
import org.apache.http.impl.client.HttpClients
import rt.bot.weatherbot.BotResponse
import java.io.InputStream
import java.io.InputStreamReader
import com.fasterxml.jackson.jr.ob.JSON.std as json

/**
 * @author Dmitrii Kniazev
 * @since 05.02.2017
 */
object WeatherServiceImpl : IWeatherService {

    private val client = HttpClients.createDefault()

    override fun getWeather(cityName: String): BotResponse {
        val request = "http://api.openweathermap.org/data/2.5/weather?q=$cityName" +
                "&appid=3691aaeb837f49f145b9f22d8e2de0bd" +
                "&units=metric" +
                "&lang=ru"
        val httpGet = HttpGet(request)
        val response = client.execute(httpGet)

        response.use { response ->
            val body = read(response.entity.content)
            val weather = json.beanFrom(WeatherData::class.java, body)
            return BotResponse("")
        }
    }

    private fun read(input: InputStream): String {
        return InputStreamReader(input).use(InputStreamReader::readText)
    }

}
