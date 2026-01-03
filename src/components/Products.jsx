import React from 'react';
const Products = ({ products, onAddProduct, onDeleteProduct, onEditProduct }) => {
  // Helper function to determine stock status
  const getStockStatus = (product_stock) => {
    if (product_stock === 0) {
      return { text: 'អស់ស្តុក', class: 'bg-danger' };
    } else if (product_stock < 10) {
      return { text: 'ទាប', class: 'bg-warning' };
    } else {
      return { text: 'មាន', class: 'bg-success' };
    }
  };

  return (
    <div className="content-section">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fas fa-box me-2"></i>គ្រប់គ្រងផលិតផល
        </h2>
        <button className="btn btn-gradient border bg-info" onClick={onAddProduct}>
          <i className="fas fa-plus me-2"></i>បន្ថែមផលិតផល
        </button>
      </div>

      {/* Product Table */}
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>រូបភាព</th>
              <th>ឈ្មោះផលិតផល</th>
              <th>បរិមាណស្តុក</th>
              <th>តម្លៃ</th>
              <th>ស្ថានភាព</th>
              <th>សកម្មភាព</th>
            </tr>
          </thead>
          <tbody>
           

             {(products || []).length === 0 ? (
  <tr><td colSpan="6">មិនមានទិន្នន័យ</td></tr>
) : (
  
              (products || []).map(product => {
  const status = getStockStatus(product.product_stock); 
  return (
    <tr key={product.product_id}>
      {/* Product Image */}
      <td>
        {product.product_image ? (
          <img
            src={`http://127.0.0.1:8000${product.product_image}`}
            alt={product.product_name}
            style={{
              width: '50px',
              height: '50px',
              objectFit: 'cover',
              borderRadius: '5px',
            }}
          />
        ) : (
          <div
            className="bg-secondary d-flex align-items-center justify-content-center"
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '5px',
            }}
          >
            <i className="fas fa-image text-white"></i>
          </div>
        )}
      </td>

      <td>{product.product_name}</td>
      <td>{product.product_stock}</td>
      <td>${product.product_price}</td>
      <td>
        <span className={`badge ${status.class}`}>{status.text}</span>
      </td>

      <td>
        <button
          className="btn btn-sm btn-outline-primary me-2"
          onClick={() => onEditProduct(product)}
        >
          <i className="fas fa-edit"></i>
        </button>
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDeleteProduct(product.product_id)}
        >
          <i className="fas fa-trash"></i>
        </button>
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

export default Products;
