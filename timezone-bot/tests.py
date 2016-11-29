import unittest
from unittest import TestCase

from .timezone_bot import app


class TimeZoneBotTestCase(TestCase):
    """Test case for timezone_bot"""

    def setUp(self):
        self.client = app.test_client()

    def test_event(self):
        """Ensure that 417 status code returns when no data sent"""
        resp = self.client.post('/event')
        self.assertEquals(resp.status_code, 417)


if __name__ == '__main__':
    unittest.main()
