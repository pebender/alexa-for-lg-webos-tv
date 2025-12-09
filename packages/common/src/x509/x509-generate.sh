#/bin/bash

subject="For LG webOS TV"
filename="ForLGwebOSTV"

openssl \
  req -x509 \
  -newkey ed25519 \
  -noenc \
  -keyout "${filename}.key" \
  -out "${filename}.crt" \
  -subj "/CN=${subject}"
