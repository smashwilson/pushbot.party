FROM alpine:3.10

LABEL "com.github.actions.name"="Publish pushbot.party"
LABEL "com.github.actions.description"="Build and publish pushbot.party to GitHub Pages"
LABEL "com.github.actions.icon"="zap"
LABEL "com.github.actions.color"="purple"

LABEL "repository"="https://github.com/pushbot.party"
LABEL "maintainer"="Ash Wilson <smashwilson@gmail.com>"

RUN apk add --no-cache nodejs npm git

ADD ./entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
