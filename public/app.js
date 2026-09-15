let cart = [];
let menuItems = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchMenu();
    setupEventListeners();
    ensureNotificationModalExists();
});

async function fetchMenu() {
    try {
        const res = await fetch('/api/v1/menu');
        const data = await res.json();
        
        menuItems = Array.isArray(data) ? data : (data.items || data.data || []);
        renderMenu();
    } catch (err) {
        console.error('Помилка завантаження меню:', err);
    }
}

function renderMenu() {
    const container = document.getElementById('menu-container');
    if (!menuItems.length) {
        container.innerHTML = '<p style="color: #a0a0a0;">Меню порожнє або бекенд не віддав дані.</p>';
        return;
    }

    container.innerHTML = menuItems.map(item => {
        const price = item.basePrice ?? item.price ?? item.cost ?? 0;
        const name = item.title ?? item.name ?? 'Без назви';
        const desc = item.description ?? 'Ароматна кава';
        const id = item._id ?? item.id;

        return `
            <div class="menu-card">
                <div>
                    <h3>${name}</h3>
                    <p>${desc}</p>
                </div>
                <div>
                    <div class="price">${price} ₴</div>
                    <button class="add-to-cart-btn" onclick="addToCart('${id}')">Додати в кошик</button>
                </div>
            </div>
        `;
    }).join('');
}

function addToCart(id) {
    const item = menuItems.find(i => (i._id || i.id) === id);
    if (!item) return;
    
    const itemId = item._id || item.id;
    const existing = cart.find(i => (i._id || i.id) === itemId);
    
    const price = item.basePrice ?? item.price ?? item.cost ?? 0;
    const name = item.title ?? item.name ?? 'Товар';

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...item, resolvedPrice: price, resolvedName: name, quantity: 1 });
    }
    updateCartUI();
}

function updateCartUI() {
    const count = cart.reduce((sum, i) => sum + i.quantity, 0);
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.innerText = count;

    const list = document.getElementById('cart-items-list');
    if (!list) return;

    list.innerHTML = cart.map(i => {
        const price = i.resolvedPrice ?? i.basePrice ?? i.price ?? 0;
        const name = i.resolvedName ?? i.title ?? i.name ?? 'Товар';
        return `
            <div class="cart-item">
                <span>${name} (х${i.quantity})</span>
                <span>${price * i.quantity} ₴</span>
            </div>
        `;
    }).join('');

    const total = cart.reduce((sum, i) => {
        const price = i.resolvedPrice ?? i.basePrice ?? i.price ?? 0;
        return sum + (price * i.quantity);
    }, 0);
    
    const totalEl = document.getElementById('cart-total-price');
    if (totalEl) totalEl.innerText = total;
}

function setupEventListeners() {
    const modal = document.getElementById('cart-modal');
    
    const toggleBtn = document.getElementById('cart-toggle-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            if (modal) modal.classList.remove('hidden');
        });
    }

    const closeBtn = document.getElementById('close-cart');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (modal) modal.classList.add('hidden');
        });
    }

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (cart.length === 0) {
                showCustomMessage('Кошик порожній!', 'Помилка');
                return;
            }

            const totalPrice = cart.reduce((sum, i) => {
                const price = i.resolvedPrice ?? i.basePrice ?? i.price ?? 0;
                return sum + (price * i.quantity);
            }, 0);

            const orderData = {
                customerName: document.getElementById('customerName').value,
                phone: document.getElementById('phone').value,
                pickupTime: document.getElementById('pickupTime').value,
                totalPrice: totalPrice,
                items: cart.map(i => ({ productId: i._id || i.id, quantity: i.quantity }))
            };

            try {
                const res = await fetch('/api/v1/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                });

                const responseData = await res.json();

                if (res.ok) {
                    cart = [];
                    updateCartUI();
                    if (modal) modal.classList.add('hidden');
                    e.target.reset();
                    showCustomMessage('Замовлення успішно створено! Очікуйте на готовність.', 'Дякуємо!');
                } else {
                    console.error('Помилка від бекенда:', responseData);
                    showCustomMessage('Помилка: ' + (responseData.message || JSON.stringify(responseData)), 'Помилка');
                }
            } catch (err) {
                console.error(err);
                showCustomMessage('Помилка мережі. Перевірте з\'єднання.', 'Помилка');
            }
        });
    }
}

function ensureNotificationModalExists() {
    if (document.getElementById('custom-notification-modal')) return;

    const modalHTML = `
        <div id="custom-notification-modal" class="hidden" style="position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px);">
            <div style="background: #1a1a1a; border: 1px solid #333; padding: 24px; border-radius: 12px; max-width: 400px; width: 90%; text-align: center; color: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                <h3 id="custom-notification-title" style="margin-bottom: 12px; font-size: 20px; color: #d4af37;">Повідомлення</h3>
                <p id="custom-notification-text" style="margin-bottom: 20px; color: #ccc; line-height: 1.5;"></p>
                <button id="custom-notification-btn" style="background: #d4af37; color: #000; border: none; padding: 10px 24px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: background 0.2s;">Зрозуміло</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('custom-notification-btn').addEventListener('click', () => {
        document.getElementById('custom-notification-modal').classList.add('hidden');
    });
}

function showCustomMessage(text, title = 'Повідомлення') {
    ensureNotificationModalExists();
    document.getElementById('custom-notification-title').innerText = title;
    document.getElementById('custom-notification-text').innerText = text;
    document.getElementById('custom-notification-modal').classList.remove('hidden');
}