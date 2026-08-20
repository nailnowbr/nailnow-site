/**
 * @fileoverview Lógica para o formulário de cadastro de profissionais NailNow.
 * @version 2.0
 *
 * @description
 * Envia o cadastro para a Cloud Function `registerProfessionalAccount`,
 * que cria o usuário no Firebase Auth (senha hasheada) e grava o perfil
 * na coleção `profissionais` do projeto correto. Antes gravávamos direto
 * no Firestore com senha e CPF em texto puro num projeto separado —
 * nunca mais.
 */

const FN_ENDPOINTS = [
  "https://southamerica-east1-nailnow-site.cloudfunctions.net/registerProfessionalAccount",
  "https://southamerica-east1-nailnow-7546c.cloudfunctions.net/registerProfessionalAccount",
  "https://southamerica-east1-nailnow-7546c-53f84.cloudfunctions.net/registerProfessionalAccount",
];

const form = document.getElementById("form-cadastro-profissional");
const btnSubmit = document.getElementById("btnSubmitProf");
const formMsg = document.getElementById("formMsgProf");

const DEFAULT_SUBMIT_LABEL = "Cadastrar profissional";

function parseCoordinate(value) {
  if (!value) return undefined;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function setSubmitState({ label = DEFAULT_SUBMIT_LABEL, disabled = false } = {}) {
  if (!btnSubmit) return;
  btnSubmit.disabled = disabled;
  btnSubmit.textContent = label;
}

function setFeedback(message = "") {
  if (!formMsg) return;
  formMsg.textContent = message;
}

function appendStringField(target, key, value) {
  if (!key) return;
  const normalized = (value ?? "").trim();
  if (normalized) {
    target[key] = normalized;
  }
}

function appendNumberField(target, key, value) {
  if (!key || typeof value !== "number" || !Number.isFinite(value)) return;
  target[key] = value;
}

function collectServices(currentForm) {
  if (!currentForm) return [];
  const inputs = currentForm.querySelectorAll("input[name='servicos']:checked");
  return Array.from(inputs, (input) => input.value).filter(Boolean);
}

async function submitWithFallback(endpoints, payload) {
  const attempts = [];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await response.text();

      if (response.ok) {
        return { endpoint, response, text };
      }

      attempts.push({ endpoint, status: response.status, body: text });

      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        break;
      }
    } catch (error) {
      attempts.push({ endpoint, error: error?.message || "network-error" });
    }
  }

  const error = new Error("all-endpoints-failed");
  error.attempts = attempts;
  throw error;
}

if (!form) {
  console.warn("[profissional-cadastro] Formulário não encontrado pelo id 'form-cadastro-profissional'.");
} else {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setSubmitState({ label: "Enviando...", disabled: true });
    setFeedback("");

    const nomeCompleto = form.elements.nome?.value?.trim() || "";
    const cpfRaw = form.elements.cpf?.value?.trim() || "";
    const cpf = cpfRaw.replace(/\D/g, "");
    const email = form.elements.email?.value?.trim() || "";
    const telefone = form.elements.telefone?.value?.trim() || "";
    const senha = form.elements.senha?.value || "";
    const confirmarSenha = form.elements.confirmarSenha?.value || "";
    const enderecoTexto = form.elements.endereco_text?.value?.trim() || "";
    const enderecoFormatado = form.elements.endereco_formatado?.value?.trim() || "";
    const enderecoAlternativo = form.elements.endereco?.value?.trim() || "";
    const endereco = enderecoTexto || enderecoFormatado || enderecoAlternativo;
    const placeId = form.elements.place_id?.value?.trim() || "";
    const lat = parseCoordinate(form.elements.lat?.value);
    const lng = parseCoordinate(form.elements.lng?.value);
    const bio = form.elements.bio?.value?.trim() || "";
    const aceiteTermos = form.elements.aceiteTermos?.checked ?? false;
    const servicos = collectServices(form);

    if (!aceiteTermos) {
      setFeedback("Você precisa aceitar os termos de uso e a política de privacidade.");
      setSubmitState();
      return;
    }

    if (senha !== confirmarSenha) {
      setFeedback("As senhas não conferem.");
      setSubmitState();
      return;
    }

    const payload = {
      type: "profissional",
      nome: nomeCompleto,
      cpf,
      email,
      telefone,
      senha,
      endereco,
      bio,
      aceiteTermos,
      origem: "site/profissional/cadastro",
    };

    appendStringField(payload, "endereco_texto", enderecoTexto);
    appendStringField(payload, "endereco_formatado", enderecoFormatado);
    appendStringField(payload, "enderecoAlternativo", enderecoAlternativo);
    appendStringField(payload, "place_id", placeId);
    appendNumberField(payload, "lat", lat);
    appendNumberField(payload, "lng", lng);

    if (servicos.length) {
      payload.servicos = servicos;
    }

    try {
      await submitWithFallback(FN_ENDPOINTS, payload);
      setFeedback("Cadastro enviado com sucesso!");
      form.reset();
      setSubmitState({ label: "Sucesso!" });
    } catch (error) {
      console.error("Erro ao registrar cadastro", error);
      const lastAttempt = Array.isArray(error?.attempts) && error.attempts.length
        ? error.attempts[error.attempts.length - 1]
        : null;
      const detail = lastAttempt?.body || lastAttempt?.error || "";
      setFeedback(
        detail
          ? `Não foi possível concluir o cadastro (${detail}). Tente novamente.`
          : "Ocorreu um problema ao enviar seus dados, tente novamente.",
      );
      setSubmitState();
      return;
    }

    setSubmitState();
  });
}
