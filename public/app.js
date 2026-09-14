const API_BASE = '/api/v1';
let selectedProduct = { id: null, price: 0, title: '' };

document.addEventListener('DOMContentLoaded', () => {
  fetchMenu();
  fetchOrders();

  const form = document.getElementById('createOrderForm');
  if (form) {
    form.addEventListener('submit', handleCreateOrder);
  }
});

function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

  const targetTab = document.getElementById(tabId);
  if (targetTab) targetTab.classList.remove('hidden');

  if (tabId === 'menuTab') {
    const btnMenu = document.getElementById('btnMenu');
    if (btnMenu) btnMenu.classList.add('active');
    fetchMenu();
  } else {
    const btnOrders = document.getElementById('btnOrders');
    if (btnOrders) btnOrders.classList.add('active');
    fetchOrders();
  }
}

function toggleLoader(show) {
  const loader = document.getElementById('loader');
  if (loader) loader.classList.toggle('hidden', !show);
}

function showAlert(message, type = 'success') {
  const box = document.getElementById('alertBox');
  if (!box) return;
  box.className = `alert alert-${type}`;
  box.textContent = message;
  box.classList.remove('hidden');
  setTimeout(() => box.classList.add('hidden'), 3500);
}

async function fetchMenu() {
  const container = document.getElementById('menuGrid');
  if (!container) return;
  toggleLoader(true);
  try {
    const res = await fetch(`${API_BASE}/menu`);
    if (!res.ok) throw new Error('Помилка завантаження меню');
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted);">Меню порожнє.</p>';
      return;
    }

    container.innerHTML = data.map(item => `
      <div class="card">
        <div>
          <div class="card-category">${item.category || 'КАВА'}</div>
          <div class="card-title">${item.title}</div>
          <div class="card-price">${item.basePrice || item.price} ₴</div>
        </div>
        <button class="btn-primary" type="button" onclick="selectMenuItem('${item._id}', ${item.basePrice || item.price}, '${item.title.replace(/'/g, "\\'")}')">
          Обрати
        </button>
      </div>
    `).join('');
  } catch (err) {
    showAlert(err.message, 'error');
  } finally {
    toggleLoader(false);
  }
}

function selectMenuItem(id, price, title) {
  selectedProduct = { id, price, title };
  const input = document.getElementById('selectedItemId');
  if (input) input.value = `${title} (${price} ₴)`;
  showAlert(`Обрано: ${title}`, 'success');
}

async function handleCreateOrder(e) {
  e.preventDefault();
  if (!selectedProduct.id) return showAlert('Будь ласка, оберіть позицію з меню', 'error');

  const payload = {
    customerName: document.getElementById('customerName').value,
    phone: document.getElementById('customerPhone').value,
    pickupTime: document.getElementById('pickupTime').value,
    totalPrice: selectedProduct.price,
    items: [{
      productId: selectedProduct.id,
      title: selectedProduct.title,
      name: selectedProduct.title,
      productTitle: selectedProduct.title,
      quantity: 1,
      selectedOptions: { milk: "Стандартне", syrups: [] }
    }]
  };

  toggleLoader(true);
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Помилка створення замовлення');

    showAlert('Замовлення успішно створено!', 'success');
    document.getElementById('createOrderForm').reset();
    document.getElementById('selectedItemId').value = '';
    selectedProduct = { id: null, price: 0, title: '' };
    fetchOrders();
  } catch (err) {
    showAlert(err.message, 'error');
  } finally {
    toggleLoader(false);
  }
}

async function fetchOrders() {
  const container = document.getElementById('ordersList');
  if (!container) return;
  toggleLoader(true);
  try {
    const res = await fetch(`${API_BASE}/orders`);
    if (!res.ok) throw new Error('Помилка завантаження замовлень');
    const orders = await res.json();

    if (!Array.isArray(orders) || !orders.length) {
      container.innerHTML = '<p style="color: var(--text-muted);">Активних замовлень немає.</p>';
      return;
    }

    container.innerHTML = orders.map(ord => {
      let itemsText = '';

      if (Array.isArray(ord.items) && ord.items.length > 0) {
        itemsText = ord.items
          .map(i => {
            if (typeof i === 'string') return i;
            const name = i.title || i.name || i.productTitle || i.productName || i.productId?.title || i.productId?.name || (typeof i.product === 'object' ? i.product?.title : i.product);
            const qty = i.quantity ? ` (${i.quantity}x)` : '';
            return name ? `${name}${qty}` : null;
          })
          .filter(Boolean)
          .join(', ');
      }

      if (!itemsText) {
        itemsText = ord.productTitle || ord.title || ord.productName || ord.product || 'Без назви';
      }

      const status = (ord.status || 'PENDING').toLowerCase();

      return `
        <div class="card">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
              <div>
                <strong style="font-size: 1.05rem;">${ord.customerName || ord.name || 'Клієнт'}</strong>
                <div style="font-size: 0.85rem; color: var(--text-muted);">${ord.phone || ord.phoneNumber || ''}</div>
              </div>
              <span class="badge badge-${status}">${status.toUpperCase()}</span>
            </div>
            <div style="margin-bottom: 0.75rem; font-size: 0.9rem; background: rgba(0,0,0,0.03); padding: 8px; border-radius: 6px;">
              <strong>Замовлення:</strong> ${itemsText}
            </div>
            <div style="margin-bottom: 1rem; font-size: 0.9rem;">
              <div>Час: <strong>${ord.pickupTime || ord.time || '—'}</strong></div>
              <div>Сума: <strong>${ord.totalPrice || ord.price || 0} ₴</strong></div>
            </div>
          </div>
          ${status !== 'completed' ? `
            <button class="btn-primary" onclick="updateOrderStatus('${ord._id}', 'completed')">
              Позначити як виконане
            </button>
          ` : ''}
        </div>
      `;
    }).join('');
  } catch (err) {
    showAlert(err.message, 'error');
  } finally {
    toggleLoader(false);
  }
}

async function updateOrderStatus(id, newStatus) {
  toggleLoader(true);
  try {
    let res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    if (!res.ok) {
      res = await fetch(`${API_BASE}/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    }

    if (!res.ok) throw new Error('Не вдалося оновити статус');
    showAlert('Статус оновлено!', 'success');
    fetchOrders();
  } catch (err) {
    showAlert(err.message, 'error');
  } finally {
    toggleLoader(false);
  }
}