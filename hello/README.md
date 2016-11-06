# hello

Очень простой бот.

Если видит что-то похожее на приветствие, то отвечает в ответ.

Пример сообщения на которое бот отвечает:

    $ curl \
        -v \
        -X POST \
        -d '{"text":"Привет","username":123,"display_name":"login"}' \
        http://docker:8080/event

Бот отвечает статусом 201 и в ответе json:

    {"bot":"hello","text":"Hello!"}

Пример сообщения на которое бот не знает что ответчать и отвечает статусом 417
с пустым body:

    $ curl \
        -v \
        -X POST \
        -d '{"text":"Sample text","username":123,"display_name":"login"}' \
        http://docker:8080/event
