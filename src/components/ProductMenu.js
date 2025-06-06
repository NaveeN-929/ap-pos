import React, { useState } from 'react';
import { usePos } from '../context/PosContext';

const ProductMenu = () => {
  const { products, addToCart } = usePos();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Get unique categories
  const categories = ['All', ...new Set(products.map(product => product.category))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && product.stock > 0;
  });

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Products</h2>
      
      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
        />
        
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(product => (
          <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-800 text-sm">{product.name}</h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {product.category}
              </span>
            </div>
            
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-bold text-primary-600">₹{product.price.toFixed(2)}</span>
              <span className="text-sm text-gray-500">Stock: {product.stock}</span>
            </div>
            
            <button
              onClick={() => handleAddToCart(product)}
              disabled={product.stock === 0}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                product.stock > 0
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No products found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ProductMenu; 