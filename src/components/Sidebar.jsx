// components/Sidebar.js
import React from 'react';
import'./Css/sidebar.css'

const Sidebar = ({ activeSection, onSectionChange }) => {
  const menuItems = [
    { id: 'dashboard', icon: 'fas fa-chart-line', label: 'ផ្ទាំងគ្រប់គ្រង' },
    { id: 'products', icon: 'fas fa-box', label: 'គ្រប់គ្រងផលិតផល' },
    { id: 'pos', icon: 'fas fa-cash-register', label: 'ប្រព័ន្ធលក់' },
    { id: 'sales', icon: 'fas fa-receipt', label: 'របាយការណ៍លក់' },
    { id: 'inventory', icon: 'fas fa-warehouse', label: 'ស្តុកទំនិញ' }
  ];

  return (
    <div className="col-md-2 sidebar p-0">
      <div className="logo">
        <i className="fas fa-store"></i> POS System
      </div>
      <ul className="nav flex-column">
        {menuItems.map(item => (
          <li key={item.id} className="nav-item">
            <a 
              className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => onSectionChange(item.id)}
            >
              <i className={item.icon}></i> {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;