#/bin/bash

filename="ForLGwebOSTV"

x5c=$(cat ForLGwebOSTV.crt | grep -v 'BEGIN CERTIFICATE' | grep -v 'END CERTIFICATE' | tr -d '\n')
echo '{'
echo '  "keys": ['
echo '    {'
echo '      "kty": "RSA",'
echo '      "use": "sig",'
echo '      "alg": "RS256",'
echo '      "x5c": ['
echo '        "'${x5c}'"'
echo '      ]'
echo '    }'
echo '  ]'
echo '}'
