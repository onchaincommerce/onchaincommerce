import React, { useState, useEffect } from 'react';
import styles from './Cart.module.css';

interface Product {
  id: string;
  name: string;
  price: number;
  inventory: number;
}

interface CartItem extends Product {
  quantity: number;
}

const Cart: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, inventory: 0 });
  const [taxRate, setTaxRate] = useState(0);

  useEffect(() => {
    // Load products from local storage
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  useEffect(() => {
    // Save products to local storage whenever the products array changes
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  const addProduct = () => {
    if (newProduct.name && newProduct.price > 0 && newProduct.inventory >= 0) {
      const updatedProducts = [...products, { ...newProduct, id: Date.now().toString() }];
      setProducts(updatedProducts);
      setNewProduct({ name: '', price: 0, inventory: 0 });
    }
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const updatedProducts = products.map(product =>
      product.id === id ? { ...product, ...updates } : product
    );
    setProducts(updatedProducts);
  };

  const deleteProduct = (id: string) => {
    const updatedProducts = products.filter(product => product.id !== id);
    setProducts(updatedProducts);
  };

  const addToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.inventory) {
        setCartItems(cartItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      }
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    const product = products.find(p => p.id === id);
    if (product && quantity <= product.inventory) {
      setCartItems(cartItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const generateCharge = () => {
    // TODO: Implement Commerce charge generation
    console.log('Generating charge for:', { cartItems, subtotal, tax, total });
    // Update inventory
    const updatedProducts = products.map(product => {
      const cartItem = cartItems.find(item => item.id === product.id);
      return cartItem
        ? { ...product, inventory: product.inventory - cartItem.quantity }
        : product;
    });
    setProducts(updatedProducts);
    setCartItems([]);
  };

  return (
    <div className={styles.posContainer}>
      <div className={styles.productCatalog}>
        <h2>Product Catalog</h2>
        <div className={styles.newProductForm}>
          <input
            type="text"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            placeholder="Product name"
          />
          <input
            type="number"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
            placeholder="Price"
          />
          <input
            type="number"
            value={newProduct.inventory}
            onChange={(e) => setNewProduct({ ...newProduct, inventory: Number(e.target.value) })}
            placeholder="Inventory"
          />
          <button onClick={addProduct}>Add Product</button>
        </div>
        <div className={styles.productGrid}>
          {products.map(product => (
            <div key={product.id} className={styles.productCard} onClick={() => addToCart(product)}>
              <h3>{product.name}</h3>
              <p>${product.price.toFixed(2)}</p>
              <p>In stock: {product.inventory}</p>
              <button onClick={() => addToCart(product)}>Add to Cart</button>
              <button onClick={() => updateProduct(product.id, { inventory: product.inventory + 1 })}>
                Increase Inventory
              </button>
              <button onClick={() => deleteProduct(product.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.cartDetails}>
        <h2>Cart</h2>
        <ul className={styles.cartList}>
          {cartItems.map(item => (
            <li key={item.id} className={styles.cartItem}>
              <span>{item.name}</span>
              <span>${item.price.toFixed(2)}</span>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                min="1"
                max={products.find(p => p.id === item.id)?.inventory}
              />
              <button onClick={() => removeFromCart(item.id)}>Remove</button>
            </li>
          ))}
        </ul>
        <div className={styles.cartSummary}>
          <div>
            <label>Tax Rate (%): </label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              min="0"
              max="100"
            />
          </div>
          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          <p>Tax: ${tax.toFixed(2)}</p>
          <p className={styles.totalAmount}>Total: ${total.toFixed(2)}</p>
        </div>
        <button className={styles.chargeButton} onClick={generateCharge}>Generate Charge</button>
      </div>
    </div>
  );
};

export default Cart;