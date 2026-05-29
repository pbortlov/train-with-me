#!/bin/sh
set -eu

resolver="$(awk '/^nameserver / { print $2; exit }' /etc/resolv.conf)"
if [ -z "$resolver" ]; then
    resolver="127.0.0.1"
fi

cat > /etc/nginx/conf.d/resolver.conf <<EOF
resolver $resolver valid=10s ipv6=off;
EOF
