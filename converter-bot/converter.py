from db.length.length import length
from db.mass.mass import mass
from db.temperature.temperature import temperature
from db.time.time import time
from db.volume.volume import volume
from db.data.data import data as data_db
import re


class Converter(object):
    units = {}
    aliases = {}
    categories = []
    value = None
    DB = {}
    LANGUAGE = "ru"

    def __init__(self):
        self.units["length"] = length
        self.units["mass"] = mass
        self.units["temperature"] = temperature
        self.units["time"] = time
        self.units["volume"] = volume
        self.units["data"] = data_db
        self.map_aliases()

    def map_aliases(self):
        for category, data in self.units.items():
            for unit, items in data["units"].items():
                for alias in items["languages"]["ru"]["aliases"]:
                    self.aliases[alias] = {
                        "unit": unit,
                        "category": category,
                        "from": items["from"],
                        "to": items["to"],
                        "name": items["languages"]["ru"]["name"]
                    }
                for alias in items["languages"]["en"]["aliases"]:
                    self.aliases[alias] = {
                        "unit": unit,
                        "category": category,
                        "from": items["from"],
                        "to": items["to"],
                        "name": items["languages"]["en"]["name"]
                    }

    def analyse(self, message):
        self.value = self.get_value(message)
        if not self.value:
            return False, {}

        units = self.fetch_aliases(message)
        print (units)
        if len(units) == 0:
            return False, {}
        data = self.process_unit(units)
        return True, {"value": self.value, "unit": units[0], "data": data}

    def process_unit(self, units):
        current = self.aliases[units[0]]
        original = eval(current["from"].format(n=self.value))
        data = []
        if len(units) == 2:
            current_2 = self.aliases[units[1]]
            if current["category"] == current_2["category"] and current["unit"] != current_2["unit"]:
                to = eval(current_2["to"].format(n=original))
                to = round(to, 3)
                data.append({"value": to, "name": self.units[self.aliases[units[0]]["category"]]["units"]
                [current_2["unit"]]["languages"][self.LANGUAGE]["name"]})
                return data

        for unit, item in self.units[self.aliases[units[0]]["category"]]["units"].items():
            if unit == current["unit"]:
                continue
            to = eval(item["to"].format(n=original))
            to = round(to, 3)
            data.append({"value": to, "name": item["languages"][self.LANGUAGE]["name"]})

        return data

    def get_value(self, message):
        result = re.match(r"^\s*([+-]?((?=\.)\.\d+|\d+(?:[\.,]?\d+)?))", message)
        if result is not None:
            value = result.group(0)
            return value.replace(",", ".")
        else:
            return None

    def fetch_aliases(self, message):
        reg = re.compile("[^a-zA-Zа-яёА-ЯЁ ]")
        message = reg.sub("", message)
        words = message.split()
        units = []
        while len(words) and len(units) <= 2:
            tmp = words.pop()
            tmp = tmp.lower()
            if self.is_alias(tmp):
                units.append(tmp)
        return units[::-1]

    def get_aliases(self):
        return list(self.aliases.keys())

    def is_alias(self, word):
        return word in self.get_aliases()
