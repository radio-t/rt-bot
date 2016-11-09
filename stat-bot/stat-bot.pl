use Mojolicious::Lite;
use JSON;
use lib './lib';

use StatBot;

helper bot => sub { state $bot = StatBot->new };

our $BOT_NAME_ID = 'stat-bot';

post '/event' => sub {
    my $c = shift;

    my $data = {};

    eval {
        $data = from_json( $c->req->body, { 'utf8' => 1 } ) || {};
    };

    my $response = $c->bot->catch_action( $data );
    if ( $response ) {
        $c->render(
            status => 201,
            json    => {
                text    => $response,
                bot     => $BOT_NAME_ID,
            }
        );
    } else {
        $c->render(
            status  => 417,
            text    => '',
        );
    }

};

app->start('daemon', '-l', 'http://*:8080');