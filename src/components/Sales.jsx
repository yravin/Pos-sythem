import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx'; // 1. Import XLSX

const Sales = ({ sales }) => {
  const [dateFilter, setDateFilter] = useState('');
  const [todayOrders, setTodayOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTodayOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://backend-pos-api.onrender.com/api/today_orders/');
      if (!response.ok) throw new Error('Failed to fetch today orders');
      const data = await response.json();

      const normalized = data.orders.map(order => ({
        id: order.id,
        date: order.order_datetime,
        items: [
          {
            product_name: order.product_name,
            order_qty: order.order_qty,
            product_price: parseFloat(order.order_price)
          }
        ]
      }));

      setTodayOrders(normalized);
    } catch (error) {
      console.error('Error fetching today orders:', error);
      setTodayOrders(sales); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayOrders();
  }, []);

  const calculateSaleTotal = (sale) => {
    if (!sale.items) return 0;
    return sale.items.reduce((sum, item) => sum + item.order_qty * item.product_price, 0);
  };

  const calculateTotalQuantity = (sale) => {
    if (!sale.items) return 0;
    return sale.items.reduce((sum, item) => sum + item.order_qty, 0);
  };

  const filteredSales = dateFilter
    ? todayOrders.filter(sale => new Date(sale.date).toISOString().split('T')[0] === dateFilter)
    : todayOrders;

  // 2. Export Function
  const exportToExcel = () => {
    // Prepare data for Excel
    const dataToExport = filteredSales.map(sale => ({
      'លេខវិក្កយបត្រ': `#${sale.id}`,
      'កាលបរិច្ឆេទ': new Date(sale.date).toLocaleString('km-KH'),
      'ផលិតផល': sale.items.map(i => i.product_name).join(', '),
      'បរិមាណ': calculateTotalQuantity(sale),
      'សរុប ($)': calculateSaleTotal(sale).toFixed(2)
    }));

    // Create Worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    // Create Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");
    
    // Download File
    const fileName = `Sales_Report_${dateFilter || 'All'}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const todayRevenue = filteredSales.reduce((sum, sale) => sum + calculateSaleTotal(sale), 0);

  return (
    <div className="content-section">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0"><i className="fas fa-receipt me-2"></i>របាយការណ៍លក់</h2>
        
        <div className="d-flex gap-2">
          {/* 3. Export Button */}
          <button 
            className="btn btn-success d-flex align-items-center" 
            onClick={exportToExcel}
            disabled={filteredSales.length === 0}
          >
            <i className="fas fa-file-excel me-2"></i>ទាញយក Excel
          </button>

          <button className="btn btn-outline-light d-flex align-items-center" onClick={fetchTodayOrders} disabled={loading}>
            {loading ? (
              <><div className="spinner-border spinner-border-sm me-2" />កំពុងផ្ទុក...</>
            ) : (
              <><i className="fas fa-sync-alt me-2"></i>ផ្ទុកទិន្នន័យថ្មី</>
            )}
          </button>
        </div>
      </div>

      {/* Filter and Stats sections remain the same... */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="p-3 rounded-4" style={{ backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.15)', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <label className="form-label text-light fw-bold mb-2">ជ្រើសថ្ងៃ</label>
            <input type="date" className="form-control bg-transparent text-white border-light" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="row mb-4 p-3 rounded-4 text-white bg-light">
        <div className="col-4 text-center">
          <h4 className="fw-bold text-success">{filteredSales.length}</h4>
          <small className='text-success'>ការលក់សរុប</small>
        </div>
        <div className="col-4 text-center">
          <h4 className="fw-bold text-success">${todayRevenue.toFixed(2)}</h4>
          <small className='text-success'>ចំណូលសរុប</small>
        </div>
        <div className="col-4 text-center text-success">
          <h4 className="fw-bold text-success">{filteredSales.reduce((sum, sale) => sum + calculateTotalQuantity(sale), 0)}</h4>
          < small className='text-success'>ផលិតផលបានលក់</small>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table text-white">
          <thead>
            <tr>
              <th>លេខវិក្កយបត្រ</th>
              <th>កាលបរិច្ឆេទ</th>
              <th>ផលិតផល</th>
              <th>បរិមាណ</th>
              <th>សរុប</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-4 text-muted">មិនមានទិន្នន័យ</td></tr>
            ) : (
              filteredSales.map(sale => (
                <tr key={sale.id}>
                  <td>#{sale.id}</td>
                  <td>{new Date(sale.date).toLocaleString('km-KH')}</td>
                  <td>{sale.items.map(i => i.product_name).join(', ')}</td>
                  <td>{calculateTotalQuantity(sale)}</td>
                  <td>${calculateSaleTotal(sale).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sales;