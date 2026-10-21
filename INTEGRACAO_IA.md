# Integração de IA generativa — MoveFIT

## O que foi implementado
- O chat envia a pergunta para `POST /api/chat`.
- `server.js` consulta a API Gemini e mantém a chave fora do JavaScript do navegador.
- O servidor orienta a Maya a responder em português, não inventar informações da academia e priorizar segurança em assuntos de exercício.
- Se a API estiver indisponível, o chat usa as respostas locais predefinidas como alternativa.

## API e custos
O Google AI Studio oferece uma camada gratuita para modelos e usos elegíveis, sujeita a limites, disponibilidade regional e mudanças de política. Consulte a página oficial de preços antes de usar: https://ai.google.dev/gemini-api/docs/pricing
Criar uma chave: https://aistudio.google.com/apikey

## Limitações importantes
- A IA generativa não consulta a agenda real nem confirma reservas.
- O protótipo não substitui orientação de profissional de Educação Física ou de saúde.
- Não coloque a chave em `script.js`, `index.html` ou em um repositório público.
- Para publicar o site, hospede o servidor em um serviço backend e configure a chave como variável de ambiente no provedor. Nunca publique o `.env`.
