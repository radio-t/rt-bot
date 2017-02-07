package rt.bot.weatherbot.openweather

/**
 * @author Dmitrii Kniazev
 * @since 07.02.2017
 */
class Metrics {
    /**Temperature. Unit Default: Kelvin*/
    var temp: Int = 0
    /**
     * Atmospheric pressure
     * (on the sea level, if there is no sea_level or grnd_level data), hPa
     */
    var pressure: Int = 0
    /**Humidity, %*/
    var humidity: Int = 0
    /**
     * Minimum temperature at the moment.
     * This is deviation from current temp that is possible for large
     * cities and megalopolises geographically expanded
     * (use these parameter optionally).
     * Unit Default: Kelvin
     */
    var temp_min: Int = 0
    /**
     * Maximum temperature at the moment.
     * This is deviation from current temp that is possible for large
     * cities and megalopolises geographically expanded
     * (use these parameter optionally).
     * Unit Default: Kelvin
     */
    var temp_max: Int = 0
    /**Atmospheric pressure on the sea level, hPa*/
    var sea_level: Int = 0
    /**Atmospheric pressure on the ground level, hPa*/
    var grnd_level: Int = 0
}
