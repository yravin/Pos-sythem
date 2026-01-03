import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

// Empty form template
const emptyForm = {
  product_name: "",
  product_price: "",
  product_stock: "",
  product_image: null,
  category_name: "", // FK ID
};

const ProductModal = ({ show, onHide, onSubmit, editingProduct }) => {
  const [formData, setFormData] = useState(emptyForm);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Populate form if editing
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        product_name: editingProduct.product_name || "",
        product_price: editingProduct.product_price || "",
        product_stock: editingProduct.product_stock || "",
        product_image: null, // file must be re-uploaded if changed
        category_name: editingProduct.category_name || "",
      });
    } else {
      setFormData(emptyForm);
    }
  }, [editingProduct, show]);

  // Submit handler
  const handleSubmit = async () => {
    const { product_name, product_price, product_stock, category_name, product_image } = formData;

    // Basic validation
    if (!product_name || !product_price || !product_stock || !category_name) {
      alert("សូមបំពេញព័ត៌មានទាំងអស់!");
      return;
    }

    // Build FormData
    const data = new FormData();
    data.append("product_name", product_name);
    data.append("product_price", parseFloat(product_price));
    data.append("product_stock", parseInt(product_stock, 10));
    data.append("category_name", category_name);
    data.append("product_status", "new_stock");

    // Append file only if selected
    if (product_image instanceof File) {
      data.append("product_image", product_image);
    }

    try {
      await onSubmit(data); // call parent function (POST to Django)
      setFormData(emptyForm);
      onHide();
    } catch (error) {
      console.error("Save error:", error);
      alert("មានបញ្ហាក្នុងការរក្សាទុកទិន្នន័យ!");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {editingProduct ? "✏️ កែសម្រួលផលិតផល" : "➕ បន្ថែមផលិតផលថ្មី"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>ឈ្មោះផលិតផល</Form.Label>
            <Form.Control
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>តម្លៃ ($)</Form.Label>
            <Form.Control
              type="number"
              name="product_price"
              value={formData.product_price}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>បរិមាណស្តុក</Form.Label>
            <Form.Control
              type="number"
              name="product_stock"
              value={formData.product_stock}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>រូបភាពផលិតផល</Form.Label>
            <Form.Control
              type="file"
              name="product_image"
              accept="image/*"
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>ប្រភេទផលិតផល</Form.Label>
            <Form.Select
              name="category_name"
              value={formData.category_name}
              onChange={handleChange}
            >
              <option value="">ជ្រើសរើសប្រភេទ</option>
              <option value="2">ភេសជ្ជៈកំប៉ុង</option>
              <option value="3">អាហារខ្ចប់</option>
              <option value="4">ផ្លែឈើ</option>
              <option value="5">ផ្សេងៗ</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>បោះបង់</Button>
        <Button variant="primary" onClick={handleSubmit}>
          {editingProduct ? "ធ្វើបច្ចុប្បន្នភាព" : "រក្សាទុក"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductModal;
