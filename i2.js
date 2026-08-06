const openShopping = document.querySelector(".shopping");
const closeShopping = document.querySelector(".closeShopping");
const list = document.querySelector(".list");
const listCard = document.querySelector(".listCard");
const total = document.querySelector(".total");
const body = document.querySelector("body");
const quantity = document.querySelector(".quantity");

openShopping.addEventListener("click", (e) => {
    e.stopPropagation();
    body.classList.add("active");
});

closeShopping.addEventListener("click", () => {
    body.classList.remove("active");
});

// Stop clicks inside the cart from reaching the document listener
// This is needed because reloadCard() removes buttons from the DOM,
// so cart.contains(e.target) would return false for removed elements.
const cartElement = document.querySelector(".card");
if (cartElement) {
    cartElement.addEventListener("click", (e) => {
        e.stopPropagation();
    });
}

// Close cart when clicking anywhere outside the cart panel
document.addEventListener("click", (e) => {
    if (body.classList.contains("active") && !openShopping.contains(e.target)) {
        body.classList.remove("active");
    }
});

// Prices are in Kenyan Shillings (KES)
const products = [
    { id: 1, name: 'Infinix XPAD phone', image: 'phone.png', price: 35000, category: 'phones' },
    { id: 2, name: 'Oraimo AirPods 3 TWS', image: 'airpods.png', price: 2870, category: 'audio' },
    { id: 3, name: 'Wireless Bluetooth Headphones', image: 'headphones.png', price: 3350, category: 'audio' },
    { id: 4, name: 'Bluetooth Wireless Smart Watch', image: 'watch.png', price: 1052, category: 'wearables' },
    { id: 5, name: 'Transcend External Hard Drive', image: 'Transcend.png', price: 10450, category: 'storage' },
    { id: 6, name: 'Fast Charging Power Bank', image: 'power bank.png', price: 1000, category: 'accessories' },
    { id: 7, name: 'Men Shoes Sneakers', image: 'shoe1.png', price: 1800, category: 'fashion' },
    { id: 8, name: 'Casual Men Sneakers', image: 'shoes2.png', price: 2200, category: 'fashion' },
    { id: 9, name: 'Fashion Lace Up Sneakers', image: 'shoe3.png', price: 800, category: 'fashion' },
    { id: 10, name: 'HP Metal Flash Drives', image: 'flashdrive.png', price: 1200, category: 'storage' },
    { id: 11, name: 'Foldable Phone Holder Stand', image: 'mount.png', price: 800, category: 'accessories' },
    { id: 12, name: 'SD Memory Card', image: 'SDcard.png', price: 649, category: 'storage' },
    { id: 13, name: 'JBL Earphones', image: 'earphones.png', price: 3500, category: 'audio' },
    { id: 14, name: 'JBL Bluetooth Speaker', image: 'btspeakers.png', price: 3637, category: 'audio' },
    { id: 15, name: 'Sony PS4 PAD controller', image: 'pad1.png', price: 2399, category: 'gaming' },
    { id: 16, name: 'Sony PS5 DualSense PAD', image: 'pad2.png', price: 8500, category: 'gaming' },
    { id: 17, name: 'PS4 Dual Shock PAD(Gold)', image: 'pad3.png', price: 1999, category: 'gaming' },
    { id: 18, name: 'Fashion Soft Soled Canvas Shoes', image: 'loafer1.png', price: 857, category: 'fashion' },
];

// --- Category Labels ---
const categoryLabels = {
    phones: 'Phones',
    audio: 'Audio',
    wearables: 'Wearables',
    storage: 'Storage',
    accessories: 'Accessories',
    gaming: 'Gaming',
    fashion: 'Fashion'
};

// Currently selected category (null = all)
let activeCategory = null;

// Cart storage: keyed by product ID for reliability
let listCards = {};

const STORAGE_KEY = 'cartopia_cart';

// --- LocalStorage Persistence ---

function saveCart() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(listCards));
    } catch (e) {
        // Storage might be full or unavailable
        console.warn('Could not save cart to localStorage:', e);
    }
}

function loadCart() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            listCards = JSON.parse(saved);
            reloadCard();
        }
    } catch (e) {
        listCards = {};
    }
}

// --- Toast Notification ---

function showToast(message) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Auto-hide after 2 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// --- Image Error Handling ---

function handleImageError(img) {
    img.onerror = null; // Prevent infinite loop
    img.src = 'icons/cart.png'; // Fallback image
    img.style.objectFit = 'contain';
    img.style.padding = '20px';
}

// --- Category Filter Buttons ---

