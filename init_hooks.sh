#!/bin/bash
# https://github.com/npm/registry/blob/master/docs/hooks/endpoints.md#hooks-api-endpoints

HOOK_ENDPOINT="http://hookbot-hookbot.6923.rh-us-east-1.openshiftapps.com/"


if [ -e .secret ]; then
    SECRET=$(cat .secret)
else
    SECRET=$(cat /dev/urandom | LC_CTYPE=C tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
    echo $SECRET > .secret
fi
echo "secret: ${SECRET}"

# Auto-PR
npm hook add "registrytestpackage" $HOOK_ENDPOINT $SECRET
# npm hook add "@patternfly/patternfly" $HOOK_ENDPOINT $SECRET
