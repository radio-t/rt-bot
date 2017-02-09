package rt.bot.weatherbot.openweather

import java.util.Collections


/**
 * @author Dmitrii Kniazev
 * @since 06.02.2017
 */
internal class WeatherData {
    /**City geo location*/
    var coord: Geolocation? = null
    /**Weather type*/
    var weather: List<Weather> = Collections.emptyList()
    /**Internal parameter*/
    var base: String? = null
    /**Weather metrics*/
    var main: Metrics? = null
    /**Visibility, meter*/
    var visibility: Int = 0
    /**Wind metrics*/
    var wind: Wind? = null
    /**Cloudiness*/
    var clouds: Clouds? = null
    /**Time of data calculation, unix, UTC*/
    var dt: Long = 0
    /**System data*/
    var sys: Sys? = null
    /**City ID*/
    var id: Long = 0
    /**City name*/
    var name: String? = null
    /**Internal parameter*/
    var cod: Int = 0

}

