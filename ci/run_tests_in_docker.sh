#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CONTAINER_NAME="${CONTAINER_NAME:-rt-bot/checker}"
docker run --rm -t --volume="$DIR/..:/project:ro" \
    -e BOT_BASE_URL="$BOT_BASE_URL" \
    "$CONTAINER_NAME" /project
_