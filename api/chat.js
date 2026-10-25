// Função serverless para a Vercel. A chave da Gemini é configurada nas Environment Variables.
const SYSTEM_INSTRUCTIONS = `Você é Maya, a assistente virtual da academia MoveFIT. Responda sempre em português brasileiro, com tom amigável, claro, inclusivo e objetivo. Ajude com informações gerais sobre aquecimento, modalidades, organização de treino, condicionamento iniciante/intermediário/avançado e uso do protótipo. Não invente horários, preços, vagas, políticas ou serviços reais da academia; se não souber, diga que precisa confirmar com a equipe. O agendamento deste protótipo é apenas uma solicitação demonstrativa, não uma reserva real. Para exercícios, ofereça apenas orientação geral e segura; não diagnostique nem prescreva tratamento. Pergunte sobre lesões ou condições relevantes antes de sugerir atividade específica, recomende avaliação de profissional de Educação Física e interromper a atividade se houver dor, tontura, falta de ar incomum ou mal-estar. Para sintomas graves, recomende atendimento de emergência. Não solicite dados pessoais desnecessários. Mantenha as respostas curtas e práticas.`;

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  if (!apiKey) return res.status(503).json({ error: 'A chave da Gemini não foi configurada nas variáveis de ambiente da Vercel.' });

  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!message) return res.status(400).json({ error: 'Digite uma pergunta.' });
    if (message.length > 3000) return res.status(413).json({ error: 'A pergunta deve ter até 3000 caracteres.' });

    const profile = body.profile && typeof body.profile === 'object'
      ? `\nContexto opcional do perfil informado pelo aluno: nível=${String(body.profile.level || 'não informado').slice(0, 40)}, objetivo=${String(body.profile.goal || 'não informado').slice(0, 80)}.`
      : '';
    
    let apiResponse;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    for (let tentativa = 0; tentativa < 3; tentativa++) {
      apiResponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTIONS }]
          },
          contents: [
            { role: 'user', parts: [{ text: message + profile }] }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500
          }
        })
      });

      // Só tenta novamente em caso de erro temporário.
      if (
        apiResponse.status !== 503 ||
        tentativa === 2
      ) {
        break;
      }

      // Aguarda 1 segundo; na segunda tentativa, 2 segundos.
      await new Promise(resolve =>
        setTimeout(resolve, 1000 * (tentativa + 1))
      );
    }

    const data = await apiResponse.json().catch(() => ({}));

    if (!apiResponse.ok) {
      console.error('Gemini API status:', apiResponse.status, data?.error?.message || 'sem detalhes');
      return res.status(apiResponse.status === 429 ? 429 : 502).json({
        error: apiResponse.status === 429
          ? 'O limite gratuito da IA foi atingido. Aguarde um pouco e tente novamente.'
          : 'A API de IA não respondeu corretamente. Confira a chave e o modelo nas configurações da Vercel.'
      });
    }
    const reply = (data.candidates || []).flatMap(c => c.content?.parts || []).map(p => p.text || '').join('\n').trim();
    if (!reply) return res.status(502).json({ error: 'A IA não gerou texto. Tente reformular a pergunta.' });
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Erro na função /api/chat:', error.message);
    return res.status(500).json({ error: 'Não foi possível consultar a IA. Tente novamente.' });
  }
};
