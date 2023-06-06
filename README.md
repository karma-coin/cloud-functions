# cloud-functions
Karma Coin Firebase Cloud functions 

### Deploying
```bash
cd functions
yarn deploy
```

## Testing 

### Running on production

```bash
curl -m 70 -X POST https://processpaymenttransaction-4325ps3n6q-uc.a.run.app \
-H "Authorization: bearer $(gcloud auth print-identity-token)" \
-H "Content-Type: application/json" \
-d '{
  "toId": "ca74yv91rFGVdkdRcwrSlMGlTLEXp84qyqbcvOLx7SQ=",
  "amount": "1 Karma Coin",
  "txId": "0x12345"
}'
```

### Running with the local emulator

Run the firebase cloud functions emualtor
```bash
firebase emulators:start
```

```bash
curl -m 70 -X POST http://127.0.0.1:5001/karmacoin-83d45/us-central1/processPaymentTransaction \
-H "Authorization: bearer $(gcloud auth print-identity-token)" \
-H "Content-Type: application/json" \
-d '{
  "toId": "ca74yv91rFGVdkdRcwrSlMGlTLEXp84qyqbcvOLx7SQ=",
  "amount": "1 Karma Coin",
  "txId": "0x123012"
}'
```