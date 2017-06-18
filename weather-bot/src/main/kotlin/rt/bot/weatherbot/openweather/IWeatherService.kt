package rt.bot.weatherbot.openweather

import rt.bot.weatherbot.BotResponse

/**
 * @author Dmitrii Kniazev
 * @since 06.02.2017
 */
interface IWeatherService {
    fun getWeather(cityName: String): BotResponse?
}
