
const SUPABASE_URL = 'https://mdnxksiduzkxotbuykgz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kbnhrc2lkdXpreG90YnV5a2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1MzQ2MTksImV4cCI6MjEwNTExMDYxOX0.u-WzrI78Os4yx0yLRufpAI9pFR5Jhlb7I5ime1cXGIQ';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let cart = [];
let menuItems = [];

document.addEventListener('DOMContentLoaded', () => {
    ensureCartModalExists(); 
    fetchMenu();
    setupEventListeners();
    setupAuth();
    ensureNotificationModalExists();
    handleAuthUI();
});


supabaseClient.auth.onAuthStateChange((event, session) => {
    handleAuthUI();
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
    if (!container) return;
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

function ensureCartModalExists() {
    if (document.getElementById('cart-modal')) return;

    const modalHTML = `
        <div id="cart-modal" class="hidden" style="position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px);">
            <div style="background: #1a1a1a; border: 1px solid #333; padding: 24px; border-radius: 12px; max-width: 450px; width: 90%; color: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h2 style="color: #d4af37; margin: 0; font-size: 22px;">Кошик</h2>
                    <button id="close-cart" style="background: transparent; border: none; color: #fff; font-size: 20px; cursor: pointer;">&times;</button>
                </div>
                <div id="cart-items-list" style="max-height: 200px; overflow-y: auto; margin-bottom: 16px; border-bottom: 1px solid #333; padding-bottom: 10px;">
                    <p style="color: #888;">Кошик порожній</p>
                </div>
                <div style="margin-bottom: 16px; font-weight: bold; font-size: 16px;">
                    Загальна сума: <span id="cart-total-price" style="color: #d4af37;">0</span> ₴
                </div>
                <form id="checkout-form" style="display: flex; flex-direction: column; gap: 10px;">
                    <input type="text" id="customerName" placeholder="Ваше ім'я" required style="padding: 10px; background: #222; border: 1px solid #441; border-radius: 6px; color: #fff;">
                    <input type="tel" id="phone" placeholder="Номер телефону" required style="padding: 10px; background: #222; border: 1px solid #441; border-radius: 6px; color: #fff;">
                    <input type="text" id="pickupTime" placeholder="Час самовивозу (наприклад, 14:30)" required style="padding: 10px; background: #222; border: 1px solid #441; border-radius: 6px; color: #fff;">
                    <button type="submit" style="background: #d4af37; color: #000; border: none; padding: 12px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 5px;">Оформити замовлення</button>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function setupEventListeners() {
    
    const modal = document.getElementById('cart-modal') || document.querySelector('.cart-modal');
    
    const toggleBtn = document.getElementById('open-cart') || document.querySelector('.open-cart');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const currentModal = document.getElementById('cart-modal') || document.querySelector('.cart-modal');
            if (currentModal) {
                currentModal.classList.remove('hidden');
                currentModal.style.display = 'flex'; 
            }
        });
    }

    const closeBtn = document.getElementById('close-cart');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            const currentModal = document.getElementById('cart-modal') || document.querySelector('.cart-modal');
            if (currentModal) {
                currentModal.classList.add('hidden');
                currentModal.style.display = 'none';
            }
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
                    const currentModal = document.getElementById('cart-modal') || document.querySelector('.cart-modal');
                    if (currentModal) {
                        currentModal.classList.add('hidden');
                        currentModal.style.display = 'none';
                    }
                    e.target.reset();
                    showCustomMessage('Замовлення успішно створено! Очікуйте на готовність.', 'Дякуємо!');
                } else {
                    showCustomMessage('Помилка: ' + (responseData.message || JSON.stringify(responseData)), 'Помилка');
                }
            } catch (err) {
                console.error(err);
                showCustomMessage('Помилка мережі.', 'Помилка');
            }
        });
    }
}


function setupAuth() {
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');

    document.getElementById('open-login')?.addEventListener('click', () => loginModal?.classList.remove('hidden'));
    document.getElementById('close-login')?.addEventListener('click', () => loginModal?.classList.add('hidden'));

    document.getElementById('open-register')?.addEventListener('click', () => registerModal?.classList.remove('hidden'));
    document.getElementById('close-register')?.addEventListener('click', () => registerModal?.classList.add('hidden'));

    
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;

            const { error } = await supabaseClient.auth.signUp({ email, password });
            
            if (error) {
                showCustomMessage('Помилка реєстрації: ' + error.message, 'Помилка');
            } else {
                showCustomMessage('Реєстрація успішна! Увійдіть у систему.', 'Успіх');
                registerModal?.classList.add('hidden');
                registerForm.reset();
            }
        });
    }

    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
            
            if (error) {
                showCustomMessage('Помилка входу: ' + error.message, 'Помилка');
            } else {
                showCustomMessage('Ви успішно увійшли в систему!', 'Успіх');
                loginModal?.classList.add('hidden');
                loginForm.reset();
                handleAuthUI();
            }
        });
    }
}


async function handleAuthUI() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    const loginBtn = document.getElementById('open-login');
    const registerBtn = document.getElementById('open-register');

    if (session && session.user) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';

        let userProfileContainer = document.getElementById('user-profile-view');
        if (!userProfileContainer) {
            userProfileContainer = document.createElement('div');
            userProfileContainer.id = 'user-profile-view';
            userProfileContainer.style.cssText = 'display: inline-flex; align-items: center; gap: 10px; margin-left: 10px; color: #fff;';
            
            const cartToggle = document.getElementById('open-cart');
            if (cartToggle && cartToggle.parentNode) {
                cartToggle.parentNode.insertBefore(userProfileContainer, cartToggle);
            }
        }

        userProfileContainer.innerHTML = `
            <span style="font-size: 13px; color: #d4af37;">${session.user.email}</span>
            <button id="logout-btn" style="background: #1a1a1a; color: #fff; border: 1px solid #333; padding: 6px 12px; border-radius: 6px; cursor: pointer;">Вийти</button>
        `;

        document.getElementById('logout-btn')?.addEventListener('click', async () => {
            await supabaseClient.auth.signOut();
            userProfileContainer.remove();
            if (loginBtn) loginBtn.style.display = '';
            if (registerBtn) registerBtn.style.display = '';
            showCustomMessage('Ви вийшли з системи', 'Сеанс завершено');
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
                <button id="custom-notification-btn" style="background: #d4af37; color: #000; border: none; padding: 10px 24px; border-radius: 6px; font-weight: bold; cursor: pointer;">Зрозуміло</button>
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