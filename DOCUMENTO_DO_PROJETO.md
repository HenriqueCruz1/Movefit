# MoveFIT — Assistente Virtual para Academia

## 1. Descrição
O MoveFIT é um protótipo navegável de assistente virtual para apoiar alunos de academia. A persona digital é a Maya, uma assistente de comunicação amigável e objetiva.

## 2. Objetivos
- Oferecer uma interface conversacional de demonstração.
- Exibir sugestões de exercícios de acordo com nível de condicionamento.
- Apresentar modalidades de aquecimento.
- Registrar solicitações demonstrativas de aulas.
- Disponibilizar um protótipo simples para avaliação acadêmica.

## 3. Funcionalidades
1. Perfil do aluno: nome, nível, objetivo e tempo disponível.
2. Série de exercícios ilustrativa para iniciante, intermediário e avançado.
3. Orientações gerais de aquecimento.
4. Registro local de solicitação de aula por modalidade, data e horário.
5. Chatbot por regras/intenções predefinidas em JavaScript.
6. Persistência do perfil e das solicitações com `localStorage`.

## 4. Arquitetura
Aplicação web estática executada no navegador:
- `index.html`: estrutura e conteúdo da interface.
- `style.css`: identidade visual, layout responsivo e componentes.
- `script.js`: navegação, perfil, séries, agendamentos locais e respostas do chatbot.
- `assets/maya.png`: imagem da persona digital gerada por IA.

Não há servidor, banco de dados remoto, autenticação, integração com agenda real nem API de IA. Os dados permanecem no navegador em que o protótipo é utilizado.

## 5. Tecnologias
- HTML5
- CSS3
- JavaScript (ES6)
- `localStorage` do navegador
- Imagem da persona gerada com ferramenta de IA generativa

## 6. Como executar
1. Extraia o arquivo ZIP.
2. Abra a pasta `MoveFIT_Entrega`.
3. Dê dois cliques em `index.html` para abrir no navegador.
4. Use o menu para acessar as áreas do protótipo.

Não é necessário instalar dependências. É recomendável conexão com a internet para carregar a fonte visual externa; sem ela, o navegador usa fontes alternativas.

## 7. Limitações e segurança
- O chatbot usa respostas predefinidas, não um modelo generativo conectado.
- O agendamento é apenas demonstrativo; não confirma vagas reais.
- Dados são locais e podem ser apagados pelo usuário ao limpar os dados do navegador.
- Exercícios são exemplos educativos e não substituem avaliação profissional.
- Para uso real, seriam necessários backend, autenticação, banco de dados, regras de privacidade, agenda integrada e validação por profissionais da academia.
