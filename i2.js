const openShopping = document.querySelector(".shopping");
const closeShopping = document.querySelector(".closeShopping");
const list = document.querySelector(".list");
const listCard = document.querySelector(".listCard");
const total = document.querySelector(".total");
const body = document.querySelector("body");
const quantity = document.querySelector(".quantity");

openShopping.addEventListener("click", () => {
    body.classList.add("active");
});
closeShopping.addEventListener("click", () => {
    body.classList.remove("active");
});

// Prices are in Kenyan Shillings (KES)
let products = [
    { id: 1, name: 'Infinix XPAD phone', image: 'phone.png', price: 35000 },
    { id: 2, name: 'Oraimo AirPods 3 TWS', image: 'airpods.png', price: 2870},
    { id: 3, name: 'Wireless Bluetooth Headphones', image: 'headphones.png', price: 3350 },
    { id: 4, name: 'Bluetooth Wireless Smart Watch', image: 'watch.png', price: 1052 },
    { id: 5, name: 'Transcend External Hard Drive', image: 'Transcend.png', price: 10450 },
    { id: 6, name: 'Fast Charging Power Bank', image: 'power bank.png', price: 1000 },
    { id: 7, name: 'Men Shoes Sneakers', image: 'shoe1.png', price: 1800 },
    { id: 8, name: 'Casual Men Sneakers', image: 'shoes2.png', price: 2200 },
    { id: 9, name: 'Fashion Lace Up Sneakers', image: 'shoe3.png', price: 800 },
    { id: 10, name: 'HP Metal Flash Drives', image: 'flashdrive.png', price: 1200 },
    { id: 11, name: 'Foldable Phone Holder Stand', image: 'mount.png', price: 800 },
    { id: 12, name: 'SD Memory Card', image: 'SDcard.png', price: 649 },
    { id: 13, name: 'JBL Earphones', image: 'earphones.png', price: 3500 },
    { id: 14, name: 'JBL Bluetooth Speaker', image: 'btspeakers.png', price: 3637 },
    { id: 15, name: 'Sony PS4 PAD controller', image: 'pad1.png', price: 2399 },
    { id: 16, name: 'Sony PS5 DualSense PAD', image: 'pad2.png', price: 8500 },
    { id: 17, name: 'PS4 Dual Shock PAD(Gold)', image: 'pad3.png', price: 1999 },
    { id: 18, name: 'Fashion Soft Soled Canvas Shoes', image: 'loafer1.png', price: 857 },
];

let listCards = [];

// Initialize the product list
const initApp = () => {
    products.forEach((value, key) => {
        let newDiv = document.createElement("div");
        newDiv.classList.add("item");
        newDiv.innerHTML = `
            <img src="images/${value.image}"/>
            <div class="title">${value.name}</div>
            <div class="price">KSh ${value.price.toLocaleString()}</div>
            <button onclick="addToCard(${key})">Add To Cart</button>
        `;
        list.appendChild(newDiv);
    });
};

initApp();

const addToCard = (key) => {
    if (listCards[key] == null) {
        listCards[key] = products[key];
        listCards[key].quantity = 1;
    } else {
        listCards[key].quantity += 1; // Increment quantity if already in cart
    }

    reloadCard();
};

// Function to change quantity of a product in the cart
const changeQuantity = (key, newQuantity) => {
    if (newQuantity <= 0) {
        delete listCards[key]; // Remove item if quantity is 0
    } else {
        listCards[key].quantity = newQuantity; // Update quantity
    }
    reloadCard();
};

// Function to reload the cart display
const reloadCard = () => {
    listCard.innerHTML = "";
    let totalPrice = 0;
    let totalQuantity = 0;

    listCards.forEach((value) => {
        if (value != null) {
            totalPrice += value.price * value.quantity; // Calculate total price
            totalQuantity += value.quantity; // Calculate total quantity

            let newDiv = document.createElement("li");
            newDiv.innerHTML = `
                <div><img src="images/${value.image}"/></div>
                <div class ="cardTitle">${value.name}</div>
                <div class ="cardPrice">KSh ${ (value.price * value.quantity).toLocaleString() }</div>
                <div>
                    <button onclick="changeQuantity(${value.id - 1}, ${value.quantity - 1})">-</button>
                    <div class ="count">${value.quantity}</div>
                    <button onclick="changeQuantity(${value.id - 1}, ${value.quantity + 1})">+</button>
                </div>
            `;
            listCard.appendChild(newDiv);
        }
    });

    total.innerText = `KSh ${totalPrice.toLocaleString()}`;
    quantity.innerText = totalQuantity;
};

// Function to handle product search
const searchProducts = (event) => {
    const query = event.target.value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(query)
    );

    // Clear the list and display filtered products
    list.innerHTML = "";
    
    if (filteredProducts.length === 0) {
        list.innerHTML = `<div class="no-results">No products found.</div>`;
    } else {
        filteredProducts.forEach((value, key) => {
            let newDiv = document.createElement("div");
            newDiv.classList.add("item");
            newDiv.innerHTML = `
                <img src="images/${value.image}"/>
                <div class="title">${value.name}</div>
                <div class="price">KSh ${value.price.toLocaleString()}</div>
                <button onclick="addToCard(${key})">Add To Cart</button>
            `;
            list.appendChild(newDiv);
        });
    }
};

// Placeholder for checkout function
const checkout = () => {
    // Implement checkout logic here
    alert("Checkout functionality is not implemented yet.");
};




