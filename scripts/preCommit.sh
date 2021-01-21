#! /bin/bash

export NODE_ENV='production'
git diff --cached --name-only | \
  grep -E "src/.*\.(js|jsx|ts|tsx|vue)$" |\
  grep -v 'mocker' |\
  xargs eslint -c ./.eslintrc.js --max-warnings=0 --fix --no-error-on-unmatched-pattern
exit $?
