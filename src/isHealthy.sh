RESPONSE=$(curl http://localhost:$SERVICE_PORT/isAlive)
if [ "$RESPONSE" = "true" ]; then
    exit 0;
else
    exit 1;
fi