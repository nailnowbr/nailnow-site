/**
 * @fileoverview Lógica para o formulário de cadastro de clientes.
 * @version 4.0
 *
 * @description
 * Envia o cadastro para a Cloud Function `registerClientAccount` (mesmo
 * endpoint usado pelo cadastro público em /cadastro), que cria o usuário
 * no Firebase Auth (senha hasheada) e grava o perfil na coleção `clientes`
 * do projeto correto. Antes gravávamos direto no Firestore com senha em
 * texto puro num projeto separado — não fazer isso de novo.
 */

const FN_ENDPOINTS = [
  "https://southamerica-east1-nailnow-site.cloudfunctions.net/registerClientAccount",
  "https://southamerica-east1-nailnow-7546c.cloudfunctions.net/registerClientAccount",
  "https://southamerica-east1-nailnow-7546c-53f84.cloudfunctions.net/registerClientAccount",
];

const form = document.getElementById("form-cadastro-cliente");
const btnSubmit = document.getElementById("btnSubmit");
const formMsg = document.getElementById("formMsg");

const DEFAULT_SUBMIT_LABEL = "Criar conta cliente";

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
  console.warn("[cliente-cadastro] Formulário não encontrado pelo id 'form-cadastro-cliente'.");
} else {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setSubmitState({ label: "Enviando...", disabled: true });
    setFeedback("");

    const nomeCompleto = form.elements.nome?.value?.trim() || "";
    const email = form.elements.email?.value?.trim() || "";
    const telefone = form.elements.telefone?.value?.trim() || "";
    const senha = form.elements.senha?.value || "";
    const confirmarSenha = form.elements.confirmarSenha?.value || "";
    const enderecoTexto = form.elements.endereco_text?.value?.trim() || "";
    const enderecoFormatado = form.elements.endereco_formatado?.value?.trim() || "";
    const enderecoAlternativo = form.elements.endereco?.value?.trim() || "";
    const endereco = enderecoTexto || enderecoFormatado || enderecoAlternativo;
    const complemento = form.elements.complemento?.value?.trim() || "";
    const placeId = form.elements.place_id?.value?.trim() || "";
    const lat = parseCoordinate(form.elements.lat?.value);
    const lng = parseCoordinate(form.elements.lng?.value);
    const aceiteTermos = form.elements.aceiteTermos?.checked ?? false;

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
      type: "cliente",
      nome: nomeCompleto,
      email,
      telefone,
      senha,
      endereco,
      aceiteTermos,
      origem: "site/cliente/cadastro",
    };

    appendStringField(payload, "endereco_texto", enderecoTexto);
    appendStringField(payload, "endereco_formatado", enderecoFormatado);
    appendStringField(payload, "enderecoAlternativo", enderecoAlternativo);
    appendStringField(payload, "complemento", complemento);
    appendStringField(payload, "place_id", placeId);
    appendNumberField(payload, "lat", lat);
    appendNumberField(payload, "lng", lng);

    try {
      await submitWithFallback(FN_ENDPOINTS, payload);
      setFeedback("Conta criada com sucesso!");
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
