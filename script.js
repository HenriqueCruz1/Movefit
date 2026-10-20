const STORAGE_KEYS = {
  profile: "movefit_profile_v1",
  completed: "movefit_completed_v1",
  chat: "movefit_chat_v1"
};

const exercises = [
  { id: "agachamento", name: "Agachamento com peso corporal", detail: "Exemplo: 3 séries de 10 repetições", group: "Pernas" },
  { id: "supino", name: "Supino (com orientação)", detail: "Exemplo: 3 séries de 10 repetições", group: "Peito" },
  { id: "remada", name: "Remada (com orientação)", detail: "Exemplo: 3 séries de 12 repetições", group: "Costas" },
  { id: "caminhada", name: "Caminhada leve", detail: "Exemplo: 10 minutos, em ritmo confortável", group: "Condicionamento" },
  { id: "alongamento", name: "Alongamento leve", detail: "Exemplo: movimentos confortáveis, sem forçar", group: "Mobilidade" }
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn("Não foi possível ler os dados salvos.", error);
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn("Não foi possível salvar os dados.", error);
    showToast("Não foi possível salvar. Verifique as configurações do navegador.");
    return false;
  }
}

let profile = readStorage(STORAGE_KEYS.profile, {
  name: "",
  goal: "condicionamento",
  level: "iniciante"
});
let completed = readStorage(STORAGE_KEYS.completed, []);
let chatHistory = readStorage(STORAGE_KEYS.chat, []);

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function navigate(pageName) {
  const target = document.getElementById("page-" + pageName);
  if (!target) return;
  $$(".page").forEach(page => page.classList.toggle("active", page === target));
  $$(".nav-btn").forEach(button => button.classList.toggle("active", button.dataset.page === pageName));
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (pageName === "treino") renderExercises();
  if (pageName === "inicio") updateDashboard();
}

$$("[data-page]").forEach(button => {
  button.addEventListener("click", () => navigate(button.dataset.page));
});
$$("[data-go]").forEach(button => {
  button.addEventListener("click", () => navigate(button.dataset.go));
});

function updateDashboard() {
  const count = exercises.length;
  const done = exercises.filter(item => completed.includes(item.id)).length;
  $("#welcomeName").textContent = profile.name ? `Olá, ${profile.name}!` : "Olá, aluno(a)!";
  $("#totalExercises").textContent = count;
  $("#doneExercises").textContent = done;
  $("#progressPercent").textContent = Math.round(done / count * 100) + "%";
  $("#progressLabel").textContent = `${done} de ${count}`;
  $("#progressBar").style.width = `${done / count * 100}%`;
  $("#progressMessage").textContent = done === count
    ? "Parabéns! Você marcou todos os exercícios como concluídos."
    : done === 0
      ? "Comece quando estiver pronto(a)."
      : "Bom trabalho! Continue no seu ritmo.";
}

function renderExercises() {
  const list = $("#exerciseList");
  list.replaceChildren();
  exercises.forEach((exercise, index) => {
    const isDone = completed.includes(exercise.id);
    const card = document.createElement("article");
    card.className = "exercise-card" + (isDone ? " completed" : "");

    const number = document.createElement("div");
    number.className = "exercise-number";
    number.textContent = isDone ? "✓" : String(index + 1);

    const info = document.createElement("div");
    info.className = "exercise-info";
    const title = document.createElement("h3");
    title.textContent = exercise.name;
    const detail = document.createElement("p");
    detail.textContent = `${exercise.group} · ${exercise.detail}`;
    info.append(title, detail);

    const label = document.createElement("label");
    label.className = "check-label";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = isDone;
    checkbox.setAttribute("aria-label", `Marcar ${exercise.name} como concluído`);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked && !completed.includes(exercise.id)) completed.push(exercise.id);
      if (!checkbox.checked) completed = completed.filter(id => id !== exercise.id);
      saveStorage(STORAGE_KEYS.completed, completed);
      renderExercises();
      updateDashboard();
    });
    const labelText = document.createElement("span");
    labelText.textContent = isDone ? "Concluído" : "Concluir";
    label.append(checkbox, labelText);
    card.append(number, info, label);
    list.append(card);
  });
  updateDashboard();
}

$("#resetWorkout").addEventListener("click", () => {
  completed = [];
  saveStorage(STORAGE_KEYS.completed, completed);
  renderExercises();
  showToast("Marcações reiniciadas.");
});

