# Vercel Environment Variables Setup

## ClickUp Konfiguration

Fügen Sie folgende Environment Variables im Vercel Dashboard hinzu:

1. Gehen Sie zu Ihrem Vercel-Projekt Dashboard
2. Navigieren Sie zu **Settings** → **Environment Variables**
3. Fügen Sie folgende Variablen hinzu:

```
CLICKUP_API_TOKEN=pk_74617713_Q9IAU0Y5MGYG5QDNNTR1TKVGKINNFLW5
CLICKUP_LIST_ID=90124190263
```

**Wichtig:** Stellen Sie sicher, dass die Variablen für alle Environments verfügbar sind (Production, Preview, Development).

Nach dem Hinzufügen der Variablen müssen Sie das Projekt neu deployen.