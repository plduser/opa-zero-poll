# WEBHOOKI GITHUB - OPA Zero Poll

## Cel
Automatyczna synchronizacja polityk po zmianach w repozytorium GitHub.

---

## Konfiguracja webhooka

1. Wejdź w ustawienia repozytorium GitHub → Webhooks → Add webhook
2. **Payload URL:**
   - Lokalnie: `http://localhost:8110/webhook/policy-update`
   - Przez ngrok: `https://<twój-ngrok>.ngrok-free.app/webhook/policy-update`
3. **Content type:** `application/json`
4. **Secret:** taki sam jak `WEBHOOK_SECRET` w Data Provider API
5. **Events:** wybierz "Just the push event"

---

## Bezpieczeństwo
- Weryfikacja podpisu HMAC-SHA256 (`X-Hub-Signature-256`)
- Ustaw silny sekret, nie udostępniaj go publicznie

---

## Przykładowy payload (push event)
```json
{
  "ref": "refs/heads/main",
  "commits": [
    {
      "id": "abc123",
      "added": ["policies/test.rego"],
      "modified": [],
      "removed": []
    }
  ],
  "repository": { "name": "test-repo" }
}
```

---

## Przykładowa odpowiedź
```json
{
  "status": "success",
  "action_required": true,
  "next_step": "Policy synchronization with OPA recommended",
  "processing_result": {
    "policy_changes_detected": true,
    "processed_files": [
      { "file": "policies/test.rego", "commit": "abc123", "action": "added" }
    ]
  }
}
```

---

## Troubleshooting
- 401 Unauthorized – nieprawidłowy podpis (sprawdź sekret)
- 405 Method Not Allowed – zły URL lub metoda (sprawdź Payload URL)
- 200 OK – webhook przetworzony poprawnie

---

## FAQ
- **Czy można testować webhook lokalnie?** Tak, przez ngrok.
- **Czy obsługiwane są inne eventy niż push?** Na razie tylko push. 