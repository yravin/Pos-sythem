// components/Inventory.js
import React from 'react';

const Inventory = ({ products }) => {
  const getStockStatus = (stock) => {
    if (stock === 0) return { text: 'អស់ស្តុក', class: 'bg-danger' };
    if (stock < 10) return { text: 'ស្តុកទាប', class: 'bg-warning' };
    return { text: 'មានស្តុក', class: 'bg-success' };
  };

  return (
    <div className="content-section">
      <h2 className="mb-4"><i className="fas fa-warehouse me-2"></i>ស្តុកទំនិញ</h2>
      
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>ឈ្មោះផលិតផល</th>
              <th>បរិមាណស្តុក</th>
              <th>តម្លៃ</th>
              <th>ស្ថានភាព</th>
            </tr>
          </thead>
          <tbody>
            {(!products || products.length === 0) ? (
  <tr>
    <td colSpan="5" className="text-center">មិនមានទិន្នន័យ</td>
  </tr>
) : (
  (products || []).map(product => {
    const status = getStockStatus(product.stock);
    return (
      <tr key={product.product_id}>
        <td>{product.product_name}</td>
        <td>{product.product_stock}</td>
        <td>${product.product_price}</td>
        <td>
          <span className={`badge ${status.class}`}>
            {status.text}
          </span>
        </td>
      </tr>
    );
  })
)}

   </tbody>
   </table>
      </div>
    </div>
  );
};

export default Inventory;