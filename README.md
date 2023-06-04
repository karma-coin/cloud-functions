# cloud-functions
Karma Coin Firebase Cloud functions 



## Testing 

### Running on production

```bash
curl -m 70 -X POST https://processpaymenttransaction-4325ps3n6q-uc.a.run.app \
-H "Authorization: bearer $(gcloud auth print-identity-token)" \
-H "Content-Type: application/json" \
-d '{
  "toId": "v7nnqiFVAXBP/ZhFKji8kNxirSOMnVtjShFqs+a6+/Y=",
  "amount": "1 Karma Coin",
  "txId": "0x12345"
}'
```

### Running with local emulator

Obtain the functions url from the emulator web ui.

```bash
curl -m 70 -X POST http://127.0.0.1:5001/karmacoin-83d45/us-central1/processPaymentTransaction \
-H "Authorization: bearer $(gcloud auth print-identity-token)" \
-H "Content-Type: application/json" \
-d '{
  "toId": "v7nnqiFVAXBP/ZhFKji8kNxirSOMnVtjShFqs+a6+/Y=",
  "amount": "1 Karma Coin",
  "txId": "0x123012"
}'
```