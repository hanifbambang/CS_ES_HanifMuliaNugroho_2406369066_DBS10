import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "https://backend-modul-8-dbs-production.up.railway.app";

function saveToken(token) { localStorage.setItem("token", token); }
function getToken() { return localStorage.getItem("token"); }
function clearToken() { localStorage.removeItem("token"); }

function Navbar({ page, onNavigate, isLoggedIn, onLogout, cartCount }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <button className="navbar-brand" onClick={() => onNavigate(isLoggedIn ? "items" : "login")}>
          <span className="brand-dot" />
          GameVault
        </button>
        <div className="navbar-links">
          {isLoggedIn ? (
            <>
              <button
                className={`nav-link${page === "items" ? " active" : ""}`}
                onClick={() => onNavigate("items")}
              >
                Shop
              </button>
              <button
                className={`nav-cart-btn${page === "cart" ? " active" : ""}`}
                onClick={() => onNavigate("cart")}
                title="View Cart"
              >
                Cart
              </button>
              <button className="btn-outline-sm" onClick={onLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                className={`nav-link${page === "login" ? " active" : ""}`}
                onClick={() => onNavigate("login")}
              >
                Login
              </button>
              <button className="btn-primary-sm" onClick={() => onNavigate("register")}>
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [message]);
  if (!message) return null;
  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
      <button className="toast-close" onClick={onClose}>✕</button>
    </div>
  );
}

function LoginPage({ onNavigate, showToast }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, form);
      const token = res.data?.payload?.token || res.data?.token;
      if (token) {
        saveToken(token);
        showToast("Welcome back!", "success");
        onNavigate("items");
      } else {
        showToast("Login failed: no token received.", "error");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Login failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-title">Your Account</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder=""
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder=""
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <span className="field-hint">Forgot Password</span>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : "Log In"}
          </button>
        </form>
        <p className="auth-switch">
          Don't have an account?{" "}
          <button onClick={() => onNavigate("register")} className="link-btn">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}

