# FocusNFe API v2 — Raw Documentation Index

Source: https://focusnfe.com.br/doc/
Downloaded: 2026-03-17

## Authentication

- **Method**: HTTP Basic Auth (token as username, blank password)
- **Token**: Unique string provided during company setup

## Base URLs

- **Production**: `https://api.focusnfe.com.br`
- **Homologação (Sandbox)**: `https://homologacao.focusnfe.com.br`

## Rate Limiting

- 100 credits/minute per token
- Headers: `Rate-Limit-Limit`, `Rate-Limit-Remaining`, `Rate-Limit-Reset`

## Sections Index

| File | Section | Size | Description |
|------|---------|------|-------------|
| `introducao.md` | Introduction | 12K | Auth, reference system, environments, REST patterns |
| `nfe.md` | NFe | 165K | Nota Fiscal Eletrônica (async) — full CRUD, CCe, email, inutilização, DANFE, econf |
| `nfce.md` | NFCe | 91K | Nota Fiscal ao Consumidor (sync) — CRUD, email, inutilização, econf |
| `comunicador_offline.md` | Comunicador Offline | 32K | Offline contingency communicator |
| `nfse.md` | NFSe | 54K | Nota Fiscal de Serviços (async) — CRUD, email, municipality-dependent |
| `nfse_nacional.md` | NFSe Nacional | 37K | NFSe new national standard (async) |
| `nfse_por_arquivo.md` | NFSe por Arquivo | 31K | NFSe by file upload |
| `nfses_recebidas.md` | NFSe Recebidas | 17K | Received service invoices |
| `cte_e_cte_os.md` | CTe / CTe OS | 61K | Conhecimento de Transporte (async/sync) — CRUD, CCe, desacordo, multimodal, GTV |
| `nfcom.md` | NFCom | 11K | Nota Fiscal de Comunicação (async) |
| `mdfe.md` | MDFe | 20K | Manifesto de Documentos Fiscais (async) — CRUD, driver, DFe, close |
| `nfe_recebidas.md` | NFe Recebidas | 54K | Received NFe + manifestation (MDe) |
| `cte_recebidas.md` | CTe Recebidas | 51K | Received CTe + desacordo |
| `backups_nfe_nfce_cte_e_mdfe.md` | Backups | 2K | Monthly XML/DANFE archives |
| `gatilhos_webhooks.md` | Webhooks | 31K | Event notifications (gatilhos) |
| `consulta_de_emails.md` | Blocked Emails | 4K | Email reputation management |
| `consulta_de_ncm.md` | NCM Lookup | 9K | Product classification codes |
| `consulta_de_cfop.md` | CFOP Lookup | 8K | Fiscal operation codes |
| `consulta_de_cep_beta.md` | CEP Lookup | 9K | ZIP code lookup (beta) |
| `consulta_de_cnae.md` | CNAE Lookup | 10K | Business activity codes |
| `consulta_de_municipios_beta.md` | Municipalities | 15K | Municipality lookup (beta) |
| `consulta_de_cnpj.md` | CNPJ Lookup | 9K | Company registration data |
| `empresas.md` | Empresas | 47K | Company management — full CRUD |
| `limite_de_requisicoes.md` | Rate Limits | 1K | Rate limiting details |

## Common Patterns

### Reference System
All fiscal documents use a user-provided `ref` string as identifier. Must be unique per document type per company.

### Document Statuses
| Status | Description |
|--------|-------------|
| `processando_autorizacao` | Being processed |
| `autorizado` | Authorized |
| `cancelado` | Cancelled |
| `erro_autorizacao` | Authorization error |
| `denegado` | Denied by SEFAZ |

### Error Response
```json
{
  "codigo": "error_code",
  "mensagem": "description",
  "erros": [{ "mensagem": "detail", "campo": "field" }]
}
```

### Processing Models
- **Async** (NFe, NFSe, CTe, MDFe, NFCom): POST → poll GET or webhook
- **Sync** (NFCe, CTe OS): POST → immediate response
