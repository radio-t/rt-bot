package rt.bot.weatherbot

/**
 * @author Dmitrii Kniazev
 * @since 06.02.2017
 */
interface IWeatherService {
    fun getWeather(cityName: String): String
}
