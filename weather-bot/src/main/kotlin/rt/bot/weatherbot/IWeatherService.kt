package rt.bot.weatherbot

import rt.bot.weatherbot.openweather.OpenWeatherData

/**
 * @author Dmitrii Kniazev
 * @since 06.02.2017
 */
interface IWeatherService {
    fun getWeather(cityName: String): OpenWeatherData?
}
