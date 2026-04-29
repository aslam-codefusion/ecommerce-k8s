import { useEffect, useMemo, useState } from "react";

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [orderForm, setOrderForm] = useState({
    customerName: "",
    email: ""
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        setMessage("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart]
  );

  const addToCart = (product) => {
    setMessage("");
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...current, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const updateQty = (id, qty) => {
    setCart((current) =>
      current.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, qty) } : item
      )
    );
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!cart.length) {
      setMessage("Cart is empty.");
      return;
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customerName: orderForm.customerName,
          email: orderForm.email,
          items: cart
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Order failed.");
        return;
      }

      setMessage(`Order placed successfully. Order ID: ${data.orderId}`);
      setCart([]);
      setOrderForm({ customerName: "", email: "" });
    } catch (error) {
      setMessage("Order request failed.");
    }
  };

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="tag">Production-style demo</p>
          <h1>Aslam Store</h1>
          <p className="subtitle">
            A simple e-commerce app with Kubernetes, Docker, and GitHub Actions.
          </p>
        </div>
        <div className="badge">
          <strong>{cartCount}</strong>
          <span>items in cart</span>
        </div>
      </header>

      {message && <div className="message">{message}</div>}

      <main className="layout">
        <section>
          <h2>Products</h2>
          {loading ? (
            <p>Loading products...</p>
          ) : (
            <div className="grid">
              {products.map((product) => (
                <article key={product.id} className="card">
                  <div className="cardTop">
                    <div className="avatar">{product.name[0]}</div>
                    <div>
                      <h3>{product.name}</h3>
                      <p>{product.category}</p>
                    </div>
                  </div>
                  <p className="desc">{product.description}</p>
                  <div className="meta">
                    <span>₹ {product.price}</span>
                    <span>⭐ {product.rating}</span>
                  </div>
                  <button onClick={() => addToCart(product)}>Add to cart</button>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="cart">
          <h2>Cart</h2>
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.id} className="cartItem">
                  <div>
                    <strong>{item.name}</strong>
                    <p>₹ {item.price}</p>
                  </div>
                  <div className="qtyRow">
                    <button onClick={() => updateQty(item.id, item.qty - 1)}>-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                  </div>
                  <button className="remove" onClick={() => removeFromCart(item.id)}>
                    Remove
                  </button>
                </div>
              ))}
              <div className="totalRow">
                <strong>Total</strong>
                <strong>₹ {subtotal}</strong>
              </div>

              <form onSubmit={placeOrder} className="form">
                <input
                  type="text"
                  placeholder="Your name"
                  value={orderForm.customerName}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, customerName: e.target.value })
                  }
                />
                <input
                  type="email"
                  placeholder="Your email"
                  value={orderForm.email}
                  onChange={(e) =>
                    setOrderForm({ ...orderForm, email: e.target.value })
                  }
                />
                <button type="submit">Place Order</button>
              </form>
            </>
          )}
        </aside>
      </main>
    </div>
  );
}
