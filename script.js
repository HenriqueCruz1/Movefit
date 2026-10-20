const $ = (id) => document.getElementById(id);
const profileKey = "movefit_profile_v2";
const bookingsKey = "movefit_bookings_v2";
let profile = JSON.parse(localStorage.getItem(profileKey) || "null");
let bookings = JSON.parse(localStorage.getItem(bookingsKey) || "[]");

const workouts = {
  iniciante: [
    ["Caminhada leve", "5 minutos em ritmo confortável para começar."],
    ["Sentar e levantar da cadeira", "2 séries de 8 repetições, com movimento controlado."],
    ["Flexão na parede", "2 séries de 8 repetições, sem prender a respiração."],
    ["Mobilidade de ombros", "Movimentos suaves por 1–2 minutos."]
  ],
  intermediario: [
    ["Caminhada rápida ou bicicleta", "5–8 minutos em intensidade moderada."],
    ["Agachamento com peso corporal", "3 séries de 10 repetições com técnica controlada."],
    ["Flexão inclinada", "3 séries de 8–10 repetições conforme tolerância."],
    ["Prancha adaptada", "3 repetições curtas, mantendo respiração normal."]
  ],
  avancado: [
    ["Aquecimento progressivo", "5–10 minutos, elevando a intensidade gradualmente."],
    ["Agachamento com carga adequada", "3 séries de 8 repetições; técnica antes da carga."],
    ["Remada com elástico ou equipamento", "3 séries de 10 repetições com controle."],
    ["Prancha", "3 séries curtas, mantendo alinhamento confortável."]
  ]
};
const levelNames = { iniciante: "Iniciante", intermediario: "Intermediário", avancado: "Avançado" };
const goalNames = { condicionamento: "Melhorar o condicionamento", forca: "Desenvolver força", mobilidade: "Mobilidade e bem-estar" };

function showView(name) {
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === `view-${name}`));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.view === name));
  if (name === "treinos") renderWorkout();
  if (name === "agenda") renderBookings();
  if (name === "perfil" && profile) fillProfile();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
document.querySelectorAll("[data-view]").forEach(b => b.addEventListener("click", () => showView(b.dataset.view)));
document.querySelectorAll("[data-goto]").forEach(b => b.addEventListener("click", () => showView(b.dataset.goto)));

function fillProfile() {
  $("user-name").value = profile.name || "";
  $("user-level").value = profile.level || "iniciante";
  $("user-goal").value = profile.goal || "condicionamento";
  $("user-time").value = profile.time || "30";
  $("booking-name").value = profile.name || "";
}
function renderWorkout() {
  const level = profile?.level || "iniciante";
  $("training-summary").textContent = profile
    ? `${profile.name}, suas sugestões estão configuradas para o nível ${levelNames[level].toLowerCase()}, com foco em ${goalNames[profile.goal].toLowerCase()} e ${profile.time} minutos disponíveis.`
    : "Você ainda não salvou um perfil. As sugestões iniciais são exemplos para iniciantes.";
  $("workout-title").textContent = `Série sugerida · ${levelNames[level]}`;
  $("workout-list").innerHTML = workouts[level].map((item, i) =>
    `<div class="exercise"><span class="exercise-number">${String(i + 1).padStart(2, "0")}</span><div><strong>${item[0]}</strong><p>${item[1]}</p></div></div>`
  ).join("");
}
$("profile-form").addEventListener("submit", (e) => {
  e.preventDefault();
  profile = {
    name: $("user-name").value.trim(),
    level: $("user-level").value,
    goal: $("user-goal").value,
    time: $("user-time").value
  };
  localStorage.setItem(profileKey, JSON.stringify(profile));
  $("profile-message").textContent = "Perfil salvo neste navegador!";
  $("booking-name").value = profile.name;
  renderWorkout();
});

