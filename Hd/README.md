# HD Barbearia

App de gestão para barbearia (HTML5 + CSS3 + JavaScript Vanilla) — versão **incompleta / demonstração**. Usado como backup e para testes no celular via GitHub Pages.

## Acesso

Globalmente disponível em:

```
https://<seu-usuario>.github.io/<nome-do-repositorio>/
```

Para abrir no celular, acesse esse endereço pelo navegador do aparelho (Chrome/Safari via protocolo `https://`). Sugestão: adicione à tela inicial ("Adicionar à tela inicial" / "Add to Home Screen") para usar em tela cheia.

## Como publicar no GitHub Pages

1. Suba este projeto em um repositório (nome de exemplo: `hd-barbearia`).
2. Acesse **Settings → Pages**.
3. Em **Branch**, selecione `main` (ou `master`) e pasta `/ (root)`, depois salve.
4. Aguarde 1–2 minutos. O link aparecerá em **Settings → Pages**.

> Alternativa rápida: renomeie o repositório para `seu-usuario.github.io` — o conteúdo já fica no ar sem a etapa acima.

## Estrutura

```
├── index.html   # telas do app (onboarding, login, dashboard, comissões)
├── style.css    # design system dark + componentes
└── script.js    # lógica (navegação, comissões, atendimentos, raio-x)
```

## Estado do projeto

- ⚠️ **Demonstração**: os dados são fictícios e fixos no `script.js`.
- Sem backend e sem banco de dados — dados não persistem entre sessões.
- Testado em layout mobile (420px). No desktop, o app aparece centralizado em um "frame" de celular.

## O que já funciona

- Onboarding → login (simulado) → dashboard
- Novo atendimento (busca de cliente + múltiplos serviços + total)
- Histórico de vendas com filtros (período, barbeiro, cliente, serviço, data)
- Gestão & Comissões: métricas, fechamento do barbeiro com modal de pagamento e recibo, raio-x de clientes com filtros e botão de WhatsApp

## Próximos passos (roadmap sugestivo)

- [ ] Persistência de dados (localStorage primeiro, depois backend/API real)
- [ ] Autenticação real (login, cadastro e biometria)
- [ ] Cálculo de comissão configurável por barbeiro
- [ ] Envio real dos carimbos/recibos via WhatsApp
- [ ] Notificações e gráficos avançados

## Requisitos

Nenhum. Basta abrir no navegador ou hospedar em qualquer servidor estático (GitHub Pages, Netlify, Vercel, etc.).