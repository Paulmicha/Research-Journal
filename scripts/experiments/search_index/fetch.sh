#!/usr/bin/env bash

##
# Fetches all messages from Discord channels + extract results.
#
# @prereq
#   docker pull tyrrrz/discordchatexporter:stable
#
# @prereq
#   In the ".env" file to create in project docroot :
#     - DISCORD_TOKEN=Abc123...
#     - DISCORD_TOKEN_BOT=true
#     - DISCORD_SERVER_ID=123
#     - DISCORD_CHANNEL_IDS=123,456,789
#
# @example
#		# From project docroot :
#		scripts/experiments/search_index/fetch.sh
#   # -> Results : see static/data/entities/experiment/search_index.json
#

# Tout exporter :
docker run --rm \
	--env-file $PWD/.env \
	-v $PWD/private/channels:/app/out \
	tyrrrz/discordchatexporter:stable \
	exportall \
	-f Json \
	-p 300 \
	--media --reuse-media \
	--dateformat "yyyy-MM-dd HH:mm:ss"

# Quick'n'dirty env vars load.
# . $PWD/.env

# Lister les channels :
# docker run --rm \
# 	--env-file $PWD/.env \
# 	-v $PWD/private/channels:/app/out \
# 	tyrrrz/discordchatexporter:stable \
# 	channels \
# 	-g "$DISCORD_SERVER_ID"

# Exporter une liste de channels définie dans .env (DISCORD_CHANNEL_IDS) :
# while read -rd","; do
# 	echo "Processing channel_id = $REPLY ..."

# 	docker run --rm \
# 		--env-file $PWD/.env \
# 		-v $PWD/private/channels:/app/out \
# 		tyrrrz/discordchatexporter:stable \
# 		export \
# 		-c "$REPLY" \
# 		-f Json \
# 		-p 50 \
# 		--media --reuse-media

# done <<< "${DISCORD_CHANNEL_IDS},"

echo "Extract results ..."
node $PWD/scripts/experiments/search_index/extract.js
echo "Done."