function fillProfileForm() {
  $("#studentName").value = profile.name || "";
  $("#goal").value = profile.goal || "condicionamento";
  $("#level").value = profile.level || "iniciante";
}
fillProfileForm();

$("#profileForm").addEventListener("submit", (event) => {
  event.preventDefault();
  profile = {
    name: $("#studentName").value.trim(),
    goal: $("#goal").value,
    level: $("#level").value
  };
  if (!profile.name) {
    $("#profileFeedback").textContent = "Digite seu nome para salvar.";
    return;
  }
  const saved = saveStorage(STORAGE_KEYS.profile, profile);
  $("#profileFeedback").textContent = saved ? "Perfil salvo neste navegador!" : "Não foi possível salvar o perfil.";
  updateDashboard();
  if (saved) showToast("Perfil salvo com sucesso.");
});

function getAssistantReply(question) {
  const q = question.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (/\b(oi|ola|bom dia|boa tarde|boa noite|tudo bem)\b/.test(q)) {
    return `Olá${profile.name ? ", " + profile.name : ""}! Sou a Lia, da MoveFIT. Posso ajudar com seu perfil, treino e progresso.`;
  }
  if (q.includes("treino") || q.includes("exercicio") || q.includes("série") || q.includes("serie")) {
    return "Na seção “Meu treino” você encontra a lista demonstrativa e pode marcar os exercícios concluídos. As séries e repetições são apenas exemplos: confirme seu plano com o profissional de educação física.";
  }
  if (q.includes("perfil") || q.includes("cadastro") || q.includes("nome")) {
    return "Abra “Meu perfil”, informe seu nome, escolha objetivo e experiência e clique em “Salvar perfil”. Os dados ficam salvos neste navegador.";
  }
  if (q.includes("progresso") || q.includes("conclu") || q.includes("marcar")) {
    const done = exercises.filter(item => completed.includes(item.id)).length;
    return `Você marcou ${done} de ${exercises.length} exercícios como concluídos (${Math.round(done / exercises.length * 100)}%). Acesse “Meu treino” para atualizar as marcações.`;
  }
  if (q.includes("objetivo")) {
    return "Você pode escolher no perfil entre condicionamento, força, mobilidade e bem-estar. A seleção serve para personalizar o protótipo; não cria automaticamente uma prescrição de treino.";
  }
  if (q.includes("dor") || q.includes("lesao") || q.includes("lesão") || q.includes("machuc")) {
    return "Se sentir dor ou desconforto, interrompa o exercício e procure orientação de um profissional de saúde ou de educação física. Não consigo avaliar lesões ou substituir atendimento profissional.";
  }
  if (q.includes("obrigad")) {
    return "Por nada! Estou aqui para ajudar com a navegação do protótipo. Bons treinos, com segurança!";
  }
  if (q.includes("quem e voce") || q.includes("quem é você") || q.includes("lia")) {
    return "Sou a Lia MoveFIT, uma persona digital criada para este projeto acadêmico. Nesta versão respondo por meio de regras programadas, sem uma IA externa.";
  }
  return "Ainda não tenho uma resposta programada para isso. Você pode perguntar sobre “meu treino”, “meu perfil” ou “meu progresso”.";
}

function appendChatMessage(text, role, persist = true) {
  const message = document.createElement("div");
  message.className = "bubble " + (role === "user" ? "user-bubble" : "bot-bubble");
  message.textContent = text;
  $("#chatMessages").append(message);
  $("#chatMessages").scrollTop = $("#chatMessages").scrollHeight;
  if (persist) {
    chatHistory.push({ text, role });
    chatHistory = chatHistory.slice(-40);
    saveStorage(STORAGE_KEYS.chat, chatHistory);
  }
}

function restoreChat() {
  chatHistory.forEach(item => {
    if (item && typeof item.text === "string" && ["user", "bot"].includes(item.role)) {
      appendChatMessage(item.text, item.role, false);
    }
  });
}
restoreChat();

function sendChat(question) {
  const text = question.trim();
  if (!text) return;
  appendChatMessage(text, "user");
  appendChatMessage(getAssistantReply(text), "bot");
}

$("#chatForm").addEventListener("submit", (event) => {
  event.preventDefault();
  sendChat($("#chatInput").value);
  $("#chatInput").value = "";
  $("#chatInput").focus();
});
$$("[data-question]").forEach(button => {
  button.addEventListener("click", () => sendChat(button.dataset.question));
});

$("#year").textContent = new Date().getFullYear();
renderExercises();
updateDashboard();
