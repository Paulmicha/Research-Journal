#!/usr/bin/env bash

##
# Exports all messages from Discord channels.
#
# @prereq
#   docker pull tyrrrz/discordchatexporter:stable
#
# @prereq
#   .env file :
#     - DISCORD_TOKEN
#     - DISCORD_TOKEN_BOT
#
# @example
#		# From project docroot :
#		scripts/experiments/msc_auto_save_bot.sh
#

# Tout exporter :
# docker run --rm \
# 	--env-file $PWD/.env \
# 	-v $PWD/private/channels:/app/out \
# 	tyrrrz/discordchatexporter:stable \
# 	exportall \
# 	-f Json

# Quick'n'dirty env vars load.
. $PWD/.env

# Lister les channels :
# docker run --rm \
# 	--env-file $PWD/.env \
# 	-v $PWD/private/channels:/app/out \
# 	tyrrrz/discordchatexporter:stable \
# 	channels \
# 	-g "$DISCORD_SERVER_ID"

# Exporter une liste de channels définie dans .env (DISCORD_CHANNEL_IDS) :
while read -rd","; do
	echo "Processing channel_id = $REPLY ..."

	docker run --rm \
		--env-file $PWD/.env \
		-v $PWD/private/channels:/app/out \
		tyrrrz/discordchatexporter:stable \
		export \
		-c "$REPLY" \
		-f Json

done <<< "${DISCORD_CHANNEL_IDS},"
