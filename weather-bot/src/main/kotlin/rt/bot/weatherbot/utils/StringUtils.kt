package rt.bot.weatherbot.utils

import rt.bot.weatherbot.Main

/**
 * @author Dmitrii Kniazev
 * @since 10.02.2017
 */
object StringUtils {
    private val REGEX = Regex("[a-z- ]")

    fun trim(str: String?): String {
        if (str == null) return ""
        return str.trim()
    }

    fun parseRequest(reqStr: String): String {
        if (reqStr.startsWith(Main.PREFIX, true)) {
            val cityName = reqStr.drop(Main.PREFIX.length)
                    .trim()
                    .toLowerCase()
            if (cityName.length > 1 &&
                    cityName.matches(REGEX)) {
                return cityName.replace(" ", "+")
            }
        }
        return ""
    }
}
