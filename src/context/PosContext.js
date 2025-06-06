import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  cart: [],
  products: [
    { id: 1, name: 'Hibiscus', price: 48.00, category: 'Soup', stock: 10000 },
    { id: 2, name: 'Moringa', price: 48.00, category: 'Soup', stock: 10000 },
    { id: 3, name: 'Amla', price: 48.00, category: 'Soup', stock: 10000 },
    { id: 4, name: 'Thoothuvalai', price: 48.00, category: 'Soup', stock: 10000 },
    { id: 5, name: 'Manathakkali', price: 48.00, category: 'Soup', stock: 10000 },
    { id: 6, name: 'Pirandai', price: 48.00, category: 'Soup', stock: 10000 },
    { id: 7, name: 'Aavaram', price: 48.00, category: 'Soup', stock: 10000 },
    { id: 8, name: 'Banana Stem', price: 48.00, category: 'Soup', stock: 10000 },
    { id: 9, name: 'jamoon seed', price: 48.00, category: 'Soup', stock: 10000 },
    { id: 10, name: 'Water', price: 10.00, category: 'Drink', stock: 10000 },
    { id: 11, name: 'Coffee', price: 20.00, category: 'Coffee', stock: 10000 },
    { id: 12, name: 'Coffee', price: 20.00, category: 'Coffee', stock: 10000 },
    { id: 13, name: 'Tea', price: 10.00, category: 'Tea', stock: 10000 },
    { id: 14, name: 'Tea', price: 10.00, category: 'Tea', stock: 10000 },
    { id: 15, name: 'Tea', price: 10.00, category: 'Tea', stock: 10000 },
    { id: 16, name: 'foxtail-laddu', price: 15.00, category: 'Millet-laddu', stock: 10000 },
    { id: 17, name: 'ragi-laddu', price: 15.00, category: 'Millet-laddu', stock: 10000 },
    { id: 18, name: 'laddu', price: 15.00, category: 'Millet-laddu', stock: 10000 },
    { id: 19, name: 'Kodu Pongal', price: 25.00, category: 'Tifin', stock: 10000 },
    { id: 20, name: 'porso kitchidi', price: 25.00, category: 'Tifin', stock: 10000 },
  ],
  sales: [],
  businessInfo: {
    name: 'Aushadhapoorna',
    gst: '29ABCDE1234F1Z5'
  }
};

// Action types
const actionTypes = {
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_CART_QUANTITY: 'UPDATE_CART_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  ADD_SALE: 'ADD_SALE',
  UPDATE_STOCK: 'UPDATE_STOCK'
};

// Reducer function
function posReducer(state, action) {
  switch (action.type) {
    case actionTypes.ADD_TO_CART: {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.cart.find(item => item.id === product.id);
      
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        };
      } else {
        return {
          ...state,
          cart: [...state.cart, { ...product, quantity }]
        };
      }
    }
    
    case actionTypes.REMOVE_FROM_CART: {
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload.id)
      };
    }
    
    case actionTypes.UPDATE_CART_QUANTITY: {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          cart: state.cart.filter(item => item.id !== id)
        };
      }
      
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      };
    }
    
    case actionTypes.CLEAR_CART: {
      return {
        ...state,
        cart: []
      };
    }
    
    case actionTypes.ADD_SALE: {
      return {
        ...state,
        sales: [...state.sales, action.payload],
        cart: [] // Clear cart after sale
      };
    }
    
    case actionTypes.UPDATE_STOCK: {
      const { id, quantity } = action.payload;
      return {
        ...state,
        products: state.products.map(product =>
          product.id === id
            ? { ...product, stock: Math.max(0, product.stock - quantity) }
            : product
        )
      };
    }
    
    default:
      return state;
  }
}

// Create context
const PosContext = createContext();

// Custom hook to use POS context
export const usePos = () => {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePos must be used within a PosProvider');
  }
  return context;
};

// Provider component
export const PosProvider = ({ children }) => {
  const [state, dispatch] = useReducer(posReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedSales = localStorage.getItem('pos-sales');
    if (savedSales) {
      try {
        const sales = JSON.parse(savedSales);
        sales.forEach(sale => {
          dispatch({ type: actionTypes.ADD_SALE, payload: sale });
        });
      } catch (error) {
        console.error('Failed to load sales data:', error);
      }
    }
  }, []);

  // Save sales to localStorage whenever sales change
  useEffect(() => {
    localStorage.setItem('pos-sales', JSON.stringify(state.sales));
  }, [state.sales]);

  // Action creators
  const actions = {
    addToCart: (product, quantity) => {
      dispatch({ type: actionTypes.ADD_TO_CART, payload: { product, quantity } });
    },
    
    removeFromCart: (id) => {
      dispatch({ type: actionTypes.REMOVE_FROM_CART, payload: { id } });
    },
    
    updateCartQuantity: (id, quantity) => {
      dispatch({ type: actionTypes.UPDATE_CART_QUANTITY, payload: { id, quantity } });
    },
    
    clearCart: () => {
      dispatch({ type: actionTypes.CLEAR_CART });
    },
    
    completeSale: (saleData) => {
      // Update stock for sold items
      saleData.items.forEach(item => {
        dispatch({ type: actionTypes.UPDATE_STOCK, payload: { id: item.id, quantity: item.quantity } });
      });
      
      // Add sale record
      const sale = {
        ...saleData,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
      };
      
      dispatch({ type: actionTypes.ADD_SALE, payload: sale });
      
      return sale;
    }
  };

  // Computed values
  const computed = {
    cartTotal: state.cart.reduce((total, item) => total + (item.price * item.quantity), 0),
    cartItemCount: state.cart.reduce((count, item) => count + item.quantity, 0),
    dailySales: state.sales.filter(sale => sale.date === new Date().toLocaleDateString()),
    dailyTotal: state.sales
      .filter(sale => sale.date === new Date().toLocaleDateString())
      .reduce((total, sale) => total + sale.total, 0)
  };

  const value = {
    ...state,
    ...actions,
    ...computed
  };

  return (
    <PosContext.Provider value={value}>
      {children}
    </PosContext.Provider>
  );
}; 