MOVEFIT — ASSISTENTE VIRTUAL COM IA GENERATIVA

REQUISITOS
- Node.js 18 ou superior
- Conexão com a internet
- Chave da API Gemini (Google AI Studio). A camada gratuita está sujeita a limites e disponibilidade.

PASSO A PASSO — WINDOWS
1. Instale o Node.js LTS: https://nodejs.org/
2. Crie sua chave no Google AI Studio: https://aistudio.google.com/apikey
3. Nesta pasta, faça uma cópia de .env.example e renomeie a cópia para .env
4. Abra o .env no Bloco de Notas e substitua COLE_SUA_CHAVE_AQUI pela chave. Não compartilhe nem envie esse arquivo ao GitHub.
5. Abra a pasta MoveFIT_Entrega no Visual Studio Code.
6. No menu Terminal > Novo Terminal, execute: node server.js
7. Abra no navegador: http://localhost:3000
8. Entre em “Conversar com Maya” e faça uma pergunta. Ex.: “Sou iniciante, como começo a me aquecer?”

IMPORTANTE
- Não abra index.html diretamente para testar a IA; abra http://localhost:3000, pois a API passa pelo servidor.
- Para parar o servidor, volte ao terminal e pressione Ctrl+C.
- Se aparecer “limite gratuito atingido”, aguarde e tente mais tarde. Os limites podem variar.
- Se houver erro, confira se a chave está correta e se a conexão com a internet funciona.
- A chave fica no servidor, nunca no script do navegador. Não publique o .env.
- O agendamento continua demonstrativo e não reserva vagas reais.
- A IA fornece orientação geral e não substitui profissional qualificado.

ARQUIVOS
index.html — interface
style.css — estilos
script.js — comportamento do site e chat
server.js — servidor local e conexão segura com Gemini
.env.example — modelo de configuração da chave
INTEGRACAO_IA.md — detalhes da integração
assets/maya.png — imagem da persona
DOCUMENTO_DO_PROJETO.md — documento do projeto
FLUXOS_DE_CONVERSA.md — fluxos conversacionais
PRECIFICACAO.md — estimativa de custos
CHECKLIST_ENTREGA.md — checklist da atividade
