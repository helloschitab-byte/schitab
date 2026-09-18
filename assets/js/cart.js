// SCHITAB — simple guest cart (browser-local, per device)
// Full checkout + real orders come in a later build phase.
// This stores just { bookId: quantity } so students can start collecting
// books while browsing, and see a running count.

const CART_KEY = 'schitab_cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  } catch {
    return {};
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(bookId, qty = 1) {
  const cart = getCart();
  cart[bookId] = (cart[bookId] || 0) + qty;
  saveCart(cart);
  showToast('Added to cart', 'success');
}

function cartCount() {
  const cart = getCart();
  return Object.values(cart).reduce((sum, q) => sum + q, 0);
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const count = cartCount();
  if (count > 0) {
    badge.textContent = count;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}
