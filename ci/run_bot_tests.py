#!/usr/bin/env python3

import os
import json
import argparse
import logging

import requests

from bot_configparser import BotConfig, BotConfigNotFound, BotConfigError


BASE_URL = os.environ.get('BOT_BASE_URL', 'https://bot.radio-t.com')


logger = logging.getLogger(__file__)


def find_bots(directory) -> dict:
    """
    Returns dict with BotConfig objects
    Dict keys are bot names
    """
    bot_configs = {}
    for dir_ in os.listdir(directory):
        dir_ = os.path.join(os.path.abspath(directory), dir_)
        if os.path.isdir(dir_):
            try:
                config = BotConfig.from_dir(dir_)
                if config.bot_name in bot_configs:
                    raise BotConfigError(
                        "Bot with name {} already exists in {}".format(
                            config.bot_name,
                            dir_
                        )
                    )
                bot_configs[config.bot_name] = config
            except BotConfigNotFound:
                pass
    return bot_configs


def run_bot_testcase(url, test_case):
    request_data = test_case.command.as_dict()
    logger.debug('Sending message to {}'.format(url))
    logger.debug('Message content: {}'.format(request_data))
    response = requests.post(url, json=request_data, verify=False)
    logger.debug('Response content: {}'.format(
        response.content.decode('utf-8'))
    )

    if response.status_code != test_case.response.status:
        raise ValueError(
            '{} HTTP status expected, {} given'.format(
                test_case.response.status,
                response.status_code,
            )
        )
    if test_case.response.status != test_case.response.OK:
        # Content doesn't matter for ignored messages
        return

    if not response.headers.get('content-type').startswith('application/json'):
        raise ValueError(
            'application/json content type status expected, {} given'.format(
                response.headers.get('content-type'),
            )
        )

    response_data = response.json()
    if response_data.get('bot') != test_case.response.bot:
        raise ValueError(
            '{} "bot" parameter expected, {} given'.format(
                test_case.response.bot,
                response_data.get('bot')
            )
        )

    if not test_case.response.text_regexp.match(response_data.get('text', "")):
        raise ValueError(
            '{} does not match regexp {}'.format(
                response_data.get("text"),
                test_case.response.text_regexp,
            )
        )


def test_bot(config: BotConfig) -> bool:
    url = '{}/api/{}/event'.format(BASE_URL, config.bot_name)
    logger.warn("Testing bot: {} ({})...".format(config.bot_name, url))
    for test_case in config.test_cases:
        run_bot_testcase(url, test_case)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Test radio-t bots.')
    parser.add_argument('project_dir', type=str)
    args = parser.parse_args()
    bots = find_bots(args.project_dir)
    for bot in bots.values():
        test_bot(bot)
