package rt.bot.weatherbot

import org.apache.http.client.methods.HttpGet
import org.apache.http.impl.client.HttpClients
import rt.bot.weatherbot.openweather.OpenWeatherData
import java.io.InputStream
import java.io.InputStreamReader
import com.fasterxml.jackson.jr.ob.JSON.std as json

/**
 * @author Dmitrii Kniazev
 * @since 05.02.2017
 */
class WeatherServiceImpl : IWeatherService {

    private val client = HttpClients.createDefault()

    override fun getWeather(cityName: String): OpenWeatherData? {
        val request = "http://api.openweathermap.org/data/2.5/weather?q=$cityName" +
                "&appid=3691aaeb837f49f145b9f22d8e2de0bd" +
                "&units=metric" +
                "&lang=ru"
        val httpGet = HttpGet(request)
        val response = client.execute(httpGet)

        response.use { response ->
            val body = read(response.entity.content)
            return json.beanFrom(OpenWeatherData::class.java, body)
        }
    }

    private companion object WeatherServiceImpl {
        private fun read(input: InputStream): String {
            return InputStreamReader(input).use(InputStreamReader::readText)
        }
    }
}
