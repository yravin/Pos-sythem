import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const Sales = ({ sales }) => {
  const [dateFilter, setDateFilter] = useState('');
  const [todayOrders, setTodayOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- ផ្នែកបន្ថែមសម្រាប់ Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // កំណត់ឱ្យបង្ហាញតែ ១០ ជួរ

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
      setTodayOrders(sales || []); 
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

  // --- គណនាសម្រាប់បែងចែកទំព័រ (Pagination Logic) ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSales.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const exportToExcel = () => {
    const dataToExport = filteredSales.map(sale => ({
      'លេខវិក្កយបត្រ': `#${sale.id}`,
      'កាលបរិច្ឆេទ': new Date(sale.date).toLocaleString('km-KH'),
      'ផលិតផល': sale.items.map(i => i.product_name).join(', '),
      'បរិមាណ': calculateTotalQuantity(sale),
      'សរុប ($)': calculateSaleTotal(sale).toFixed(2)
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");
    const fileName = `Sales_Report_${dateFilter || 'All'}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const todayRevenue = filteredSales.reduce((sum, sale) => sum + calculateSaleTotal(sale), 0);

  return (
    <div className="content-section">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0"><i className="fas fa-receipt me-2"></i>របាយការណ៍លក់</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-success d-flex align-items-center" onClick={exportToExcel} disabled={filteredSales.length === 0}>
            <i className="fas fa-file-excel me-2"></i>ទាញយក Excel
          </button>
          <button className="btn btn-outline-light d-flex align-items-center" onClick={fetchTodayOrders} disabled={loading}>
            {loading ? <><div className="spinner-border spinner-border-sm me-2" />កំពុងផ្ទុក...</> : <><i className="fas fa-sync-alt me-2"></i>ផ្ទុកថ្មី</>}
          </button>
        </div>
      </div>

      {/* Filter and Stats... */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="p-3 rounded-4" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <label className="form-label text-light fw-bold mb-2">ជ្រើសថ្ងៃ</label>
            <input type="date" className="form-control bg-transparent text-white border-light" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setCurrentPage(1); }} />
          </div>
        </div>
      </div>

      <div className="row mb-4 p-3 rounded-4 text-white bg-light text-dark shadow-sm">
        <div className="col-4 text-center">
          <h4 className="fw-bold text-success">{filteredSales.length}</h4>
          <small className='text-muted'>ការលក់សរុប</small>
        </div>
        <div className="col-4 text-center">
          <h4 className="fw-bold text-success">${todayRevenue.toFixed(2)}</h4>
          <small className='text-muted'>ចំណូលសរុប</small>
        </div>
        <div className="col-4 text-center text-success">
          <h4 className="fw-bold text-success">{filteredSales.reduce((sum, sale) => sum + calculateTotalQuantity(sale), 0)}</h4>
          <small className='text-muted'>ផលិតផលបានលក់</small>
        </div>
      </div>

      {/* Table Section */}
      <div className="table-responsive">
        <table className="table text-white">
          <thead>
            <tr className='text-muted'>
              <th>លេខវិក្កយបត្រ</th>
              <th>កាលបរិច្ឆេទ</th>
              <th>ផលិតផល</th>
              <th>បរិមាណ</th>
              <th>សរុប</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-4 text-muted">មិនមានទិន្នន័យ</td></tr>
            ) : (
              currentItems.map(sale => (
                <tr key={sale.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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

      {/* --- ប៊ូតុង Back / Next (Pagination Controls) --- */}
      {filteredSales.length > itemsPerPage && (
        <div className="d-flex justify-content-between align-items-center mt-3 p-2">
          <div className="text-muted small">
             បង្ហាញជួរទី {indexOfFirstItem + 1} ដល់ {Math.min(indexOfLastItem, filteredSales.length)} នៃទិន្នន័យ {filteredSales.length}
          </div>
          <div className="btn-group">
            <button 
              className="btn btn-sm btn-outline-light" 
              onClick={() => paginate(currentPage - 1)} 
              disabled={currentPage === 1}
            >
              <i className="fas fa-chevron-left me-1"></i> ថយក្រោយ
            </button>
            
            {/* បង្ហាញលេខទំព័រ (Optional) */}
            <span className="btn btn-sm btn-light disabled text-dark">
              ទំព័រ {currentPage} / {totalPages}
            </span>

            <button 
              className="btn btn-sm btn-outline-light" 
              onClick={() => paginate(currentPage + 1)} 
              disabled={currentPage === totalPages}
            >
              បន្ទាប់ <i className="fas fa-chevron-right ms-1"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;