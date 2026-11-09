import {
  PRODUCT_VARIANTS,
  addToCart,
  formatPrice,
  updateCartBadge,
} from "./cart-store.js?v=4";

const productImagesByVariant = {
  casal: [
    {
      src: "https://product-hub-prd.madeiramadeira.com.br/998076280/images/63db6bbc-5f69-4219-b57c-8122d76e42af95b5f466standardresolution.jpg",
      thumbnail: "https://product-hub-prd.madeiramadeira.com.br/998076280/images/63db6bbc-5f69-4219-b57c-8122d76e42af95b5f466standardresolution.jpg?width=256&canvas=1:1&bg-color=FFF",
      alt: "Colchão casal Ortobom Airtech Springpocket",
    },
    {
      src: "./colchao-medidas-31cm.png",
      thumbnail: "./colchao-medidas-31cm.png",
      alt: "Colchão casal com medidas de 31 cm de altura, 138 cm de largura e 188 cm de comprimento",
    },
    {
      src: "./colchao-casal-frente.png",
      thumbnail: "./colchao-casal-frente.png",
      alt: "Vista frontal do colchão casal Airtech Springpocket",
    },
    {
      src: "./colchao-casal-tecido.png",
      thumbnail: "./colchao-casal-tecido.png",
      alt: "Detalhe do tecido do colchão casal Airtech Springpocket",
    },
    {
      src: "./colchao-casal-acabamento.png",
      thumbnail: "./colchao-casal-acabamento.png",
      alt: "Detalhe do acabamento do colchão casal Airtech Springpocket",
    },
  ],
  solteiro: [
    {
      src: "./colchao-solteiro.png",
      thumbnail: "./colchao-solteiro.png",
      alt: "Colchão solteiro Ortobom Airtech Springpocket",
    },
    {
      src: "./colchao-solteiro-medidas.png",
      thumbnail: "./colchao-solteiro-medidas.png",
      alt: "Colchão solteiro com medidas de 31 cm de altura, 88 cm de largura e 188 cm de comprimento",
    },
    {
      src: "./colchao-solteiro-frente.png",
      thumbnail: "./colchao-solteiro-frente.png",
      alt: "Vista frontal do colchão solteiro Airtech Springpocket",
    },
    {
      src: "./colchao-solteiro-tecido.png",
      thumbnail: "./colchao-solteiro-tecido.png",
      alt: "Detalhe do tecido do colchão solteiro Airtech Springpocket",
    },
    {
      src: "./colchao-solteiro-acabamento.png",
      thumbnail: "./colchao-solteiro-acabamento.png",
      alt: "Detalhe do acabamento do colchão solteiro Airtech Springpocket",
    },
  ],
};

const heroImage = document.querySelector(".hero-image");
const heroImageWrap = document.querySelector(".hero-image-wrap");
const imageCount = document.querySelector(".image-count");
const thumbsContainer = document.querySelector(".gallery-thumbs");
const oldPriceValue = document.querySelector(".old-price__value");
const discountValue = document.querySelector(".discount");
const currentPriceValue = document.querySelector(".pix-price__value");
const productTitle = document.querySelector("#product-title");
const descriptionWidth = document.querySelector("[data-description-width]");
const cartFeedback = document.querySelector("#cart-feedback");
let selectedVariant = "casal";
let currentImages = productImagesByVariant.casal;
let activeImage = 0;

function showImage(index) {
  activeImage = (index + currentImages.length) % currentImages.length;
  heroImageWrap.classList.remove("is-zoomed");
  heroImage.style.transformOrigin = "center";
  heroImage.src = currentImages[activeImage].src;
  heroImage.alt = currentImages[activeImage].alt;
  imageCount.textContent = `${activeImage + 1}/${currentImages.length}`;
  thumbsContainer.replaceChildren(...currentImages.map((image, thumbIndex) => {
    const thumb = document.createElement("button");
    thumb.type = "button";
    thumb.className = "thumb";
    thumb.classList.toggle("is-active", thumbIndex === activeImage);
    thumb.dataset.image = String(thumbIndex);
    thumb.setAttribute("aria-label", `Ver imagem ${thumbIndex + 1}: ${image.alt}`);

    const thumbnail = document.createElement("img");
    thumbnail.src = image.thumbnail;
    thumbnail.alt = image.alt;
    thumb.append(thumbnail);
    return thumb;
  }));
}

heroImageWrap.addEventListener("pointermove", (event) => {
  if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
  if (event.target !== heroImage) {
    heroImageWrap.classList.remove("is-zoomed");
    return;
  }

  const bounds = heroImageWrap.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width) * 100;
  const y = ((event.clientY - bounds.top) / bounds.height) * 100;
  heroImage.style.transformOrigin = `${x}% ${y}%`;
  heroImageWrap.classList.add("is-zoomed");
});

heroImageWrap.addEventListener("pointerleave", () => {
  heroImageWrap.classList.remove("is-zoomed");
  heroImage.style.transformOrigin = "center";
});

thumbsContainer.addEventListener("click", (event) => {
  const thumb = event.target.closest(".thumb");
  if (thumb && thumbsContainer.contains(thumb)) showImage(Number(thumb.dataset.image));
});
document.querySelector(".gallery-arrow--prev").addEventListener("click", () => showImage(activeImage - 1));
document.querySelector(".gallery-arrow--next").addEventListener("click", () => showImage(activeImage + 1));

document.querySelectorAll(".variant-option").forEach((option) => {
  option.addEventListener("click", () => selectVariant(option.dataset.variant));
});

document.querySelectorAll(".category-variant").forEach((option) => {
  option.addEventListener("click", () => selectVariant(option.dataset.variant));
});