function RegisterPage({ onNavigate, showToast }) {
  const [form, setForm] = useState({ name: "", username: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/user/register`, form);
      showToast("Account created! Please sign in.", "success");
      onNavigate("login");
    } catch (err) {
      showToast(err.response?.data?.message || "Registration failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-title">Sign Up</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="reg-fullname">Full Name</label>
            <input
              id="reg-fullname"
              type="text"
              placeholder=""
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              type="text"
              placeholder=""
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              placeholder=""
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="reg-phone">Phone Number</label>
            <input
              id="reg-phone"
              type="tel"
              placeholder=""
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              placeholder=""
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={10}
            />
            <span className="field-hint">Forgot Password</span>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : "Sign Up"}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account?{" "}
          <button onClick={() => onNavigate("login")} className="link-btn">
            Log In
          </button>
        </p>
      </div>
    </div>
  );
}

function ItemCard({ item, onAddToCart }) {
  const price = typeof item.price === "number"
    ? item.price.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })
    : item.price;

  return (
    <div className="item-card">
      <div className="item-img-wrap">
        {item.image_url
          ? <img src={item.image_url} alt={item.name} className="item-img" />
          : <div className="item-img-placeholder"></div>
        }
        {item.stock === 0 && <span className="badge-soldout">Sold out</span>}
      </div>
      <div className="item-body">
        <p className="item-category">{item.category || "Game"}</p>
        <h3 className="item-name">{item.name}</h3>
        {item.description && <p className="item-desc">{item.description}</p>}
        <div className="item-footer">
          <span className="item-price">{price}</span>
          <button
            className="btn-cart"
            disabled={item.stock === 0}
            onClick={() => onAddToCart(item)}
          >
            + Cart
          </button>
        </div>
      </div>
    </div>
  );
}

function ItemsPage({ showToast, onAddToCart }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = getToken();
        const res = await axios.get(`${API_BASE}/items`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = res.data?.payload ?? res.data?.data ?? res.data;
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        showToast("Failed to load items.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const filtered = items.filter((it) =>
    it.name?.toLowerCase().includes(search.toLowerCase()) ||
    it.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="items-page">
      <div className="items-hero">
        <p className="items-eyebrow">— All Items</p>
        <h1 className="items-title">Shop GameVault</h1>
        <p className="items-sub">Browse our collection of digital games &amp; more</p>
        <div className="search-wrap">
          <span className="search-icon"></span>
          <input
            className="search-input"
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="items-loading">
          <span className="big-spinner" />
          <p>Loading items…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="items-empty">
          <span></span>
          <p>{search ? "No items match your search." : "No items available yet."}</p>
        </div>
      ) : (
        <div className="items-grid">
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} onAddToCart={onAddToCart} />
          ))}
        </div>
      )}
    </div>
  );
}

function CartPage({ cart, onUpdateQty, onRemove, onNavigate, showToast }) {
  const subtotal = cart.reduce((sum, it) => sum + (it.price * it.quantity), 0);
  const formatIDR = (val) => val.toLocaleString("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

  const handleCheckout = () => {
    showToast("Thank you for your purchase!", "success");
  };

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <h1 className="cart-title">Your Cart</h1>
        <div className="cart-empty">
          <span className="cart-empty-icon">Cart</span>
          <p>Your cart is empty. Ready to find some games?</p>
          <button className="btn-primary-sm" onClick={() => onNavigate("items")}>
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-title">Your Cart</h1>
      <div className="cart-container">
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="cart-item-img" />
              ) : (
                <div className="cart-item-img cart-item-img-placeholder" style={{ fontSize: '2rem' }}></div>
              )}
              <div className="cart-item-info">
                <span className="cart-item-name">{item.name}</span>
                <span className="cart-item-price">{formatIDR(item.price)}</span>
              </div>
              <div className="cart-item-actions">
                <div className="qty-controls">
                  <button className="btn-qty" onClick={() => onUpdateQty(item.id, -1)} disabled={item.quantity <= 1}>-</button>
                  <span className="qty-val">{item.quantity}</span>
                  <button className="btn-qty" onClick={() => onUpdateQty(item.id, 1)}>+</button>
                </div>
                <button className="btn-remove" onClick={() => onRemove(item.id)} title="Remove item">🗑️</button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2 className="summary-title">Order Summary</h2>
          <div className="summary-row">
            <span>Items ({cart.length})</span>
            <span>{formatIDR(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>{formatIDR(subtotal)}</span>
          </div>
          <button className="btn-checkout" onClick={handleCheckout}>
            Check Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState(getToken() ? "items" : "login");
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const showToast = (message, type = "success") => setToast({ message, type });
  const closeToast = () => setToast({ message: "", type: toast.type });

  const handleNavigate = (target) => setPage(target);

  const handleLogout = () => {
    clearToken();
    setIsLoggedIn(false);
    setPage("login");
    setCart([]);
    showToast("Logged out successfully.", "success");
  };

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((it) => it.id === item.id);
      if (existing) {
        showToast(`Increased ${item.name} quantity in cart.`, "success");
        return prev.map((it) =>
          it.id === item.id ? { ...it, quantity: it.quantity + 1 } : it
        );
      }
      showToast(`${item.name} added to cart!`, "success");
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((it) => it.id !== itemId));
    showToast("Item removed from cart.", "success");
  };

  const updateQuantity = (itemId, delta) => {
    setCart((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          const newQty = Math.max(1, it.quantity + delta);
          return { ...it, quantity: newQty };
        }
        return it;
      })
    );
  };

  const handleNavigateWithAuth = (target) => {
    if (target === "items" || target === "cart") setIsLoggedIn(!!getToken());
    handleNavigate(target);
  };

  return (
    <div className="app">
      <Navbar
        page={page}
        onNavigate={handleNavigateWithAuth}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        cartCount={cart.reduce((sum, it) => sum + it.quantity, 0)}
      />
      <main className="main-content">
        {page === "login" && (
          <LoginPage
            onNavigate={(p) => {
              if (p === "items") setIsLoggedIn(true);
              handleNavigate(p);
            }}
            showToast={showToast}
          />
        )}
        {page === "register" && (
          <RegisterPage onNavigate={handleNavigate} showToast={showToast} />
        )}
        {page === "items" && (
          <ItemsPage showToast={showToast} onAddToCart={addToCart} />
        )}
        {page === "cart" && (
          <CartPage
            cart={cart}
            onUpdateQty={updateQuantity}
            onRemove={removeFromCart}
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        )}
      </main>
      <Toast message={toast.message} type={toast.type} onClose={closeToast} />
    </div>
  );
}
