let cart = [];
let menuItems = [];

document.addEventListener('DOMContentLoaded', () => {
    ensureCartModalExists();
    ensureProfileModalExists();
    fetchMenu();
    setupEventListeners();
    setupAuth();
    ensureNotificationModalExists();
    handleAuthUI();
});


async function fetchMenu(category = 'all', buttonElement = null) {
    if (buttonElement) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        buttonElement.classList.add('active');
    }

    try {
        if (!menuItems.length) {
            const res = await fetch('/api/v1/menu');
            const data = await res.json();
            menuItems = Array.isArray(data) ? data : (data.items || data.data || []);
        }
        renderMenu(category);
    } catch (err) {
        console.error('Помилка завантаження меню:', err);
    }
}


function filterProducts(category, buttonElement) {
    fetchMenu(category, buttonElement);
}

function renderMenu(filterCategory = 'all') {
    const container = document.getElementById('menu-container');
    if (!container) return;

    
    console.log("Всі товари та їх категорії:", menuItems.map(i => ({ name: i.title || i.name, category: i.category })));

    const cafeDescriptionHTML = `
        <div class="cafe-about-banner" style="grid-column: 1 / -1; background: #1f1f1f; border: 1px solid #333; border-radius: 12px; padding: 24px; margin-bottom: 20px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
            <h2 style="color: #d4af37; margin-top: 0; margin-bottom: 10px; font-size: 24px;">Ласкаво просимо до нашої кав'ярні!</h2>
            <p style="color: #bbb; font-size: 14px; line-height: 1.6; max-width: 700px; margin: 0 auto;">
                Ми готуємо для вас каву вищої якості зі свіжообсмажених зернових купажів. Кожна чашка — це тепло, затишок і майстерність наших бариста. 
                Обирайте улюблений напій, замовляйте онлайн із самовивозом та насолоджуйтесь справжнім смаком разом із нами!
            </p>
        </div>

        <!-- Кнопки фільтрації категорій -->
        <div class="category-filters" style="grid-column: 1 / -1; display: flex; justify-content: center; gap: 10px; margin-bottom: 20px;">
            <button class="filter-btn ${filterCategory === 'all' ? 'active' : ''}" onclick="filterProducts('all', this)" style="background: ${filterCategory === 'all' ? '#d4af37' : '#1a1a1a'}; color: ${filterCategory === 'all' ? '#000' : '#fff'}; border: 1px solid #333; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: ${filterCategory === 'all' ? 'bold' : 'normal'};">Усі</button>
            <button class="filter-btn ${filterCategory === 'coffee' ? 'active' : ''}" onclick="filterProducts('coffee', this)" style="background: ${filterCategory === 'coffee' ? '#d4af37' : '#1a1a1a'}; color: ${filterCategory === 'coffee' ? '#000' : '#fff'}; border: 1px solid #333; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: ${filterCategory === 'coffee' ? 'bold' : 'normal'};">Кава</button>
            <button class="filter-btn ${filterCategory === 'tea' ? 'active' : ''}" onclick="filterProducts('tea', this)" style="background: ${filterCategory === 'tea' ? '#d4af37' : '#1a1a1a'}; color: ${filterCategory === 'tea' ? '#000' : '#fff'}; border: 1px solid #333; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: ${filterCategory === 'tea' ? 'bold' : 'normal'};">Чай</button>
            <button class="filter-btn ${filterCategory === 'desserts' ? 'active' : ''}" onclick="filterProducts('desserts', this)" style="background: ${filterCategory === 'desserts' ? '#d4af37' : '#1a1a1a'}; color: ${filterCategory === 'desserts' ? '#000' : '#fff'}; border: 1px solid #333; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: ${filterCategory === 'desserts' ? 'bold' : 'normal'};">Десерти</button>
        </div>
    `;

    
    const filteredItems = menuItems.filter(item => {
        if (filterCategory === 'all') return true;
        
        const itemCat = (item.category || '').toLowerCase();
        
        if (filterCategory === 'coffee') {
            return itemCat.includes('coffee') || itemCat.includes('кав') || itemCat.includes('кофе');
        }
        if (filterCategory === 'tea') {
            return itemCat.includes('tea') || itemCat.includes('чай');
        }
        if (filterCategory === 'desserts') {
            return itemCat.includes('dessert') || itemCat.includes('десерт') || itemCat.includes('солод');
        }
        
        return itemCat.includes(filterCategory);
    });

    if (!filteredItems.length) {
        container.innerHTML = cafeDescriptionHTML + '<p style="color: #a0a0a0; grid-column: 1 / -1; text-align: center;">У цій категорії поки немає товарів.</p>';
        return;
    }

    const cardsHTML = filteredItems.map(item => {
        const price = item.basePrice ?? item.price ?? item.cost ?? 0;
        const name = item.title ?? item.name ?? 'Без назви';
        const id = item._id ?? item.id;
        const desc = item.description || 'Класичний кавовий напій';
        const imageUrl = item.imageUrl ?? item.image ?? 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=500&q=80';

        return `
            <div class="menu-card product-card" style="background: #1a1a1a; border: 1px solid #333; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;">
                <div style="height: 140px; overflow: hidden; background: #222;">
                    <img src="${imageUrl}" alt="${name}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div style="padding: 16px; display: flex; flex-direction: column; flex-grow: 1; justify-content: space-between;">
                    <div>
                        <h3 style="color: #fff; margin: 0 0 8px 0; font-size: 18px;">${name}</h3>
                        <p style="color: #888; font-size: 13px; margin: 0 0 16px 0; line-height: 1.4;">${desc}</p>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #2a2a2a; padding-top: 12px; gap: 10px;">
                        <div class="price" style="color: #d4af37; font-weight: bold; font-size: 16px; white-space: nowrap; flex-shrink: 0;">
                            ${price} ₴
                        </div>
                        <button class="add-to-cart-btn" onclick="addToCart('${id}')" style="background: #d4af37; color: #000; border: none; padding: 7px 14px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; white-space: nowrap;">В кошик</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = cafeDescriptionHTML + cardsHTML;
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

    if (cart.length === 0) {
        list.innerHTML = '<p style="color: #888;">Кошик порожній</p>';
    } else {
        list.innerHTML = cart.map(i => {
            const price = i.resolvedPrice ?? i.basePrice ?? i.price ?? 0;
            const name = i.resolvedName ?? i.title ?? i.name ?? 'Товар';
            return `
                <div class="cart-item" style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #ccc;">
                    <span>${name} (х${i.quantity})</span>
                    <span style="color: #d4af37; font-weight: bold; white-space: nowrap;">${price * i.quantity} ₴</span>
                </div>
            `;
        }).join('');
    }

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
        <div id="cart-modal" class="hidden" style="position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: none; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px);">
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

function ensureProfileModalExists() {
    if (document.getElementById('profile-modal')) return;

    const modalHTML = `
        <div id="profile-modal" class="hidden" style="position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: none; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px);">
            <div style="background: #1a1a1a; border: 1px solid #333; padding: 24px; border-radius: 12px; max-width: 550px; width: 90%; color: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h2 style="color: #d4af37; margin: 0; font-size: 22px;">Особистий кабінет</h2>
                    <button id="close-profile" style="background: transparent; border: none; color: #fff; font-size: 20px; cursor: pointer;">&times;</button>
                </div>
                <div style="margin-bottom: 16px; border-bottom: 1px solid #333; padding-bottom: 12px;">
                    <p style="color: #888; margin: 0 0 4px 0; font-size: 12px;">Електронна пошта:</p>
                    <p id="profile-email-text" style="color: #fff; font-weight: 600; margin: 0; font-size: 15px;"></p>
                </div>
                <div>
                    <h3 style="color: #d4af37; font-size: 16px; margin-bottom: 10px;">Історія ваших замовлень</h3>
                    <div id="profile-orders-list" style="max-height: 250px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
                        <p style="color: #888;">Завантаження замовлень...</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.addEventListener('click', (e) => {
        const modal = document.getElementById('profile-modal');
        if (!modal) return;
        if (e.target.id === 'close-profile' || e.target === modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    });
}

async function loadUserOrders() {
    const listContainer = document.getElementById('profile-orders-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<p style="color: #888;">Завантаження...</p>';

    try {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) {
            listContainer.innerHTML = '<p style="color: #e74c3c;">Будь ласка, увійдіть у систему.</p>';
            return;
        }

        const res = await fetch(`/api/v1/orders?email=${encodeURIComponent(userEmail)}`);
        if (!res.ok) throw new Error('Не вдалося завантажити замовлення');
        
        const data = await res.json();
        const orders = Array.isArray(data) ? data : (data.items || data.data || []);

        if (orders.length === 0) {
            listContainer.innerHTML = '<p style="color: #888;">У вас поки немає замовлень.</p>';
            return;
        }

        listContainer.innerHTML = orders.map(order => `
            <div style="background: #222; border: 1px solid #333; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 6px;">
                <div style="display: flex; justify-content: space-between; font-size: 13px;">
                    <span style="color: #d4af37; font-weight: bold;">Замовлення #${(order._id || order.id || '').slice(-6)}</span>
                    <span style="color: #aaa;">Самовивоз: ${order.pickupTime || 'Не вказано'}</span>
                </div>
                <div style="font-size: 13px; color: #ccc;">
                    Ім'я: ${order.customerName || 'Клієнт'} | Тел: ${order.phone || 'Не вказано'}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #2a2a2a; padding-top: 6px; margin-top: 2px;">
                    <span style="font-size: 13px; color: #888;">Статус: <strong style="color: #fff;">${order.status || 'Опрацьовується'}</strong></span>
                    <span style="color: #d4af37; font-weight: bold; font-size: 14px;">${order.totalPrice || 0} ₴</span>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error(err);
        listContainer.innerHTML = '<p style="color: #e74c3c;">Помилка завантаження історії замовлень.</p>';
    }
}

function setupEventListeners() {
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

    document.addEventListener('click', (e) => {
        const currentModal = document.getElementById('cart-modal') || document.querySelector('.cart-modal');
        if (!currentModal) return;

        if (e.target.id === 'close-cart' || e.target === currentModal) {
            currentModal.classList.add('hidden');
            currentModal.style.display = 'none';
        }
    });

    document.addEventListener('submit', async (e) => {
        if (e.target && e.target.id === 'checkout-form') {
            e.preventDefault();
            if (cart.length === 0) {
                showCustomMessage('Кошик порожній!', 'Помилка');
                return;
            }

            const userEmail = localStorage.getItem('userEmail');

            const totalPrice = cart.reduce((sum, i) => {
                const price = i.resolvedPrice ?? i.basePrice ?? i.price ?? 0;
                return sum + (price * i.quantity);
            }, 0);

            const orderData = {
                customerName: document.getElementById('customerName').value,
                phone: document.getElementById('phone').value,
                pickupTime: document.getElementById('pickupTime').value,
                totalPrice: totalPrice,
                email: userEmail || undefined, 
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
        }
    });
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

            try {
                const res = await fetch('/api/v1/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();

                if (res.ok) {
                    showCustomMessage('Реєстрація успішна! Увійдіть у систему.', 'Успіх');
                    registerModal?.classList.add('hidden');
                    registerForm.reset();
                } else {
                    showCustomMessage('Помилка реєстрації: ' + (data.error || 'Невідома помилка'), 'Помилка');
                }
            } catch (err) {
                showCustomMessage('Помилка мережі', 'Помилка');
            }
        });
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const res = await fetch('/api/v1/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem('userEmail', data.email);
                    showCustomMessage('Ви успішно увійшли в систему!', 'Успіх');
                    loginModal?.classList.add('hidden');
                    loginForm.reset();
                    handleAuthUI();
                } else {
                    showCustomMessage('Помилка входу: ' + (data.error || 'Невідома помилка'), 'Помилка');
                }
            } catch (err) {
                showCustomMessage('Помилка мережі', 'Помилка');
            }
        });
    }
}

function handleAuthUI() {
    const userEmail = localStorage.getItem('userEmail');
    
    const loginBtn = document.getElementById('open-login');
    const registerBtn = document.getElementById('open-register');

    if (userEmail) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';

        let userProfileContainer = document.getElementById('user-profile-view');
        if (!userProfileContainer) {
            userProfileContainer = document.createElement('div');
            userProfileContainer.id = 'user-profile-view';
            userProfileContainer.style.cssText = 'display: inline-flex; align-items: center; gap: 8px; margin-left: 10px; color: #fff;';
            
            const cartToggle = document.getElementById('open-cart');
            if (cartToggle && cartToggle.parentNode) {
                cartToggle.parentNode.insertBefore(userProfileContainer, cartToggle);
            }
        }

        userProfileContainer.innerHTML = `
            <button id="open-profile-modal" style="background: #222; color: #d4af37; border: 1px solid #441; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600;">Профіль</button>
            <button id="logout-btn" style="background: #1a1a1a; color: #fff; border: 1px solid #333; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-size: 13px;">Вийти</button>
        `;

        document.getElementById('open-profile-modal')?.addEventListener('click', () => {
            const emailText = document.getElementById('profile-email-text');
            if (emailText) emailText.innerText = userEmail;
            
            const profileModal = document.getElementById('profile-modal');
            if (profileModal) {
                profileModal.classList.remove('hidden');
                profileModal.style.display = 'flex';
                loadUserOrders();
            }
        });

        document.getElementById('logout-btn')?.addEventListener('click', () => {
            localStorage.removeItem('userEmail');
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
        <div id="custom-notification-modal" class="hidden" style="position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: none; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px);">
            <div style="background: #1a1a1a; border: 1px solid #333; padding: 24px; border-radius: 12px; max-width: 400px; width: 90%; text-align: center; color: #fff; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                <h3 id="custom-notification-title" style="margin-bottom: 12px; font-size: 20px; color: #d4af37;">Повідомлення</h3>
                <p id="custom-notification-text" style="margin-bottom: 20px; color: #ccc; line-height: 1.5;"></p>
                <button id="custom-notification-btn" style="background: #d4af37; color: #000; border: none; padding: 10px 24px; border-radius: 6px; font-weight: bold; cursor: pointer;">Зрозуміло</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.getElementById('custom-notification-btn').addEventListener('click', () => {
        const modal = document.getElementById('custom-notification-modal');
        modal.classList.add('hidden');
        modal.style.display = 'none';
    });
}

function showCustomMessage(text, title = 'Повідомлення') {
    ensureNotificationModalExists();
    const modal = document.getElementById('custom-notification-modal');
    document.getElementById('custom-notification-title').innerText = title;
    document.getElementById('custom-notification-text').innerText = text;
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}