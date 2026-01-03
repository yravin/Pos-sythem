import React, { useState } from 'react';

const POS = ({ products, cart, onAddToCart, onUpdateCartQuantity, onRemoveFromCart, onSubmitOrder }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter products
  const filteredProducts = (products || []).filter(
    (p) =>
      p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      p.product_stock > 0
  );

  // Correct total
  const cartTotal = cart.reduce((sum, item) => sum + item.product_price * item.order_qty, 0);

  return (
    <div className="content-section">
      <h2 className="mb-4">
        <i className="fas fa-cash-register me-2"></i>ប្រព័ន្ធលក់
      </h2>

      <div className="row">
        {/* Product List */}
        <div className="col-md-7">
          <input
            type="text"
            className="form-control mb-3"
            placeholder="ស្វែងរកផលិតផល..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="row">
            {filteredProducts.length === 0 && (
              <p className="text-muted text-center">គ្មានផលិតផលឬស្តុកទទេ</p>
            )}

            {filteredProducts.map((product) => (
              <div key={product.product_id} className="col-md-4 mb-3">
                <div
                  className="card product-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onAddToCart(product.product_id)}
                >
                  <img
                    src={`https://backend-pos-api.onrender.com${product.product_image}`}
                    alt={product.product_name}
                    className="card-img-top"
                    style={{ height: '150px', objectFit: 'cover' }}
                  />
                  <div className="card-body p-2">
                    <h6 className="mb-1">{product.product_name}</h6>
                    <p className="text-primary mb-0">${product.product_price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="col-md-5">
          <div className="card">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">រទេះទិញ</h5>
            </div>

            <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {cart.length === 0 ? (
                <p className="text-muted text-center">រទេះទិញទទេ</p>
              ) : (
                cart.map((item) => (
                  <div key={item.product_id} className="cart-item mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={`http://127.0.0.1:8000${item.product_image}`}
                        alt={item.product_name}
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />

                      <div className="flex-grow-1 ms-2">
                        <strong>{item.product_name}</strong>
                        <div className="text-muted small">
                          ${item.product_price} x {item.order_qty}
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-1">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => onUpdateCartQuantity(item.product_id, -1)}
                        >
                          -
                        </button>

                        <span>{item.order_qty}</span>

                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => onUpdateCartQuantity(item.product_id, 1)}
                        >
                          +
                        </button>

                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => onRemoveFromCart(item.product_id)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="card-footer">
              <div className="d-flex justify-content-between mb-3">
                <strong>សរុប:</strong>
                <strong className="text-primary">${cartTotal}</strong>
              </div>

              <button className="btn btn-gradient w-100 bg-info" onClick={onSubmitOrder}>
                <i className="fas fa-check me-2"></i>បញ្ចប់ការលក់
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default POS;
