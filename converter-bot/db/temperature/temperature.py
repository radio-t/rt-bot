# coding: utf-8
temperature = {
    'languages': {
        'en': 'Temperature',
        'ru': 'Температура'
    },
    'units': {
        'celsius': {
            'from': '{n}',
            'to': '{n}',
            'languages': {
                'en': {
                    'name': 'Celsius',
                    'aliases': ['c', 'celsius']
                },
                'ru': {
                    'name': 'Цельсий',
                    'aliases': ['цельсий', 'цельсия', 'ц', 'цельсиях']
                }
            }
        },
        'fahrenheit': {
            'from': '({n} - 32) * (5 / 9)',
            'to': '{n} * (9 / 5) + 32',
            'languages': {
                'en': {
                    'name': 'Fahrenheit',
                    'aliases': ['f', 'fahrenheit']
                },
                'ru': {
                    'name': 'Фаренгейт',
                    'aliases': ['ф', 'фаренгейт', 'фаренгейта', 'фаренгейтах']
                }
            }
        },
        'kelvin': {
            'from': '{n} - 273.15',
            'to': '{n} + 273.15',
            'languages': {
                'en': {
                    'name': 'Kelvin',
                    'aliases': ['k', 'kelvin']
                },
                'ru': {
                    'name': 'Кельвин',
                    'aliases': ['к', 'кельвин', 'кельвина', 'кельвинах']
                }
            }
        },

    }
}