function renderCategoryFilters() {
    const filterContainer = document.getElementById('categoryFilters');
    if (!filterContainer) return;

    // 'All' button
    const allBtn = document.createElement('button');
    allBtn.className = `category-btn${activeCategory === null ? ' active' : ''}`;
    allBtn.textContent = 'All';
    allBtn.onclick = () => filterByCategory(null);
    filterContainer.appendChild(allBtn);

    // One button per category
    Object.entries(categoryLabels).forEach(([key, label]) => {
        const btn = document.createElement('button');
        btn.className = `category-btn${activeCategory === key ? ' active' : ''}`;
        btn.textContent = label;
        btn.onclick = () => filterByCategory(key);
        filterContainer.appendChild(btn);
    });
}

function filterByCategory(category) {
    activeCategory = category;

    // Update button active states
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const buttons = document.querySelectorAll('.category-btn');
    if (category === null) {
        buttons[0].classList.add('active');
    } else {
        const index = Object.keys(categoryLabels).indexOf(category) + 1;
        if (buttons[index]) buttons[index].classList.add('active');
    }

    // Re-render with filter
    renderProducts();
}

// --- Shared item renderer ---

function createProductItem(product) {
    const newDiv = document.createElement('div');
    newDiv.classList.add('item');
    newDiv.setAttribute('data-category', product.category);
    newDiv.innerHTML = `
        <div class="category-badge">${categoryLabels[product.category]}</div>
        <img src="images/${product.image}" alt="${product.name}" onerror="handleImageError(this)"/>
        <div class="title">${product.name}</div>
        <div class="price">KSh ${product.price.toLocaleString()}</div>
        <button onclick="addToCard(${product.id})">Add To Cart</button>
    `;
    return newDiv;
}

// --- Initialize Product List ---

function renderProducts() {
    list.innerHTML = '';

    const filtered = activeCategory
        ? products.filter(p => p.category === activeCategory)
        : products;

    if (filtered.length === 0) {
        list.innerHTML = `<div class="no-results">No products in this category.</div>`;
        return;
    }

    filtered.forEach((product) => {
        list.appendChild(createProductItem(product));
    });
}

function initApp() {
    renderCategoryFilters();
    renderProducts();

    // Load saved cart after products are rendered
    loadCart();
}

// Call updateLoginStatus after the page loads to update the auth indicator
updateLoginStatus();

initApp();

// --- Cart Logic (keyed by product ID) ---

function addToCard(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    if (listCards[id]) {
        listCards[id].quantity += 1;
    } else {
        listCards[id] = { ...product, quantity: 1 };
    }

    reloadCard();
    saveCart();

    // Show visual feedback
    showToast(`${product.name} added to cart!`);
    animateCartBadge();
}

function changeQuantity(id, newQuantity) {
    if (!listCards[id]) return;

    // Minus button only goes down to 1, never removes
    if (newQuantity < 1) newQuantity = 1;

    listCards[id].quantity = newQuantity;
    reloadCard();
    saveCart();
}

function removeItem(id) {
    if (listCards[id]) {
        delete listCards[id];
        reloadCard();
        saveCart();
        showToast('Item removed from cart.');
        animateCartBadge();
    }
}

// --- Cart Animation Triggers ---

function animateCartBadge() {
    const badge = document.querySelector('.shopping .quantity');
    if (badge) {
        badge.classList.remove('pop');
        // Force reflow so the animation re-triggers
        void badge.offsetWidth;
        badge.classList.add('pop');
    }
    const cartImg = document.querySelector('.shopping img');
    if (cartImg) {
        cartImg.classList.remove('pulse');
        void cartImg.offsetWidth;
        cartImg.classList.add('pulse');
    }
}

