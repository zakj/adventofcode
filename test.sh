#!/bin/sh

ansi() {
  printf "\e[${1}m${2}\e[0m"
}

if [ "$1" = "-f" ]; then
  FAST=1; shift
fi

DIRS=${1-$(find . -type d -depth 1 -name '20*' | sort)}
for dir in $DIRS; do
  cd $dir
  ansi '97' "$(basename $dir)\n"
  for f in $(ls day*.ts | sort); do
    printf "$f" | sed -E 's/^day([0-9]+).ts$/  Day \1: /'
    pnpm run ts-node ${FAST+-- -T} "$f" >/dev/null && ansi '1;32' '✓' || ansi '1;31' '✕'
    echo
  done
  echo
  cd ..
done


