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
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  const [products, setProducts] = useState([]);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sales, setSales] = useState([]);
  const [cart, setCart] = useState([]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

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

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'តើអ្នកចង់ចាកចេញមែនទេ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        setIsLoggedIn(false);
        localStorage.removeItem("isLoggedIn");
        setActiveSection('dashboard');
        setCart([]);
      }
    });
  };

 const addToCart = (productId) => {
  const product = products.find(p => p.product_id === productId);
  
  // ១. ឆែកមើលថាផលិតផលមានក្នុងស្តុកឬអត់
  if (!product || product.product_stock <= 0) {
    return Swal.fire("⚠️ អស់ស្តុក", "ផលិតផលនេះអស់ពីស្តុកហើយ", "warning");
  }

  const existingItem = cart.find(item => item.product_id === productId);

  if (existingItem) {
    // ២. ឆែកមើលថា ចំនួនក្នុងរទេះ លើសពីចំនួនក្នុងស្តុកឬអត់
    if (existingItem.order_qty < product.product_stock) {
      setCart(cart.map(item => 
        item.product_id === productId ? { ...item, order_qty: item.order_qty + 1 } : item
      ));
    } else {
      Swal.fire("⚠️ កម្រិតស្តុក", `មិនអាចលក់លើសពីចំនួនក្នុងស្តុក (${product.product_stock}) បានទេ!`, "warning");
    }
  } else {
    // បើមិនទាន់មានក្នុងរទេះ ថែមចូលថ្មី ១
    setCart([...cart, { ...product, order_qty: 1 }]);
  }
};

  const updateCartQuantity = (productId, change) => {
  setCart(prevCart => 
    prevCart.map(item => {
      if (item.product_id === productId) {
        const product = products.find(p => p.product_id === productId);
        const newQuantity = item.order_qty + change;

        // បើចុចដក (-) រហូតដល់ ០ គឺលុបចេញពីរទេះ
        if (newQuantity <= 0) return null;

        // ឆែកស្តុកពេលចុចថែម (+)
        if (newQuantity > product.product_stock) {
          Swal.fire("⚠️ អស់ស្តុក", `ស្តុកនៅសល់ត្រឹមតែ ${product.product_stock} ប៉ុណ្ណោះ!`, "warning");
          return item; // រក្សាចំនួនដដែល មិនឱ្យថែម
        }

        return { ...item, order_qty: newQuantity };
      }
      return item;
    }).filter(Boolean) // លុប item ណាដែលមានតម្លៃ null ចេញ
  );
};

  const addProduct = async (formData) => {
    try {
      const response = await fetch('https://backend-pos-api.onrender.com/api/product/', {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        fetchProducts();
        Swal.fire("✅ ជោគជ័យ", "ផលិតផលត្រូវបានបន្ថែម!", "success");
      }
    } catch (error) { console.error(error); }
  };

  const editProduct = async (product) => {
    try {
      const response = await fetch(`https://backend-pos-api.onrender.com/api/product/${product.product_id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (response.ok) fetchProducts();
    } catch (error) { console.error(error); }
  };

  const deleteProduct = async (id) => {
    try {
      const response = await fetch(`https://backend-pos-api.onrender.com/api/product/${id}/`, { method: 'DELETE' });
      if (response.ok) fetchProducts();
    } catch (error) { console.error(error); }
  };

  // --- មុខងារបង្ហាញវិក័យប័ត្រ ---
  const showInvoice = (invoice) => {
    Swal.fire({
     icon: "success",
          title: "ការបញ្ជាទិញបានជោគជ័យ",
          showConfirmButton: true,
          timer: 10000,
          background: "#fff",
          color: "#333",
      html: `
        <div id="invoice-print" style="text-align: left; font-family: 'Khmer OS Content', sans-serif; font-size: 14px; border: 1px solid #ddd; padding: 15px;">
          <h4 style="text-align: center;">វិក័យប័ត្រទូទាត់ប្រាក់</h4>
          <p>លេខវិក័យប័ត្រ: #${invoice.id}</p>
          <p>កាលបរិច្ឆេទ: ${invoice.date}</p>
          <hr>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid #eee;">
                <th style="text-align: left;">ទំនិញ</th>
                <th style="text-align: center;">ចំនួន</th>
                <th style="text-align: right;">តម្លៃ</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.product_name}</td>
                  <td style="text-align: center;">${item.order_qty}</td>
                  <td style="text-align: right;">$${item.product_price}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <hr>
          <h5 style="text-align: right;">សរុប: $${invoice.total.toFixed(2)}</h5>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '<i class="fa fa-print"></i> បោះពុម្ព',
      cancelButtonText: 'បិទ',
      confirmButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        window.print(); // បោះពុម្ពទំព័រទាំងមូល ឬប្រើ Library ផ្សេងសម្រាប់បោះពុម្ពតែកន្ទុយសំបុត្រ
      }
    });
  };

  const onSubmitOrder = async () => {
    if (window.__ordering || cart.length === 0) return;
    window.__ordering = true;

    try {
      const orderData = {
        items: cart.map(item => ({
          product: item.product_id,
          order_qty: item.order_qty
        }))
      };

      const res = await fetch("https://backend-pos-api.onrender.com/api/make-order/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) throw new Error("ការបញ្ជាទិញមានបញ្ហា");

      // បង្កើតទិន្នន័យ Invoice មុនពេលសម្អាត Cart
      const invoiceData = {
        id: Math.floor(Math.random() * 1000000),
        date: new Date().toLocaleString(),
        items: cart.map(item => ({
          product_name: item.product_name,
          order_qty: item.order_qty,
          product_price: item.product_price
        })),
        total: cart.reduce((sum, item) => sum + (item.product_price * item.order_qty), 0)
      };

      await fetchProducts(); // ទាញយកស្តុកថ្មី
      showInvoice(invoiceData); // បង្ហាញវិក័យប័ត្រ
      setCart([]); // សម្អាត Cart
      
    } catch (err) {
      Swal.fire("កំហុស", err.message, "error");
    } finally {
      window.__ordering = false;
    }
  };

  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  const renderSection = () => {
    switch(activeSection) {
      case 'dashboard': 
        return <Dashboard products={products} onProfileClick={handleLogout} />;
      case 'products':
        return (
          <Products 
            products={products} 
            onAddProduct={() => setShowAddProductModal(true)}
            onDeleteProduct={deleteProduct}
            onEditProduct={(p) => { setEditingProduct(p); setShowAddProductModal(true); }} 
          />
        );
      case 'pos': 
        return (
          <POS 
            products={products || []} 
            cart={cart || []} 
            onAddToCart={addToCart}
            onUpdateCartQuantity={updateCartQuantity}
            onRemoveFromCart={(id) => setCart(cart.filter(i => i.product_id !== id))}
            onSubmitOrder={onSubmitOrder} 
          />
        );
      case 'sales': return <Sales sales={sales} />;
      case 'inventory': return <Inventory products={products} />;
      default: return <Dashboard products={products} onProfileClick={handleLogout} />;
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <div className="col-md-10 main-content">
          {renderSection()}
        </div>
      </div>

      <AddProductModal
        show={showAddProductModal}
        onHide={() => { setShowAddProductModal(false); setEditingProduct(null); }}
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