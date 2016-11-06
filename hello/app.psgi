use Mojolicious::Lite;
use JSON::PP;

our $BOT_NAME_ID = 'hello';

hook before_render => sub {
    my ($c, $args) = @_;

    my $status = $args->{status} // '';

    if ($status eq 404) {
        $args->{json} = {
            success => JSON::PP::false,
            error_message => 'not found',
        };
    }

    if ($status eq 500) {
        $args->{json} = {
            success => JSON::PP::false,
            error_message => 'internal error',
        };
    }
};

post '/event' => sub {
    my ($c) = @_;

    my $text = '';
    eval {
        my $parsed_body = decode_json $c->req->body();
        $text = $parsed_body->{text};
    };

    if ($text =~ /^привет|hello|hi\z/i) {

        my @words = (
            'Привет!',
            'Hello!',
            'Hi!',
            'Доброго времени суток!',
        );

        $c->render(
            status => 201,
            json => {
                text => $words[rand(@words)],
                bot => $BOT_NAME_ID,
            }
        );
    } else {
        $c->render(
            status => 417,
            text => '',
        );
    }

};

app->start;
