 import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import POS from './components/POS';
import Sales from './components/Sales';
import Inventory from './components/Inventory';
import AddProductModal from './components/AddProductModal';
import Swal from "sweetalert2";
import LoginForm from './components/Auth/login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [products, setProducts] = useState([]);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sales, setSales] = useState([]);
  const [cart, setCart] = useState([]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);


  // Fetch all products
  const fetchProducts = async () => {
    try {
      const response = await fetch('https://backend-pos-api.onrender.com/api/product/');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add product
  const addProduct = async (formData) => {
    try {
      const response = await fetch('https://backend-pos-api.onrender.com/api/product/', {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        const data = await response.json();
        setProducts([...products, data]);
        Swal.fire("✅ ជោគជ័យ", "ផលិតផលត្រូវបានបន្ថែម!", "success");
      } else {
        const err = await response.json();
        console.error(err);
        Swal.fire("❌ បរាជ័យ", "មិនអាចបន្ថែមផលិលផលបាន.", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("❌ មានបញ្ហា", "ក្នុងការភ្ជាប់ទៅកាន់Server.", "error");
    }
  };

  // Edit product
  const editProduct = async (product) => {
    try {
      const response = await fetch(`https://backend-pos-api.onrender.com/api/product/${product.product_id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: product.product_name,
          product_price: parseFloat(product.product_price),
          product_stock: parseInt(product.product_stock, 10),
          category_name: product.category_name,
          product_status: 'new_stock'
        })
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        setProducts(products.map(p => p.product_id === product.product_id ? updatedProduct : p));
        Swal.fire("✅ ជោគជ័យ", "ផលិតផលត្រូវបានកែប្រែ!", "success");
      } else {
        const err = await response.json();
        console.error(err);
        Swal.fire("❌ បរាជ័យ", "មិនអាចកែប្រែផលិតផលបាន.", "error");
      }
    } catch (error) {
      console.error(error);
      Swal.fire("❌ មានបញ្ហា", "មិនអាចភ្ជាប់ទៅកាន់Server.", "error");
    }
  };

  // Delete product
  const deleteProduct = async (product_id) => {
    if (!window.confirm("តេីអ្នកប្រាកដថាចង់លុបផលិតផលមែនទេ?")) return;

    try {
      const response = await fetch(`https://backend-pos-api.onrender.com/api/product/${product_id}/`, { method: 'DELETE' });
      if (response.ok) setProducts(products.filter(p => p.product_id !== product_id));
      else Swal.fire("❌ Failed", "Could not delete product.", "error");
    } catch (error) {
      console.error(error);
      Swal.fire("❌ Error", "Cannot connect to server.", "error");
    }
  };

  // Add to cart
  const addToCart = (productId) => {
    const product = products.find(p => p.product_id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.product_id === productId);
    if (existingItem) {
      if (existingItem.order_qty < product.product_stock) {
        setCart(cart.map(item => 
          item.product_id === productId ? { ...item, order_qty: item.order_qty + 1 } : item
        ));
      } else {
        Swal.fire("⚠️ Stock Insufficient", "Not enough stock!", "warning");
      }
    } else {
      setCart([...cart, { ...product, order_qty: 1 }]);
    }
  };

  // Update cart quantity
  const updateCartQuantity = (productId, change) => {
    setCart(prevCart => {
      return prevCart
        .map(item => {
          if (item.product_id === productId) {
            const product = products.find(p => p.product_id === productId);
            const newQuantity = item.order_qty + change;
            if (newQuantity <= 0) return null; // remove
            if (newQuantity > product.product_stock) {
              Swal.fire("⚠️ Stock Insufficient", "Not enough stock!", "warning");
              return item;
            }
            return { ...item, order_qty: newQuantity };
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  //========================= Submit order - FIXED VERSION===========================
const onSubmitOrder = async () => {
  if (window.__ordering) return;
  window.__ordering = true;

  if (cart.length === 0) {
    window.__ordering = false;
    return Swal.fire("មិនមានទំនិញ", "សូមបញ្ចូលទំនិញជាមុន!", "info");
  }

  const uniqueCart = Array.from(
    new Map(cart.map(item => [item.product_id, item])).values()
  );

  try {
    const orderData = {
      items: uniqueCart.map(item => ({
        product: item.product_id,
        order_qty: item.order_qty
      }))
    };

    const res = await fetch("https://backend-pos-api.onrender.com/api/make-order/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error("Server error " + res.status + ": " + text);
    }

    const data = await res.json();

    // 🔹 Prepare invoice object
    const invoice = {
      id: Math.floor(Math.random() * 1000000), // generate invoice ID or use server ID
      date: new Date().toLocaleString(),
      items: data.orders.map(o => ({
        product_name: o.product,
        order_qty: o.qty,
        product_price: o.price
      })),
      total: data.orders.reduce((sum, o) => sum + o.price * o.qty, 0)
    };

    // 🔹 Show invoice
    showInvoice(invoice);

    // Clear cart
    setCart([]);
    localStorage.removeItem("cart");

  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "កំហុស",
      text: err.message,
    });

  } finally {
    window.__ordering = false;
  }
};


  // Fixed showInvoice function
  const showInvoice = (invoice) => {
    Swal.fire({
      title: `<h3 style="color:#fff; font-weight:bold; font-family: 'Khmer OS System', 'Khmer OS', 'Moul', 'Hanuman', sans-serif;">ការលក់ត្រូវបានបញ្ចប់</h3>`,
      html: `
        <div style="
          font-family: 'Kantumruy Pro', sans-serif;
          background: rgba(255,255,255,0.9);
          padding: 20px;
          border-radius: 10px;
          color: #333;
          text-align: left;
        ">
          <h5 style="text-align:center; color:#6C63FF;">វិក័យប័ត្ត #${invoice.id}</h5>
          <p><b>Invoice Date:</b> ${invoice.date}</p>

          <table style="width:100%; border-collapse:collapse; margin-top:10px;">
            <thead>
              <tr style="background:#6C63FF; color:#fff;">
                <th style="padding:8px; border:1px solid #ddd;">ឈ្មោះទំនិញ</th>
                <th style="padding:8px; border:1px solid #ddd;">ចំនួនទំនិញ</th>
                <th style="padding:8px; border:1px solid #ddd;">តម្លៃទំនិញ</th>
                <th style="padding:8px; border:1px solid #ddd;">សរុប</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items
                .map(
                  (item) => `
                <tr>
                  <td style="padding:6px; border:1px solid #ddd;">${item.product_name}</td>
                  <td style="padding:6px; border:1px solid #ddd; text-align:center;">${item.order_qty}</td>
                  <td style="padding:6px; border:1px solid #ddd; text-align:right;">$${item.product_price}</td>
                  <td style="padding:6px; border:1px solid #ddd; text-align:right;">$${(item.product_price * item.order_qty).toFixed(2)}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>

          <h4 style="text-align:right; margin-top:15px; color:#6C63FF;">
            សរុប: <b>$${invoice.total.toFixed(2)}</b>
          </h4>
        </div>
        <div style='margin-top: 10%; text-align: center;'>
          <button class="btn btn-primary" onclick="window.print()">🖨️ Print</button>
        </div>
      `,
      icon: "success",
      showCloseButton: true,
      confirmButtonColor: "#6C63FF",
      background: "linear-gradient(135deg, #9b5de5, #6C63FF)",
      color: "#fff",
      width: "700px",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: "success",
          title: "🖨️ បង្កេីតវិក័យប័តជោគជ័យ",
          showConfirmButton: true,
          timer: 2000,
          background: "#fff",
          color: "#333",
        });
      }
    });
  };

  // Render section
  const renderSection = () => {
     if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={() => setIsLoggedIn(true)} />;
  }
    switch(activeSection) {
      //============================================================
     
      //=============================================================
      case 'dashboard': 
        return <Dashboard products={products} sales={sales} />;
      case 'products':
        return (
          <Products 
            products={products} 
            onAddProduct={() => setShowAddProductModal(true)}
            onDeleteProduct={deleteProduct}
            onEditProduct={(p) => {
              setEditingProduct(p);
              setShowAddProductModal(true);
            }} 
          />
        );
      case 'pos': 
        return (
          <POS 
            products={products}
            cart={cart} 
            onAddToCart={addToCart}
            onUpdateCartQuantity={updateCartQuantity}
            onRemoveFromCart={removeFromCart}
            onSubmitOrder={onSubmitOrder} 
          />
        );
      case 'sales': 
        return <Sales sales={sales} />;
      case 'inventory': 
        return <Inventory products={products} />;
      default: 
        return <Dashboard products={products} sales={sales} />;
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <div className="col-md-10 main-content">{renderSection()}</div>
      </div>

      <AddProductModal
        show={showAddProductModal}
        onHide={() => { 
          setShowAddProductModal(false); 
          setEditingProduct(null); 
        }}
        editingProduct={editingProduct}
        onSubmit={async (formData) => {
          if (editingProduct) {
            await editProduct({
              product_id: editingProduct.product_id,
              product_name: formData.get('product_name'),
              product_price: formData.get('product_price'),
              product_stock: formData.get('product_stock'),
              category_name: formData.get('category_name')
            });
          } else {
            await addProduct(formData);
          }
          setShowAddProductModal(false);
          setEditingProduct(null);
        }}
      />
    </div>
  );
}

export default App;

