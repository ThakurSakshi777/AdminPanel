import { Search, Plus, Edit, Trash2, MapPin, Home, Building2, TrendingUp } from 'lucide-react';

const Properties = () => {
  const properties = [
    { id: 1, title: '3BHK Luxury Apartment', location: 'Mumbai, Maharashtra', price: '₹1.2 Cr', type: 'Apartment', status: 'Available', beds: 3, baths: 2, sqft: '1,450' },
    { id: 2, title: '2BHK Modern Flat', location: 'Pune, Maharashtra', price: '₹75 Lac', type: 'Flat', status: 'Sold', beds: 2, baths: 2, sqft: '1,100' },
    { id: 3, title: 'Villa with Garden', location: 'Bangalore, Karnataka', price: '₹2.5 Cr', type: 'Villa', status: 'Available', beds: 4, baths: 3, sqft: '2,800' },
    { id: 4, title: 'Commercial Space', location: 'Delhi, NCR', price: '₹5 Cr', type: 'Commercial', status: 'Available', beds: '-', baths: 4, sqft: '5,000' },
    { id: 5, title: '1BHK Studio Apartment', location: 'Gurgaon, Haryana', price: '₹45 Lac', type: 'Apartment', status: 'Available', beds: 1, baths: 1, sqft: '650' },
  ];

  const stats = [
    { label: 'Total Properties', value: '567', icon: Home, color: '#0d9488' },
    { label: 'Available', value: '423', icon: Building2, color: '#14b8a6' },
    { label: 'Sold', value: '98', icon: TrendingUp, color: '#2dd4bf' },
    { label: 'Revenue', value: '₹45 Cr', icon: TrendingUp, color: '#5eead4' },
  ];

  return (
    <div className="page-container">
      <div className="page-header-modern">
        <div>
          <h2>Properties Management</h2>
          <p className="subtitle">Add and manage property listings</p>
        </div>
        <button className="btn-primary-modern">
          <Plus size={18} />
          Add New Property
        </button>
      </div>

      <div className="stats-row">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card-modern" style={{ borderTopColor: stat.color }}>
              <div className="stat-icon-modern" style={{ backgroundColor: stat.color + '20' }}>
                <Icon size={20} color={stat.color} />
              </div>
              <p className="stat-label-modern">{stat.label}</p>
              <h3 className="stat-value-modern">{stat.value}</h3>
            </div>
          );
        })}
      </div>

      <div className="search-bar-modern">
        <Search size={20} />
        <input type="text" placeholder="Search properties by title or location..." />
      </div>

      <div className="table-container-modern">
        <table className="data-table-modern">
          <thead>
            <tr>
              <th>PROPERTY</th>
              <th>LOCATION</th>
              <th>DETAILS</th>
              <th>PRICE</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr key={property.id}>
                <td>
                  <div className="property-cell">
                    <div className="property-icon">🏠</div>
                    <div>
                      <p className="property-title">{property.title}</p>
                      <p className="property-type">{property.type}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="location-cell">
                    <MapPin size={14} />
                    {property.location}
                  </div>
                </td>
                <td>
                  <div className="details-cell">
                    <span>{property.beds} Beds</span> • <span>{property.baths} Baths</span> • <span>{property.sqft} sqft</span>
                  </div>
                </td>
                <td><strong className="price-col">{property.price}</strong></td>
                <td>
                  <span className={`status-badge-modern ${property.status.toLowerCase()}`}>
                    {property.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons-modern">
                    <button className="btn-icon-modern edit"><Edit size={16} /></button>
                    <button className="btn-icon-modern delete"><Trash2 size={16} /></button>
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

export default Properties;
