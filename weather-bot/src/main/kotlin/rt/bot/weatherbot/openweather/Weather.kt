package rt.bot.weatherbot.openweather

/**
 * @author Dmitrii Kniazev
 * @since 07.02.2017
 */
internal class Weather {
    /**Weather condition id*/
    var id: Int = 0
    /**Group of weather parameters (Rain, Snow, Extreme etc.)*/
    var main: String? = null
    /**Weather condition within the group*/
    var description: String? = null
    /**Weather icon id*/
    var icon: String? = null
}
