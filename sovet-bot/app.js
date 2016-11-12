var express = require('express');
var bodyParser = require('body-parser');
var rp = require('request-promise');

var app = express(), port = 8080;

/*
{text: сообщение, username: id пользователя, display_name: имя пользователя} 
*/

app
.use(bodyParser.urlencoded({ extended: false }))
.use(bodyParser.json())

.post('/event', function(req, res, next) {
	var msg = req.body;

	if(/совет|грей|грэй|gray|как\sжить|подскажите|\?/i.test(msg.text)) {
		rp('http://fucking-great-advice.ru/api/random')
		.then(function(r) {
			var sovet = 'Совета нет(';
			try {
				r = JSON.parse(r);
				sovet = `##[Совет для: ${msg.username}] \`${r.text}\``;
			} catch(e) {};

			var data = {text: sovet, bot: "советчик"};

			res
			.status(201)
			.json(data)
			.end();

		})
		.catch(function() {
			res.sendStatus(417);
		});
	} else {
		 res.sendStatus(417);
	}

});

var server = app.listen(port);

server.on('error', function() {
  console.log("Error connection");
});