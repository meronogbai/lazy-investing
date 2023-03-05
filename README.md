# Lazy Investing

## Generate ibkr client

```bash
docker run --rm -v "${PWD}:/local" openapitools/openapi-generator-cli generate \
    -i https://www.interactivebrokers.com/api/doc.json \
    --skip-validate-spec \
    -g typescript-axios \
    -o /local/src/generated/ibkr-client
```
