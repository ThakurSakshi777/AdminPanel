import { Search, Plus, Edit, Trash2, Wrench } from 'lucide-react';

const Services = () => {
  const services = [
    { id: 1, name: 'Home Cleaning', provider: 'Clean Pro Services', price: '₹2,000', category: 'Cleaning', status: 'Active' },
    { id: 2, name: 'AC Repair', provider: 'Cool Tech', price: '₹1,500', category: 'Maintenance', status: 'Active' },
    { id: 3, name: 'Plumbing', provider: 'Quick Fix', price: '₹800', category: 'Maintenance', status: 'Active' },
    { id: 4, name: 'Painting', provider: 'Color Masters', price: '₹5,000', category: 'Renovation', status: 'Inactive' },
    { id: 5, name: 'Pest Control', provider: 'Pest Away', price: '₹1,200', category: 'Cleaning', status: 'Active' },
  ];

  return (
    <div className="page-container">
      <div className="page-header-modern">
        <div>
          <h2>Services Management</h2>
          <p className="subtitle">Manage additional services offered</p>
        </div>
        <button className="btn-primary-modern">
          <Plus size={18} />
          Add New Service
        </button>
      </div>

      <div className="search-bar">
        <Search size={20} />
        <input type="text" placeholder="Search services..." />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Service Name</th>
              <th>Provider</th>
              <th>Price</th>
              <th>Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id}>
                <td>#{service.id}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Wrench size={16} />
                    {service.name}
                  </div>
                </td>
                <td>{service.provider}</td>
                <td><strong>{service.price}</strong></td>
                <td><span className="badge-role">{service.category}</span></td>
                <td>
                  <span className={`badge-status ${service.status.toLowerCase()}`}>
                    {service.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon"><Edit size={16} /></button>
                    <button className="btn-icon danger"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Services;