function reloadCard() {
    listCard.innerHTML = '';
    let totalPrice = 0;
    let totalQuantity = 0;
    const cardEntries = Object.values(listCards).filter(Boolean);

    if (cardEntries.length === 0) {
        // Empty cart state
        const emptyDiv = document.createElement('li');
        emptyDiv.className = 'empty-cart';
        emptyDiv.innerHTML = `
            <div>Your cart is empty</div>
            <div style="margin-top:8px;font-size:14px;color:#999;">Browse products and add items to get started!</div>
        `;
        emptyDiv.style.display = 'block';
        emptyDiv.style.listStyle = 'none';
        emptyDiv.style.textAlign = 'center';
        emptyDiv.style.padding = '40px 20px';
        emptyDiv.style.color = '#666';
        listCard.appendChild(emptyDiv);
    } else {
        for (const value of cardEntries) {
            totalPrice += value.price * value.quantity;
            totalQuantity += value.quantity;

            const newDiv = document.createElement('li');
            newDiv.innerHTML = `
                <div class="cart-item-img"><img src="images/${value.image}" alt="${value.name}" onerror="handleImageError(this)"/></div>
                <div class="cart-item-details">
                    <div class="cardTitle">${value.name}</div>
                    <div class="cardPrice">KSh ${(value.price * value.quantity).toLocaleString()}</div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="changeQuantity(${value.id}, ${value.quantity - 1})">−</button>
                        <div class="count">${value.quantity}</div>
                        <button class="qty-btn" onclick="changeQuantity(${value.id}, ${value.quantity + 1})">+</button>
                    </div>
                    <button class="remove-btn" onclick="removeItem(${value.id})">Remove</button>
                </div>
            `;
            listCard.appendChild(newDiv);
        }
    }

    total.innerText = `KSh ${totalPrice.toLocaleString()}`;
    quantity.innerText = totalQuantity;
}

// --- Product Search ---

function searchProducts(event) {
    const query = event.target.value.toLowerCase().trim();

    // Reset active category when searching
    activeCategory = null;
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    const allBtn = document.querySelector('.category-btn');
    if (allBtn) allBtn.classList.add('active');

    if (!query) {
        // Show all products
        renderProducts();
        return;
    }

    const filtered = products.filter(product => product.name.toLowerCase().includes(query));

    list.innerHTML = '';

    if (filtered.length === 0) {
        list.innerHTML = `<div class="no-results">No products found for "${query}".</div>`;
        return;
    }

    filtered.forEach((product) => {
        list.appendChild(createProductItem(product));
    });
}

// --- Authentication Check ---

const SESSION_KEY = 'cartopia_session';

function getSession() {
    try {
        const data = localStorage.getItem(SESSION_KEY);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
}

function isLoggedIn() {
    return getSession() !== null;
}

// Update login status indicator on page
function updateLoginStatus() {
    const statusEl = document.getElementById('loginStatus');
    const overlayStatusEl = document.getElementById('overlayLoginStatus');

    const session = getSession();
    if (session) {
        const html = `
            <span class="user-badge">${session.firstname}</span>
            <a href="account.html" class="logout-link" onclick="handleLogoutFromShop()">Logout</a>
        `;
        if (statusEl) {
            statusEl.innerHTML = html;
            statusEl.classList.remove('account-link');
        }
        if (overlayStatusEl) {
            overlayStatusEl.innerHTML = `
                <span style="display:flex;flex-direction:column;align-items:center;gap:8px;">
                    <span style="color:var(--primary);font-weight:600;font-size:22px;">${session.firstname}</span>
                    <button onclick="handleLogoutFromShop()" style="background:none;border:none;color:#e74c3c;font-size:16px;cursor:pointer;font-family:'Poppins',sans-serif;text-decoration:underline;padding:4px 8px;">Logout</button>
                </span>
            `;
        }
    } else {
        if (statusEl) {
            statusEl.textContent = 'Account';
            statusEl.classList.add('account-link');
        }
        if (overlayStatusEl) {
            overlayStatusEl.innerHTML = '<a href="account.html?redirect=product.html" style="color:var(--primary);font-weight:600;font-size:22px;text-decoration:none;border-bottom:2px solid var(--primary);padding-bottom:4px;">Sign In / Register</a>';
        }
    }
}

function handleLogoutFromShop() {
    localStorage.removeItem(SESSION_KEY);
    location.reload();
}


// --- Checkout ---

function checkout() {
    if (!isLoggedIn()) {
        showToast('Please sign in to checkout!');
        setTimeout(() => {
            window.location.href = 'account.html?redirect=product.html';
        }, 1500);
        return;
    }

    const cardEntries = Object.values(listCards).filter(Boolean);

    if (cardEntries.length === 0) {
        showToast('Your cart is empty! Add some items first.');
        return;
    }

    // Build a WhatsApp message with the order summary
    let message = 'Hello! I would like to order the following items:%0A%0A';
    let totalPrice = 0;

    cardEntries.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalPrice += itemTotal;
        message += `• ${item.name} x${item.quantity} = KSh ${itemTotal.toLocaleString()}%0A`;
    });

    const session = getSession();
    message += `%0ATotal: KSh ${totalPrice.toLocaleString()}%0A%0A`;
    message += `Customer: ${session.firstname} ${session.lastname} (${session.email})%0A`;
    message += 'Please confirm availability and delivery options.';

    const phoneNumber = '254792892703';
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;

    window.open(whatsappURL, '_blank');
}
