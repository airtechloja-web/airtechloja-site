export const CART_STORAGE_KEY = "airtech-cart-v1";

export const PRODUCT_VARIANTS = {
  casal: {
    label: "Casal",
    dimensions: "31 x 138 x 188 cm",
    titleDimensions: "31x138x188",
    descriptionWidth: "138 cm (casal)",
    oldPrice: 199991,
    price: 69090,
    image: "./colchao-casal-frente.png",
  },
  solteiro: {
    label: "Solteiro",
    dimensions: "31 x 88 x 188 cm",
    titleDimensions: "31x88x188",
    descriptionWidth: "88 cm (solteiro)",
    oldPrice: 119991,
    price: 23090,
    image: "./colchao-solteiro.png",
  },
};

function isVariant(value) {
  return value === "casal" || value === "solteiro";
}

function validateCart(items) {
  if (!Array.isArray(items)) {
    throw new TypeError("O carrinho salvo possui um formato inválido.");
  }

  for (const item of items) {
    if (!item || !isVariant(item.variant) || !Number.isSafeInteger(item.quantity) || item.quantity < 1) {
      throw new TypeError("Um item salvo no carrinho possui dados inválidos.");
    }
  }

  return items;
}

export function getCart() {
  const savedCart = localStorage.getItem(CART_STORAGE_KEY);
  if (savedCart === null) return [];

  try {
    return validateCart(JSON.parse(savedCart));
  } catch (error) {
    throw new Error("Não foi possível ler o carrinho salvo neste navegador.", { cause: error });
  }
}

export function saveCart(items) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(validateCart(items)));
  updateCartBadge(items);
}

export function addToCart(variant) {
  if (!isVariant(variant)) {
    throw new RangeError(`Tamanho de colchão não reconhecido: ${variant}`);
  }

  const items = getCart();
  const existingItem = items.find((item) => item.variant === variant);

  if (existingItem) {
    existingItem.quantity += 1;
    if (!Number.isSafeInteger(existingItem.quantity)) {
      throw new RangeError("A quantidade do item excede o limite permitido.");
    }
  } else {
    items.push({ variant, quantity: 1 });
  }

  saveCart(items);
}

export function setCartQuantity(variant, quantity) {
  if (!isVariant(variant) || !Number.isSafeInteger(quantity) || quantity < 1) {
    throw new RangeError("Tamanho ou quantidade inválida para o carrinho.");
  }

  const items = getCart();
  const item = items.find((cartItem) => cartItem.variant === variant);
  if (!item) throw new RangeError("O item não foi encontrado no carrinho.");

  item.quantity = quantity;
  saveCart(items);
}

export function removeFromCart(variant) {
  if (!isVariant(variant)) {
    throw new RangeError(`Tamanho de colchão não reconhecido: ${variant}`);
  }

  saveCart(getCart().filter((item) => item.variant !== variant));
}

export function getCartCount(items = getCart()) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function getCartTotal(items = getCart()) {
  return items.reduce((total, item) => total + PRODUCT_VARIANTS[item.variant].price * item.quantity, 0);
}

export function formatPrice(valueInCents) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valueInCents / 100);
}

export function updateCartBadge(items = getCart()) {
  const count = getCartCount(items);
  document.querySelectorAll("[data-cart-count]").forEach((badge) => {
    const previousCount = Number(badge.textContent);
    const hasSyncedCount = badge.dataset.cartCountInitialized === "true";
    badge.textContent = String(count);
    if (hasSyncedCount && count > previousCount) {
      badge.classList.remove("is-increasing");
      void badge.offsetWidth;
      badge.classList.add("is-increasing");
    }
    badge.dataset.cartCountInitialized = "true";
  });
  document.querySelectorAll("[data-cart-link]").forEach((link) => {
    link.setAttribute("aria-label", `Carrinho, ${count} ${count === 1 ? "item" : "itens"}`);
  });
}
