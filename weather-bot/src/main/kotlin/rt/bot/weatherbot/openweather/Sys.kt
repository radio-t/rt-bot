package rt.bot.weatherbot.openweather

/**
 * @author Dmitrii Kniazev
 * @since 07.02.2017
 */
internal class Sys {
    /**Internal parameter*/
    var type: Int = 0
    /**Internal parameter*/
    var id: Int = 0
    /**Internal parameter*/
    var message: Double = 0.0
    /** Country code (GB, JP etc.)*/
    var country: String? = null
    /**Sunrise time, unix, UTC*/
    var sunrise: Long = 0
    /**Sunset time, unix, UTC*/
    var sunset: Long = 0
}
