# Aushadhapoorna POS System

A modern, web-based Point of Sale system built with React and designed specifically for thermal receipt printing via Bluetooth.

## ✨ Features

- **📦 Product Management**: Browse and search products by category
- **🛒 Shopping Cart**: Add items, adjust quantities, and manage cart
- **🖨️ Thermal Printing**: Direct Bluetooth printing to thermal receipt printers
- **📊 Sales Dashboard**: Track daily sales, revenue, and transaction history
- **💰 Tax Calculation**: Automatic CGST and SGST calculation (2.5% each)
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices
- **💾 Local Storage**: Sales data persisted locally

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Bluetooth-enabled thermal printer
- Modern web browser with Web Bluetooth support (Chrome, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fresh-pos-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🖨️ Printer Setup

### Supported Printers
- Thermal receipt printers with Bluetooth connectivity
- ESC/POS compatible printers
- Cat printers (GB01, GB02, GB03, MX series)

### Connection Process
1. Turn on your Bluetooth thermal printer
2. In the POS system, add items to cart
3. Click "Print Receipt & Checkout"
4. Select your printer from the Bluetooth device list
5. The receipt will print automatically

### Troubleshooting Printer Issues
- Ensure your browser supports Web Bluetooth (Chrome/Edge recommended)
- Make sure the printer is in pairing mode
- Check that no other device is connected to the printer
- Use the "Test Printer" button to verify connection

## 📋 Usage

### 1. POS System View
- **Browse Products**: View all available products with categories
- **Search**: Use the search bar to find specific items
- **Filter by Category**: Click category buttons to filter products
- **Add to Cart**: Click "Add to Cart" on any product
- **Manage Cart**: Adjust quantities or remove items from cart
- **Preview Receipt**: Review the receipt before printing
- **Checkout**: Print receipt and complete the sale

### 2. Sales Dashboard
- **Daily Statistics**: View today's sales count and revenue
- **Sales History**: Browse past transactions with details
- **Filter by Date**: View sales for specific dates
- **Transaction Details**: Expand sales to see itemized details


## 🔧 Configuration

### Business Information
Edit the business details in `src/context/PosContext.js`:

```javascript
businessInfo: {
  name: 'Your Business Name',
  address: 'Your Business Address',
  gst: 'Your GST Number'
}
```

### Products
Add or modify products in `src/context/PosContext.js`:

```javascript
products: [
  {
    id: 1,
    name: 'Product Name',
    price: 25.00,
    category: 'Category',
    stock: 100
  }
]
```

### Tax Rates
Modify tax rates in `src/components/Cart.js`:

```javascript
const cgstRate = 0.025; // 2.5% CGST
const sgstRate = 0.025; // 2.5% SGST
```

## 🛠️ Technical Details

### Technologies Used
- **React 18**: Frontend framework
- **TailwindCSS**: Utility-first CSS framework
- **Web Bluetooth API**: Direct browser-to-printer communication
- **Local Storage**: Client-side data persistence
- **ESC/POS Protocol**: Thermal printer communication

### Browser Compatibility
- ✅ Chrome 56+
- ✅ Edge 79+
- ❌ Firefox (Web Bluetooth not supported)
- ❌ Safari (Web Bluetooth not supported)

### Printer Protocol
The system uses a custom thermal printer protocol:
- **Service UUID**: `0000ae30-0000-1000-8000-00805f9b34fb`
- **Characteristic UUID**: `0000ae01-0000-1000-8000-00805f9b34fb`
- **Command Format**: `[0x51, 0x78, command, type, length, payload, crc, 0xff]`

## 📱 Mobile Usage

The system is fully responsive and works on mobile devices:
- Touch-friendly interface
- Optimized for tablets in retail environments
- Works on smartphones for quick sales

## 🔒 Security & Privacy

- All data stored locally in browser
- No external servers or cloud dependencies
- Direct device-to-printer communication
- No personal data transmitted

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
- Static hosting (Netlify, Vercel)
- Web server (Apache, Nginx)
- Local network hosting for retail environment


## 📄 License

This project is licensed under the MIT License.


---

**Built with ❤️ for modern retail businesses**
