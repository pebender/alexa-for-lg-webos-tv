#/bin/bash

subject="For LG webOS TV"
filename="ForLGwebOSTV"

openssl \
  req -x509 \
  -newkey rsa:2048 -sha256 -days 3650 \
  -noenc \
  -keyout "${filename}.key" \
  -out "${filename}.crt" \
  -subj "/CN=${subject}"
