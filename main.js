let currentPage = 'inicio';
let cart = [];

// Cargar carrito al inicio
loadCart();

function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('open');
}

function closeMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.remove('open');
}

function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    cartSidebar.classList.toggle('open');
    cartOverlay.classList.toggle('active');
}

async function addToCart(name, price, type) {
    try {
        const formData = new FormData();
        formData.append('action', 'add_to_cart');
        formData.append('name', name);
        formData.append('price', price);
        formData.append('type', type);

        const response = await fetch('index.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            cart = data.cart;
            updateCartDisplay();
            toggleCart();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al agregar al carrito');
    }
}

async function removeFromCart(index) {
    try {
        const formData = new FormData();
        formData.append('action', 'remove_from_cart');
        formData.append('index', index);

        const response = await fetch('index.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            cart = data.cart;
            updateCartDisplay();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function updateQuantity(index, change) {
    try {
        const formData = new FormData();
        formData.append('action', 'update_quantity');
        formData.append('index', index);
        formData.append('change', change);

        const response = await fetch('index.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            cart = data.cart;
            updateCartDisplay();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function loadCart() {
    try {
        const response = await fetch('index.php?get_cart=1');
        const data = await response.json();
        cart = data.cart;
        updateCartDisplay();
    } catch (error) {
        console.error('Error:', error);
    }
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotal = document.getElementById('cartTotal');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🛍️</div>
                <p>Tu carrito está vacío</p>
            </div>
        `;
        cartFooter.style.display = 'none';
    } else {
        cartItems.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-image">${item.type === 'vela' ? '🕯️' : '🧼'}</div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price} MXN</div>
                    <div class="cart-item-quantity">
                        <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                </div>
                <span class="remove-item" onclick="removeFromCart(${index})">🗑️</span>
            </div>
        `).join('');
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `${total} MXN`;
        cartFooter.style.display = 'block';
    }
}

async function checkout() {
    if (cart.length === 0) return;
    
    try {
        const formData = new FormData();
        formData.append('action', 'checkout');

        const response = await fetch('index.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            const items = cart.map(item => `${item.quantity}x ${item.name}`).join(', ');
            
            alert(`¡Gracias por tu compra!

Productos: ${items}
Total: ${data.purchase.total} MXN

Nos pondremos en contacto contigo pronto.`);
            
            cart = [];
            updateCartDisplay();
            toggleCart();
            
            // Recargar la página de compras si está activa
            if (currentPage === 'compras') {
                loadPurchases();
            }
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al procesar la compra');
    }
}

function viewReceipt() {
    if (cart.length === 0) return;
    
    const receiptModal = document.getElementById('receiptModal');
    const receiptItems = document.getElementById('receiptItems');
    const receiptDate = document.getElementById('receiptDate');
    const receiptNumber = document.getElementById('receiptNumber');
    const receiptSubtotal = document.getElementById('receiptSubtotal');
    const receiptTotal = document.getElementById('receiptTotal');
    
    const now = new Date();
    receiptDate.textContent = now.toLocaleString('es-MX');
    receiptNumber.textContent = now.getTime();
    
    receiptItems.innerHTML = cart.map(item => `
        <div class="receipt-item">
            <div class="receipt-item-name">${item.name}</div>
            <div class="receipt-item-qty">x${item.quantity}</div>
            <div class="receipt-item-price">$${item.price * item.quantity} MXN</div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    receiptSubtotal.textContent = `$${total} MXN`;
    receiptTotal.textContent = `$${total} MXN`;
    
    receiptModal.classList.add('active');
}

function closeReceipt() {
    const receiptModal = document.getElementById('receiptModal');
    receiptModal.classList.remove('active');
}

function printReceipt() {
    viewReceipt();
    setTimeout(() => {
        window.print();
    }, 500);
}

function downloadReceipt() {
    alert('Función de descarga en desarrollo. Usa la opción de imprimir y guarda como PDF.');
    window.print();
}

function showPage(pageId) {
    if (currentPage === pageId) return;
    
    const pages = document.querySelectorAll('.page');
    const currentPageEl = document.getElementById(currentPage);
    const targetPageEl = document.getElementById(pageId);
    
    if (!targetPageEl) return;
    
    const pageOrder = ['inicio', 'colecciones', 'productos', 'nosotros', 'compras', 'contacto'];
    const currentIndex = pageOrder.indexOf(currentPage);
    const targetIndex = pageOrder.indexOf(pageId);
    
    if (currentPageEl) {
        if (targetIndex > currentIndex) {
            currentPageEl.classList.add('exit-left');
        } else {
            currentPageEl.classList.add('exit-right');
        }
        
        setTimeout(() => {
            currentPageEl.classList.remove('active', 'exit-left', 'exit-right');
        }, 800);
    }
    
    setTimeout(() => {
        targetPageEl.classList.add('active');
        currentPage = pageId;
        
        // Cargar compras si se navega a esa página
        if (pageId === 'compras') {
            loadPurchases();
        }
    }, 100);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadPurchases() {
    try {
        const response = await fetch('index.php?get_purchases=1');
        const data = await response.json();
        displayPurchases(data.purchases);
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayPurchases(purchases) {
    const purchaseList = document.getElementById('purchaseList');
    
    if (!purchases || purchases.length === 0) {
        purchaseList.innerHTML = `
            <div class="cart-empty" style="padding: 80px 20px;">
                <div class="cart-empty-icon">📦</div>
                <p>No hay compras registradas</p>
                <p style="font-size: 0.9em; color: #8b8b8b; margin-top: 10px;">Tus compras aparecerán aquí después de finalizar una compra</p>
            </div>
        `;
        return;
    }
    
    purchaseList.innerHTML = purchases.map(purchase => `
        <div class="purchase-card">
            <div class="purchase-header">
                <div class="purchase-number">Compra #${purchase.id}</div>
                <div class="purchase-date">${new Date(purchase.date).toLocaleString('es-MX')}</div>
            </div>
            <div class="purchase-items">
                ${purchase.items.map(item => `
                    <div class="purchase-item-row">
                        <span>${item.quantity}x ${item.name}</span>
                        <span>$${item.price * item.quantity} MXN</span>
                    </div>
                `).join('')}
            </div>
            <div class="purchase-total">
                <span>TOTAL:</span>
                <span>$${purchase.total} MXN</span>
            </div>
            <div class="purchase-actions">
                <button class="view-receipt-btn" onclick='viewPurchaseReceipt(${JSON.stringify(purchase)})'>Ver Nota de Venta</button>
            </div>
        </div>
    `).join('');
}

function viewPurchaseReceipt(purchase) {
    const receiptModal = document.getElementById('receiptModal');
    const receiptItems = document.getElementById('receiptItems');
    const receiptDate = document.getElementById('receiptDate');
    const receiptNumber = document.getElementById('receiptNumber');
    const receiptSubtotal = document.getElementById('receiptSubtotal');
    const receiptTotal = document.getElementById('receiptTotal');
    
    receiptDate.textContent = new Date(purchase.date).toLocaleString('es-MX');
    receiptNumber.textContent = purchase.id;
    
    receiptItems.innerHTML = purchase.items.map(item => `
        <div class="receipt-item">
            <div class="receipt-item-name">${item.name}</div>
            <div class="receipt-item-qty">x${item.quantity}</div>
            <div class="receipt-item-price">$${item.price * item.quantity} MXN</div>
        </div>
    `).join('');
    
    receiptSubtotal.textContent = `$${purchase.total} MXN`;
    receiptTotal.textContent = `$${purchase.total} MXN`;
    
    receiptModal.classList.add('active');
}

function handleSubmit(event) {
    event.preventDefault();
    alert('¡Gracias por contactarnos! Responderemos pronto.');
    event.target.reset();
    return false;
}

window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .product-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });
});