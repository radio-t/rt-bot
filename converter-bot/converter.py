from db.length.length import length
import re

#
#
#
# def analyse_message(message):
#     DB['length'] = length


class Converter(object):
    units = {}
    aliases = {}
    categories = []
    value = None
    DB = {}
    LANGUAGE = 'ru'

    def __init__(self):
        self.units['length'] = length
        self.map_aliases()

    def map_aliases(self):
        for category, data in self.units.items():
            for unit, items in data['units'].items():
                for alias in items['languages'][self.LANGUAGE]['aliases']:
                    self.aliases[alias] = {
                        'unit': unit,
                        'category': category,
                        'from': items['from'],
                        'to': items['to'],
                        'name': items['languages'][self.LANGUAGE]['name']
                    }

    def analyse(self, message):
        print (message)
        # print (self.aliases)
        self.value = self.get_value(message)
        print(self.value)

    def get_value(self, message):
        result = re.match(r'^\s*([+-]?((?=\.)\.\d+|\d+(?:[\.,]?\d+)?))', message)
        if result is not None:
            value = result.group(0)
            return value.replace(',', '.')
        else:
            return None