const reviewList = document.querySelector(".review-list");
const reviewCards = [...reviewList.querySelectorAll(".review-card")];
const previousReviewButton = document.querySelector(".review-control--previous");
const nextReviewButton = document.querySelector(".review-control--next");
const mobileReviews = window.matchMedia("(max-width: 720px)");

function getActiveReviewIndex() {
  const listLeft = reviewList.getBoundingClientRect().left;
  return reviewCards.reduce((closestIndex, card, index) => {
    const closestDistance = Math.abs(reviewCards[closestIndex].getBoundingClientRect().left - listLeft);
    const distance = Math.abs(card.getBoundingClientRect().left - listLeft);
    return distance < closestDistance ? index : closestIndex;
  }, 0);
}

function updateReviewControls() {
  if (!mobileReviews.matches) {
    previousReviewButton.disabled = true;
    nextReviewButton.disabled = true;
    return;
  }

  const activeIndex = getActiveReviewIndex();
  previousReviewButton.disabled = activeIndex === 0;
  nextReviewButton.disabled = activeIndex === reviewCards.length - 1;
}

function scrollToReview(index) {
  const card = reviewCards[index];
  if (!card) return;

  const left = card.getBoundingClientRect().left - reviewList.getBoundingClientRect().left + reviewList.scrollLeft;
  reviewList.scrollTo({
    left,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
  });
}

previousReviewButton.addEventListener("click", () => {
  scrollToReview(getActiveReviewIndex() - 1);
});
nextReviewButton.addEventListener("click", () => {
  scrollToReview(getActiveReviewIndex() + 1);
});
reviewList.addEventListener("scroll", updateReviewControls, { passive: true });
mobileReviews.addEventListener("change", updateReviewControls);
window.addEventListener("resize", updateReviewControls);
updateReviewControls();

const certificationTrack = document.querySelector(".cert-carousel__track");
const certificationCards = [...certificationTrack.querySelectorAll(".cert-card")];
const previousCertificationButton = document.querySelector(".cert-control--previous");
const nextCertificationButton = document.querySelector(".cert-control--next");
let activeCertificationIndex = 0;

function showCertification(index) {
  activeCertificationIndex = Math.max(0, Math.min(index, certificationCards.length - 1));
  certificationTrack.style.transform = `translateX(-${activeCertificationIndex * 100}%)`;
  previousCertificationButton.disabled = activeCertificationIndex === 0;
  nextCertificationButton.disabled = activeCertificationIndex === certificationCards.length - 1;
}

previousCertificationButton.addEventListener("click", () => {
  showCertification(activeCertificationIndex - 1);
});
nextCertificationButton.addEventListener("click", () => {
  showCertification(activeCertificationIndex + 1);
});

function animateCartAdd(sourceButton) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const badge = document.querySelector("[data-cart-count]");
  if (!badge) return;

  const source = sourceButton.getBoundingClientRect();
  const destination = badge.getBoundingClientRect();
  const flyer = document.createElement("span");
  flyer.className = "cart-fly-item";
  flyer.setAttribute("aria-hidden", "true");
  flyer.textContent = "+1";
  flyer.style.left = `${source.left + source.width / 2}px`;
  flyer.style.top = `${source.top + source.height / 2}px`;
  document.body.append(flyer);

  const animation = flyer.animate([
    {
      left: `${source.left + source.width / 2}px`,
      top: `${source.top + source.height / 2}px`,
      transform: "translate(-50%, -50%) scale(1)",
      opacity: 1,
    },
    {
      left: `${destination.left + destination.width / 2}px`,
      top: `${destination.top + destination.height / 2}px`,
      transform: "translate(-50%, -50%) scale(.35)",
      opacity: .2,
    },
  ], {
    duration: 680,
    easing: "cubic-bezier(.22, .8, .34, 1)",
  });
  animation.onfinish = () => flyer.remove();
}

document.querySelector("#add-to-cart").addEventListener("click", (event) => {
  animateCartAdd(event.currentTarget);
  addToCart(selectedVariant);
  updateCartBadge();
  cartFeedback.hidden = false;
  cartFeedback.textContent = `Colchão ${PRODUCT_VARIANTS[selectedVariant].label} adicionado ao carrinho.`;
});

function selectVariant(variant) {
  if (variant !== "solteiro" && variant !== "casal") {
    throw new Error(`Tamanho de colchão não reconhecido: ${variant}`);
  }

  const prices = PRODUCT_VARIANTS[variant];
  const discount = Math.round(((prices.oldPrice - prices.price) / prices.oldPrice) * 100);
  selectedVariant = variant;
  const title = `Colchão ${prices.label} Molas Ensacadas Airtech Springpocket Ortobom ${prices.titleDimensions}`;
  productTitle.textContent = title;
  document.title = `${title} | MadeiraMadeira`;
  descriptionWidth.textContent = prices.descriptionWidth;
  oldPriceValue.textContent = formatPrice(prices.oldPrice);
  currentPriceValue.textContent = formatPrice(prices.price);
  discountValue.textContent = `↓ ${discount}%`;

  document.querySelectorAll(".variant-option, .category-variant").forEach((control) => {
    const isSelected = control.dataset.variant === variant;
    control.classList.toggle("is-selected", isSelected);
    control.setAttribute("aria-pressed", String(isSelected));
  });

  currentImages = productImagesByVariant[variant];
  showImage(0);
}

showImage(0);
updateCartBadge();

document.querySelector("#cookie-close").addEventListener("click", () => {
  document.querySelector("#cookie-banner").remove();
});
