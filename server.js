// Servidor local do MoveFIT + proxy seguro para a API Gemini.
// Requer Node.js 18 ou superior. A chave fica apenas no servidor (.env).
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3000);
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8'
};
const SYSTEM_INSTRUCTIONS = `Você é Maya, a assistente virtual da academia MoveFIT. Responda sempre em português brasileiro, com tom amigável, claro, inclusivo e objetivo. Ajude com informações gerais sobre aquecimento, modalidades, organização de treino, condicionamento iniciante/intermediário/avançado e uso do protótipo. Não invente horários, preços, vagas, políticas ou serviços reais da academia; se não souber, diga que precisa confirmar com a equipe. O agendamento deste protótipo é apenas uma solicitação demonstrativa, não uma reserva real. Para exercícios, ofereça apenas orientação geral e segura; não diagnostique nem prescreva tratamento. Pergunte sobre lesões ou condições relevantes antes de sugerir atividade específica, recomende avaliação de profissional de Educação Física e interromper a atividade se houver dor, tontura, falta de ar incomum ou mal-estar. Para sintomas graves, recomende atendimento de emergência. Não solicite dados pessoais desnecessários. Mantenha as respostas curtas e práticas.`;

function send(res, status, body, contentType = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': contentType, 'X-Content-Type-Options': 'nosniff' });
  res.end(contentType.startsWith('application/json') ? JSON.stringify(body) : body);
}
function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 20000) { reject(new Error('Mensagem muito grande.')); req.destroy(); }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); } catch { reject(new Error('JSON inválido.')); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'POST' && url.pathname === '/api/chat') {
    if (!API_KEY) return send(res, 503, { error: 'A chave da Gemini não foi configurada. Siga o passo a passo no README.' });
    try {
      const body = await readJson(req);
      const message = typeof body.message === 'string' ? body.message.trim() : '';
      if (!message) return send(res, 400, { error: 'Digite uma pergunta.' });
      if (message.length > 3000) return send(res, 413, { error: 'A pergunta deve ter até 3000 caracteres.' });
      const profile = body.profile && typeof body.profile === 'object'
        ? `\nContexto opcional do perfil informado pelo aluno: nível=${String(body.profile.level || 'não informado').slice(0, 40)}, objetivo=${String(body.profile.goal || 'não informado').slice(0, 80)}.`
        : '';
      const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent?key=${encodeURIComponent(API_KEY)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTIONS }] },
          contents: [{ role: 'user', parts: [{ text: message + profile }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
        }),
        signal: AbortSignal.timeout(30000)
      });
      const data = await apiResponse.json().catch(() => ({}));
      if (!apiResponse.ok) {
        console.error('Gemini API status:', apiResponse.status, data?.error?.message || 'sem detalhes');
        const status = apiResponse.status === 429 ? 429 : 502;
        return send(res, status, { error: status === 429 ? 'O limite gratuito da IA foi atingido. Aguarde um pouco e tente novamente.' : 'A API de IA não respondeu corretamente. Confira a chave e o modelo no README.' });
      }
      const reply = (data.candidates || []).flatMap(c => c.content?.parts || []).map(p => p.text || '').join('\n').trim();
      if (!reply) return send(res, 502, { error: 'A IA não gerou texto. Tente reformular a pergunta.' });
      return send(res, 200, { reply });
    } catch (error) {
      console.error('Erro no endpoint /api/chat:', error.message);
      return send(res, 500, { error: 'Não foi possível consultar a IA. Verifique sua conexão e tente novamente.' });
    }
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'Método não permitido.' });
  let pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const filePath = path.resolve(ROOT, '.' + pathname);
  if (!filePath.startsWith(ROOT + path.sep) && filePath !== path.join(ROOT, 'index.html')) return send(res, 403, { error: 'Acesso negado.' });
  fs.readFile(filePath, (err, content) => {
    if (err) return send(res, 404, { error: 'Arquivo não encontrado.' });
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : content);
  });
});
server.listen(PORT, () => {
  console.log(`MoveFIT disponível em http://localhost:${PORT}`);
  console.log(`IA generativa: ${API_KEY ? 'chave configurada' : 'SEM CHAVE — configure GEMINI_API_KEY'}`);
});
