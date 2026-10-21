# Publicar o MoveFIT na Vercel

Este projeto usa arquivos HTML/CSS/JavaScript e uma função serverless em `api/chat.js` para consultar a API Gemini. O `server.js` continua disponível para rodar localmente com `node server.js`, mas a Vercel usa `api/chat.js` para o endpoint `/api/chat`.

## 1. Enviar o projeto para o GitHub
1. Entre em https://github.com e crie um repositório, por exemplo `movefit`.
2. Envie os arquivos desta pasta para o repositório. Inclua a pasta `api`.
3. **Não envie sua chave da Gemini.** O `.gitignore` ignora o arquivo `.env`.

## 2. Importar na Vercel
1. Entre em https://vercel.com e faça login usando sua conta do GitHub.
2. Clique em **Add New → Project** (ou **New Project**).
3. Importe o repositório `movefit`.
4. Para este projeto estático, não é necessário escolher um framework. Deixe a configuração padrão e clique em **Deploy**.

## 3. Configurar a chave da Gemini
1. Abra o projeto na Vercel.
2. Vá em **Settings → Environment Variables**.
3. Adicione `GEMINI_API_KEY` e coloque sua chave do Google AI Studio como valor.
4. Opcionalmente, adicione `GEMINI_MODEL` com o valor `gemini-2.5-flash`.
5. Marque Production (e Preview, se quiser testar previews) e salve.
6. Vá em **Deployments** e faça um novo deploy/redeploy para aplicar as variáveis.

Crie uma chave em https://aistudio.google.com/apikey. Nunca coloque a chave no `script.js`, no HTML, nem em mensagens públicas.

## 4. Testar
Abra o endereço `https://seu-projeto.vercel.app` que a Vercel fornecer. Teste o chat da Maya. Se o site abrir mas a IA não responder, confira a variável `GEMINI_API_KEY`, se houve novo deploy e os logs de Functions na Vercel.

## Observações
- O agendamento é demonstrativo e fica salvo apenas no navegador; não cria uma reserva real nem usa banco de dados.
- O uso da Gemini está sujeito a limites, disponibilidade e termos do provedor.
- O endereço `.vercel.app` pode ser compartilhado para apresentar o protótipo.
