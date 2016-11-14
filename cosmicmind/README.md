# Cosmicmind бот
Связывается с вселенским интелектом чтобы узнать ответит на любой вопрос.
Решить такую задачу можно только на Haskell, конечно же.

## Пример

	> http get localhost:8080/event text="cosmicmind, камера щелкает динамиком?" username:=123 display_name="someuser"
	HTTP/1.1 201 Created
	Content-Type: application/json; charset=utf-8
	Date: Mon, 14 Nov 2016 20:04:59 GMT
	Server: Warp/3.2.9
	Transfer-Encoding: chunked

	{
		"name": "Cosmicmind",
		"text": "someuser, oтвет на ваш вопрос \"cosmicmind, щелкает динамиком?\": Нет."
	}

Q.E.D.
