import unittest
from unittest import TestCase, mock

from flask import json

from .timezone_bot import app


class TimeZoneBotTestCase(TestCase):
    """Test case for timezone_bot"""

    def setUp(self):
        self.client = app.test_client()

        self.url = '/event'

    def test_event_with_no_data_sent(self):
        """Ensure that 417 status code returns when no data sent"""
        resp = self.client.post(self.url)
        self.assertEquals(resp.status_code, 417)

    def test_event_with_empty_dict_sent(self):
        """Ensure that 417 status code returns when empty dict sent"""
        resp = self.client.post(self.url, data=json.dumps({}))
        self.assertEquals(resp.status_code, 417)

    def test_some_random_message(self):
        """Ensure that bot will not say if shouldn't"""
        resp = self.client.post(self.url,
                                data=json.dumps({'text': 'Hello world'}))
        self.assertEquals(resp.status_code, 417)

    @mock.patch('googlemaps.Client.places')
    def test_correct_message_for_bot(self, places):
        """Ensure that bot will try to answer if 'время в/во <cityname>'
        obtained from request data
        """
        resp = self.client.post(self.url, data=json.dumps({
            'text': 'время в красноярске'
        }))
        self.assertEquals(resp.status_code, 201)
        places.assert_called_with('красноярске')
        dict_data = json.loads(resp.data)
        self.assertEquals(dict_data['text'], 'Не могу найти город красноярске')

    @mock.patch('googlemaps.Client.places', return_value={
        'status': 'OK',
        'results': [
            {
                'geometry': {
                    'location': 'Location'
                }
            }
        ]
    })
    @mock.patch('googlemaps.Client.timezone')
    def test_problems_with_timezone(self, timezone, places):
        """Ensure that if timezone is not loaded correctly, bot answers that
        can't obtain and load timezone data
        """
        resp = self.client.post(self.url, data=json.dumps({
            'text': 'время в красноярске'
        }))
        timezone.assert_called_with('Location')
        self.assertEquals(resp.status_code, 201)
        dict_data = json.loads(resp.data)
        self.assertEquals(dict_data['text'], 'Не могу получить данные о '
                                             'часовом поясе')

    @mock.patch('googlemaps.Client.places', return_value={
        'status': 'OK',
        'results': [
            {
                'geometry': {
                    'location': 'Location'
                }
            }
        ]
    })
    @mock.patch('googlemaps.Client.timezone', return_value={
        'status': 'OK',
        'timeZoneId': 'Asia/Krasnoyarsk'
    })
    def test_timezone_obtained(self, timezone, places):
        """Ensure that if timezone correctly obtained, bot says time in this
        timezone
        """
        resp = self.client.post(self.url, data=json.dumps({
            'text': 'время в красноярске'
        }))
        self.assertEquals(resp.status_code, 201)
        dict_data = json.loads(resp.data)
        self.assertIn('Местное время в красноярске сейчас', dict_data['text'])

if __name__ == '__main__':
    unittest.main()
