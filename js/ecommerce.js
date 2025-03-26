class Product {
    constructor(name, price, imageUrl, uuid = Product.randomUUID()) {
        this.uuid = uuid;
        this.name = name;
        this.price = price;
        this.imageUrl = imageUrl;
    }

    // Getters y setters con validaciones
    get name() {
        return this._name;
    }

    set name(value) {
        if (!value || value.trim() === '') {
            throw new ProductException('El nombre del producto no puede estar vacío.');
        }
        this._name = value;
    }

    get price() {
        return this._price;
    }

    set price(value) {
        if (value <= 0) {
            throw new ProductException('El precio debe ser mayor que 0.');
        }
        this._price = value;
    }

    // Métodos estáticos para crear productos desde JSON o un objeto
    static createFromJson(jsonValue) {
        try {
            const obj = JSON.parse(jsonValue);
            return new Product(obj.name, obj.price, obj.imageUrl, obj.uuid);
        } catch (e) {
            throw new ProductException('Error al parsear el JSON.');
        }
    }

    static createFromObject(obj) {
        if (!obj.name || !obj.price) {
            throw new ProductException('Faltan datos esenciales para crear el producto.');
        }
        return new Product(obj.name, obj.price, obj.imageUrl, obj.uuid);
    }

    static randomUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

class ProductException {
    constructor(message) {
        this.message = message;
        this.name = "ProductException";
    }
}

class ShoppingCart {
    constructor() {
        this.cart = this.loadFromLocalStorage() || [];
    }

    saveToLocalStorage() {
        localStorage.setItem('shoppingCart', JSON.stringify(this.cart));
    }

    loadFromLocalStorage() {
        const savedCart = localStorage.getItem('shoppingCart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    addItem(productUuid, amount) {
        const existingProduct = this.cart.find(item => item.uuid === productUuid);
        if (existingProduct) {
            existingProduct.amount += amount;
        } else {
            const product = products.find(p => p.uuid === productUuid);
            if (!product) throw new ProductException('Producto no encontrado.');
            this.cart.push({
                uuid: product.uuid,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                amount
            });
        }
        this.saveToLocalStorage();
    }

    updateItem(productUuid, newAmount) {
        if (newAmount < 0) {
            throw new ProductException('La cantidad no puede ser negativa.');
        }
        const product = this.cart.find(item => item.uuid === productUuid);
        if (!product) throw new ProductException('Producto no encontrado en el carrito.');
        if (newAmount === 0) {
            this.removeItem(productUuid);
        } else {
            product.amount = newAmount;
        }
        this.saveToLocalStorage();
    }

    removeItem(productUuid) {
        this.cart = this.cart.filter(item => item.uuid !== productUuid);
        this.saveToLocalStorage();
    }

    calculateTotal() {
        return this.cart.reduce((total, product) => total + product.price * product.amount, 0);
    }

    getProducts() {
        return this.cart;
    }
}

const products = [
    new Product("Producto 1", 25.00, "../img/producto1.jpg"),
    new Product("Producto 2", 30.00, "../img/producto2.jpg"),
    new Product("Producto 3", 15.00, "../img/producto3.jpg")
];

function getProducts() {
    return products;
}

function getProductById(uuid) {
    return products.find(product => product.uuid === uuid);
}

function createProduct(product) {
    const newProduct = Product.createFromObject(product);
    products.push(newProduct);
    return newProduct;
}

function updateProduct(uuid, updatedProduct) {
    const productIndex = products.findIndex(product => product.uuid === uuid);
    if (productIndex === -1) throw new ProductException('Producto no encontrado.');
    products[productIndex] = { ...products[productIndex], ...updatedProduct };
}

function deleteProduct(uuid) {
    const productIndex = products.findIndex(product => product.uuid === uuid);
    if (productIndex === -1) throw new ProductException('Producto no encontrado.');
    products.splice(productIndex, 1);
}

function addToCarousel(product) {
    const carouselContainer = document.getElementById("carouselProducts");

    // Crear el producto en el carrusel
    const carouselItem = document.createElement("div");
    carouselItem.classList.add("col-md-3", "col-sm-6", "mb-4");

    const card = document.createElement("div");
    card.classList.add("card", "h-100");

    const img = document.createElement("img");
    img.src = product.imageUrl;
    img.classList.add("card-img-top");
    img.alt = product.name;

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    const title = document.createElement("h5");
    title.classList.add("card-title");
    title.textContent = product.name;

    const priceElement = document.createElement("p");
    priceElement.classList.add("card-text");
    priceElement.textContent = `Precio: $${product.price.toFixed(2)}`;

    const addToCartButton = document.createElement("button");
    addToCartButton.classList.add("btn", "btn-primary");
    addToCartButton.textContent = "Agregar al carrito";

    addToCartButton.onclick = function () {
        shoppingCart.addItem(product.uuid, 1);
        alert(`${product.name} ha sido agregado al carrito.`);
    };

    // Organizar la tarjeta
    cardBody.appendChild(title);
    cardBody.appendChild(priceElement);
    cardBody.appendChild(addToCartButton);

    card.appendChild(img);
    card.appendChild(cardBody);

    carouselItem.appendChild(card);

    carouselContainer.appendChild(carouselItem);
}

// Función para cargar productos iniciales al carrusel
function loadCarousel() {
    products.forEach(product => {
        addToCarousel(product);
    });
}

// Inicialización
const shoppingCart = new ShoppingCart();

document.addEventListener("DOMContentLoaded", () => {
    loadCarousel();
});