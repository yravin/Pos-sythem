import React, { useState, useEffect } from 'react';
import './Css/Dashboard.css';

const Dashboard = ({ products = [] }) => {
  const [todayOrders, setTodayOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===== USER PROFILE =====
  const [user, setUser] = useState(null);

  const fetchUserProfile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file); // 

    // ផ្ញើ POST request ទៅ server
    const response = await fetch('https://example.com/api/upload', {
      method: 'POST',
      body: formData,
      headers: {
      },
    });

    const data = await response.json();
    console.log('Response from server:', data);
  } catch (error) {
    console.error('Error uploading image:', error);
  }
};


  // ===== TODAY ORDERS =====
  const fetchTodayOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://backend-pos-api.onrender.com/api/today_orders/');
      if (!response.ok) throw new Error();

      const data = await response.json();

      const normalizedOrders = (data.orders || []).map(order => ({
        id: order.id,
        order_datetime: order.order_datetime,
        product_name: order.product_name,
        order_qty: Number(order.order_qty),
        order_price: parseFloat(order.order_price),
      }));

      setTodayOrders(normalizedOrders);
    } catch {
      setError('មិនអាចទាញទិន្នន័យបាន');
      setTodayOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchTodayOrders();
  }, []);

  // ===== Calculations =====
  const todayRevenue = todayOrders.reduce(
    (sum, o) => sum + o.order_qty * o.order_price,
    0
  );

  const totalItemsSold = todayOrders.reduce(
    (sum, o) => sum + o.order_qty,
    0
  );

  const lowStock = products.filter(p => Number(p.product_stock) < 10).length;
  const recentOrders = todayOrders.slice(-5).reverse();

  return (
    <div className="content-section animate__animated animate__fadeIn">
     <div className="dashboard-header d-flex justify-content-between align-items-center mb-4 glass-card px-4 py-3">
        <h3 className="mb-0">📊 ផ្ទាំងគ្រប់គ្រង</h3>
        <div className="d-flex justify-content-end mb-4">
        <div className="nav-right d-flex align-items-center">
          <div className="user-info text-end me-3 d-none d-md-block">
            <span className="d-block fw-bold text-dark">
              {user?.name || 'Admin User'}
            </span>
            <small className="text-success">
              <i className="fas fa-circle font-xs me-1"></i>
              Online
            </small>
          </div>

          <img
            src='https://png.pngtree.com/png-vector/20240910/ourmid/pngtree-business-women-avatar-png-image_13805764.png'
            alt="profile"
            className="rounded-circle"
            width="40"
            height="40"
          />
        </div>
      </div>

        </div>      
      {/* ===== Top Stats ===== */}
      <div className="row g-4 mb-4">
        <div className="col-md-3 col-sm-6">
          <div className="stats-card glass-card">
            <div className="stats-icon icon-blue">
              <i className="fas fa-dollar-sign"></i>
            </div>
            <h6 className="text-muted">ចំណូលថ្ងៃនេះ</h6>
            <h3 className="fw-bold text-dark">${todayRevenue.toFixed(2)}</h3>
            <small className="text-muted">
              ផលិតផលបានលក់: {totalItemsSold}
            </small>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="stats-card glass-card">
            <div className="stats-icon icon-green">
              <i className="fas fa-shopping-cart"></i>
            </div>
            <h6 className="text-muted">ការលក់ថ្ងៃនេះ</h6>
            <h3 className="fw-bold text-dark">{todayOrders.length}</h3>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="stats-card glass-card">
            <div className="stats-icon icon-orange">
              <i className="fas fa-box"></i>
            </div>
            <h6 className="text-muted">ផលិតផលសរុប</h6>
            <h3 className="fw-bold text-dark">{products.length}</h3>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="stats-card glass-card">
            <div className="stats-icon icon-red">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h6 className="text-muted">ស្តុកទាប</h6>
            <h3 className="fw-bold text-dark">{lowStock}</h3>
          </div>
        </div>
      </div>

      {/* ===== Recent Orders ===== */}
      <h4 className="mb-3">
        <i className="fas fa-clock me-2 text-secondary"></i>
        ការលក់ថ្មីៗ
      </h4>

      {loading ? (
        <div className="text-center py-4 text-muted">កំពុងផ្ទុកទិន្នន័យ...</div>
      ) : error ? (
        <div className="text-center py-4 text-danger">{error}</div>
      ) : (
        <div className="table-responsive glass-card">
          <table className="table align-middle table-hover mb-0">
            <thead>
              <tr>
                <th>លេខវិក្កយបត្រ</th>
                <th>កាលបរិច្ឆេទ</th>
                <th>ផលិតផល</th>
                <th>ចំនួនទឹកប្រាក់</th>
                <th>ស្ថានភាព</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    មិនមានទិន្នន័យ
                  </td>
                </tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{new Date(order.order_datetime).toLocaleString('km-KH')}</td>
                    <td>{order.product_name}</td>
                    <td>${(order.order_qty * order.order_price).toFixed(2)}</td>
                    <td>
                      <span className="badge bg-success rounded-pill px-3 py-2">
                        បានបញ្ចប់
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