function renderBookings() {
  const list = $("booking-list");
  if (!bookings.length) {
    list.innerHTML = '<p class="small-muted">Nenhuma solicitação registrada neste navegador.</p>';
    return;
  }
  list.innerHTML = bookings.map((b, i) => `<div class="booking-item"><div><strong>${escapeHtml(b.type)} · ${escapeHtml(b.name)}</strong><small>${escapeHtml(b.date)} às ${escapeHtml(b.time)}</small></div><span class="pill">Demonstrativo #${i + 1}</span></div>`).join("");
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}
const today = new Date();
$("booking-date").min = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
$("booking-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const booking = {
    name: $("booking-name").value.trim(),
    type: $("booking-type").value,
    date: $("booking-date").value,
    time: $("booking-time").value
  };
  if (booking.date < $("booking-date").min) {
    $("booking-message").textContent = "Escolha uma data de hoje em diante.";
    return;
  }
  bookings.push(booking);
  localStorage.setItem(bookingsKey, JSON.stringify(bookings));
  $("booking-message").textContent = "Solicitação registrada localmente. Isso não confirma uma vaga real.";
  renderBookings();
});
$("clear-bookings").addEventListener("click", () => {
  if (confirm("Deseja apagar as solicitações salvas neste navegador?")) {
    bookings = [];
    localStorage.setItem(bookingsKey, JSON.stringify(bookings));
    renderBookings();
  }
});

const messageArea = $("chat-messages");
function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.textContent = text;
  messageArea.appendChild(div);
  messageArea.scrollTop = messageArea.scrollHeight;
}
function answerQuestion(raw) {
  const q = raw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (q.includes("iniciante") || q.includes("comeco") || q.includes("comecar") || q.includes("nivel")) {
    return "Se você está começando, vá com calma: priorize movimentos simples, intensidade confortável e pausas. Posso mostrar uma série de exemplo na seção “Meus treinos”. Se tiver lesões ou condições de saúde, converse com um profissional antes de iniciar.";
  }
  if (q.includes("aquec") || q.includes("along") || q.includes("mobilidade")) {
    return "Você pode considerar: 1) caminhada ou bicicleta leve por 5–10 minutos; 2) mobilidade dinâmica suave; 3) séries preparatórias leves do exercício principal. Evite forçar amplitudes e adapte ao seu corpo.";
  }
  if (q.includes("agend") || q.includes("aula") || q.includes("horario") || q.includes("marcar")) {
    return "Para registrar uma solicitação, abra “Agendar aula”, preencha nome, modalidade, data e horário e clique em “Registrar solicitação”. Atenção: o protótipo não consulta a agenda real nem reserva uma vaga.";
  }
  if (q.includes("serie") || q.includes("exercicio") || q.includes("treino")) {
    return "Abra “Meus treinos” para ver uma série demonstrativa. Você pode salvar seu nível em “Perfil e nível” para adaptar as sugestões. As séries são exemplos educativos, não uma prescrição individual.";
  }
  if (q.includes("objetivo") || q.includes("forca") || q.includes("condicionamento")) {
    return "No “Perfil e nível”, você pode selecionar seu objetivo principal: condicionamento, força ou mobilidade e bem-estar. O protótipo usa essa informação para contextualizar o perfil, mas ainda não faz periodização profissional.";
  }
  if (q.includes("oi") || q.includes("ola") || q.includes("bom dia") || q.includes("boa tarde") || q.includes("boa noite")) {
    return `Olá${profile?.name ? ", " + profile.name : ""}! 😊 Como posso ajudar com seu treino hoje?`;
  }
  return "Posso ajudar com nível de condicionamento, séries demonstrativas, aquecimento ou agendamento. Experimente uma das sugestões abaixo. Para dúvidas sobre saúde ou execução de exercícios, procure um profissional qualificado.";
}
$("chat-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = $("chat-input");
  const text = input.value.trim();
  if (!text) return;
  addMessage(text, "user");
  input.value = "";
  addMessage(answerQuestion(text), "assistant");
});
document.querySelectorAll("[data-question]").forEach(b => b.addEventListener("click", () => {
  showView("chat");
  addMessage(b.dataset.question, "user");
  addMessage(answerQuestion(b.dataset.question), "assistant");
}));

if (profile) fillProfile();
renderWorkout();
renderBookings();
