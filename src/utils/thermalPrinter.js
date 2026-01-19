// // Cat Printer Utility for Bluetooth Kitty/Cat Printers
// // Based on working implementations from NaitLee/kitty-printer and other cat printer projects
// // Uses the correct cat printer protocol with proper packet structure and CRC calculation

// class CatPrinter {
//   constructor() {
//     this.device = null;
//     this.characteristic = null;
//     this.isConnected = false;
//     this.printerWidth = 576; // 58mm thermal printer (576 pixels = 72 bytes)
//     this.bytesPerLine = 72;  // 576 pixels / 8 bits = 72 bytes
//     this.actualPrintWidth = 560; // Usable width (leaving small margins)
//   }

//   // ===============================================
//   // LOOKUP TABLES AND CONSTANTS
//   // ===============================================

//   // CRC8 calculation table for cat printer protocol
//   static CRC_TABLE = [
//     0x00, 0x07, 0x0e, 0x09, 0x1c, 0x1b, 0x12, 0x15, 0x38, 0x3f, 0x36, 0x31, 0x24, 0x23, 0x2a, 0x2d,
//     0x70, 0x77, 0x7e, 0x79, 0x6c, 0x6b, 0x62, 0x65, 0x48, 0x4f, 0x46, 0x41, 0x54, 0x53, 0x5a, 0x5d,
//     0xe0, 0xe7, 0xee, 0xe9, 0xfc, 0xfb, 0xf2, 0xf5, 0xd8, 0xdf, 0xd6, 0xd1, 0xc4, 0xc3, 0xca, 0xcd,
//     0x90, 0x97, 0x9e, 0x99, 0x8c, 0x8b, 0x82, 0x85, 0xa8, 0xaf, 0xa6, 0xa1, 0xb4, 0xb3, 0xba, 0xbd,
//     0xc7, 0xc0, 0xc9, 0xce, 0xdb, 0xdc, 0xd5, 0xd2, 0xff, 0xf8, 0xf1, 0xf6, 0xe3, 0xe4, 0xed, 0xea,
//     0xb7, 0xb0, 0xb9, 0xbe, 0xab, 0xac, 0xa5, 0xa2, 0x8f, 0x88, 0x81, 0x86, 0x93, 0x94, 0x9d, 0x9a,
//     0x27, 0x20, 0x29, 0x2e, 0x3b, 0x3c, 0x35, 0x32, 0x1f, 0x18, 0x11, 0x16, 0x03, 0x04, 0x0d, 0x0a,
//     0x57, 0x50, 0x59, 0x5e, 0x4b, 0x4c, 0x45, 0x42, 0x6f, 0x68, 0x61, 0x66, 0x73, 0x74, 0x7d, 0x7a,
//     0x89, 0x8e, 0x87, 0x80, 0x95, 0x92, 0x9b, 0x9c, 0xb1, 0xb6, 0xbf, 0xb8, 0xad, 0xaa, 0xa3, 0xa4,
//     0xf9, 0xfe, 0xf7, 0xf0, 0xe5, 0xe2, 0xeb, 0xec, 0xc1, 0xc6, 0xcf, 0xc8, 0xdd, 0xda, 0xd3, 0xd4,
//     0x69, 0x6e, 0x67, 0x60, 0x75, 0x72, 0x7b, 0x7c, 0x51, 0x56, 0x5f, 0x58, 0x4d, 0x4a, 0x43, 0x44,
//     0x19, 0x1e, 0x17, 0x10, 0x05, 0x02, 0x0b, 0x0c, 0x21, 0x26, 0x2f, 0x28, 0x3d, 0x3a, 0x33, 0x34,
//     0x4e, 0x49, 0x40, 0x47, 0x52, 0x55, 0x5c, 0x5b, 0x76, 0x71, 0x78, 0x7f, 0x6a, 0x6d, 0x64, 0x63,
//     0x3e, 0x39, 0x30, 0x37, 0x22, 0x25, 0x2c, 0x2b, 0x06, 0x01, 0x08, 0x0f, 0x1a, 0x1d, 0x14, 0x13,
//     0xae, 0xa9, 0xa0, 0xa7, 0xb2, 0xb5, 0xbc, 0xbb, 0x96, 0x91, 0x98, 0x9f, 0x8a, 0x8d, 0x84, 0x83,
//     0xde, 0xd9, 0xd0, 0xd7, 0xc2, 0xc5, 0xcc, 0xcb, 0xe6, 0xe1, 0xe8, 0xef, 0xfa, 0xfd, 0xf4, 0xf3
//   ];

//   // Bit mirroring table for cat printer bitmap format
//   static MIRROR_TABLE = [
//     0x00, 0x80, 0x40, 0xC0, 0x20, 0xA0, 0x60, 0xE0, 0x10, 0x90, 0x50, 0xD0, 0x30, 0xB0, 0x70, 0xF0,
//     0x08, 0x88, 0x48, 0xC8, 0x28, 0xA8, 0x68, 0xE8, 0x18, 0x98, 0x58, 0xD8, 0x38, 0xB8, 0x78, 0xF8,
//     0x04, 0x84, 0x44, 0xC4, 0x24, 0xA4, 0x64, 0xE4, 0x14, 0x94, 0x54, 0xD4, 0x34, 0xB4, 0x74, 0xF4,
//     0x0C, 0x8C, 0x4C, 0xCC, 0x2C, 0xAC, 0x6C, 0xEC, 0x1C, 0x9C, 0x5C, 0xDC, 0x3C, 0xBC, 0x7C, 0xFC,
//     0x02, 0x82, 0x42, 0xC2, 0x22, 0xA2, 0x62, 0xE2, 0x12, 0x92, 0x52, 0xD2, 0x32, 0xB2, 0x72, 0xF2,
//     0x0A, 0x8A, 0x4A, 0xCA, 0x2A, 0xAA, 0x6A, 0xEA, 0x1A, 0x9A, 0x5A, 0xDA, 0x3A, 0xBA, 0x7A, 0xFA,
//     0x06, 0x86, 0x46, 0xC6, 0x26, 0xA6, 0x66, 0xE6, 0x16, 0x96, 0x56, 0xD6, 0x36, 0xB6, 0x76, 0xF6,
//     0x0E, 0x8E, 0x4E, 0xCE, 0x2E, 0xAE, 0x6E, 0xEE, 0x1E, 0x9E, 0x5E, 0xDE, 0x3E, 0xBE, 0x7E, 0xFE,
//     0x01, 0x81, 0x41, 0xC1, 0x21, 0xA1, 0x61, 0xE1, 0x11, 0x91, 0x51, 0xD1, 0x31, 0xB1, 0x71, 0xF1,
//     0x09, 0x89, 0x49, 0xC9, 0x29, 0xA9, 0x69, 0xE9, 0x19, 0x99, 0x59, 0xD9, 0x39, 0xB9, 0x79, 0xF9,
//     0x05, 0x85, 0x45, 0xC5, 0x25, 0xA5, 0x65, 0xE5, 0x15, 0x95, 0x55, 0xD5, 0x35, 0xB5, 0x75, 0xF5,
//     0x0D, 0x8D, 0x4D, 0xCD, 0x2D, 0xAD, 0x6D, 0xED, 0x1D, 0x9D, 0x5D, 0xDD, 0x3D, 0xBD, 0x7D, 0xFD,
//     0x03, 0x83, 0x43, 0xC3, 0x23, 0xA3, 0x63, 0xE3, 0x13, 0x93, 0x53, 0xD3, 0x33, 0xB3, 0x73, 0xF3,
//     0x0B, 0x8B, 0x4B, 0xCB, 0x2B, 0xAB, 0x6B, 0xEB, 0x1B, 0x9B, 0x5B, 0xDB, 0x3B, 0xBB, 0x7B, 0xFB,
//     0x07, 0x87, 0x47, 0xC7, 0x27, 0xA7, 0x67, 0xE7, 0x17, 0x97, 0x57, 0xD7, 0x37, 0xB7, 0x77, 0xF7,
//     0x0F, 0x8F, 0x4F, 0xCF, 0x2F, 0xAF, 0x6F, 0xEF, 0x1F, 0x9F, 0x5F, 0xDF, 0x3F, 0xBF, 0x7F, 0xFF
//   ];

//   // ===============================================
//   // CORE COMMUNICATION FUNCTIONS
//   // ===============================================

//   // Calculate CRC8 checksum for data integrity
//   calculateCRC8(data) {
//     let crc = 0;
//     for (const byte of data) {
//       crc = CatPrinter.CRC_TABLE[crc ^ byte];
//     }
//     return crc;
//   }

//   // Connect to Bluetooth cat printer
//   async connect() {
//     try {
//       console.log('🐱 Connecting to cat printer...');
      
//       this.device = await navigator.bluetooth.requestDevice({
//         acceptAllDevices: true,
//         optionalServices: [
//           "0000ae30-0000-1000-8000-00805f9b34fb", // Cat printer service
//           "000018f0-0000-1000-8000-00805f9b34fb"  // Alternative service
//         ]
//       });

//       console.log('📱 Device found:', this.device.name);
//       const server = await this.device.gatt.connect();
      
//       // Try primary cat printer service first
//       let service;
//       try {
//         service = await server.getPrimaryService("0000ae30-0000-1000-8000-00805f9b34fb");
//         this.characteristic = await service.getCharacteristic("0000ae01-0000-1000-8000-00805f9b34fb");
//         console.log('✅ Connected using primary service');
//       } catch (error) {
//         console.log('Primary service failed, trying alternative...');
//         // Fallback to alternative service
//         service = await server.getPrimaryService("000018f0-0000-1000-8000-00805f9b34fb");
//         this.characteristic = await service.getCharacteristic("00002af1-0000-1000-8000-00805f9b34fb");
//         console.log('✅ Connected using alternative service');
//       }

//       this.isConnected = true;
//       console.log('✅ Cat printer connected successfully!');
      
//       return true;
//     } catch (error) {
//       console.error('❌ Connection failed:', error);
//       this.isConnected = false;
//       throw new Error(`Failed to connect to cat printer: ${error.message}`);
//     }
//   }

//   // Send packet to cat printer with reduced delays
//   async sendPacket(command, data = []) {
//     if (!this.isConnected || !this.characteristic) {
//       throw new Error('Cat printer not connected');
//     }

//     // Cat printer packet structure: [0x51, 0x78, command, type, len_low, len_high, ...data, crc, 0xFF]
//     const packet = [
//       0x51, 0x78,           // Header magic bytes
//       command,              // Command byte
//       0x00,                 // Type (0 = data transfer)
//       data.length & 0xFF,   // Length low byte
//       (data.length >> 8) & 0xFF, // Length high byte
//       ...data,              // Data payload
//       this.calculateCRC8(data), // CRC8 checksum
//       0xFF                  // End marker
//     ];

//     try {
//       console.log(`📤 Sending command 0x${command.toString(16).padStart(2, '0')} with ${data.length} bytes`);
//       await this.characteristic.writeValue(new Uint8Array(packet));
//       await this.delay(50); // Reduced delay for faster printing
//     } catch (error) {
//       console.error('Failed to send packet:', error);
//       throw error;
//     }
//   }

//   // Utility delay function - reduced for faster printing
//   delay(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
//   }

//   // ===============================================
//   // PRINTER INITIALIZATION AND CONTROL
//   // ===============================================

//   // Initialize printer with faster settings
//   async initialize() {
//     console.log('🔧 Initializing cat printer for fast 58mm printing...');
    
//     try {
//       // === RESET PRINTER ===
//       await this.sendPacket(0xA3, [0x00]); // Reset/Initialize
//       await this.delay(500); // Reduced delay

//       // === SET PAPER WIDTH ===
//       await this.sendPacket(0xA4, [0x40, 0x02]); // Set paper width (576 pixels)
//       await this.delay(150); // Reduced delay
//       await this.sendPacket(0xA4, [0x48, 0x00]); // Alternative width command
//       await this.delay(150); // Reduced delay

//       // === CONFIGURE PRINT DENSITY ===
//       await this.sendPacket(0xAF, [0xFF, 0xFF]); // Maximum energy/density (both bytes max)
//       await this.delay(150); // Reduced delay
      
//       // Additional energy commands
//       await this.sendPacket(0xBE, [0xFF]); // Print density
//       await this.delay(100); // Reduced delay
      
//       await this.sendPacket(0xA5, [0xFF]); // Maximum darkness
//       await this.delay(100); // Reduced delay

//       // === SET PRINT SPEED ===
//       await this.sendPacket(0xBD, [0x02]); // Faster print speed (was 0x00)
//       await this.delay(100); // Reduced delay

//       // === SET HEATING TIME ===
//       await this.sendPacket(0xBC, [0xFF, 0xFF]); // Maximum heating time
//       await this.delay(100); // Reduced delay

//       console.log('✅ Cat printer initialized with FAST settings for 58mm paper');
//     } catch (error) {
//       console.error('❌ Initialization failed:', error);
//       throw error;
//     }
//   }

//   // ===============================================
//   // PRINT JOB CONTROL
//   // ===============================================

//   // Start print job with more initial feed to prevent top cutoff
//   async startPrintJob() {
//     console.log('📋 Starting print job with generous initial feed...');
//     await this.sendPacket(0xA6, [0xAA, 0x55, 0x17, 0x38, 0x44, 0x5F, 0x5F, 0x5F, 0x44, 0x38, 0x2C]);
//     await this.delay(100);
//     // Add generous initial paper feed to prevent top text cutoff
//     await this.feedPaper(3);
//   }

//   // End print job with maximum paper feed
//   async endPrintJob() {
//     console.log('📋 Ending print job with maximum cutting feed...');
//     await this.sendPacket(0xA6, [0xAA, 0x55, 0x17, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x17]);
//     await this.delay(100);
//     // Add maximum paper feed for cutting
//     await this.feedPaper(30); // Increased to 30 lines with better feed amount calculation
    
//     // Additional feed commands to ensure enough paper
//     await this.sendPacket(0xA1, [255, 0x00]); // Maximum single feed
//     await this.delay(200);
//     await this.sendPacket(0xA1, [255, 0x00]); // Another maximum feed
//     await this.delay(200);
//   }

//   // ===============================================
//   // PAPER FEED AND MOVEMENT
//   // ===============================================

//   // Feed paper with proper command and increased amount
//   async feedPaper(lines = 1) {
//     console.log(`📄 Feeding ${lines} lines...`);
//     // Increase the feed amount significantly and ensure it's visible
//     const feedAmount = Math.min(lines * 24, 255); // Increased multiplier from 16 to 24
//     await this.sendPacket(0xA1, [feedAmount, 0x00]);
//     await this.delay(150); // Increased delay to ensure feed completes
//   }

//   // ===============================================
//   // BITMAP PRINTING
//   // ===============================================

//   // Print bitmap line with reduced delay
//   async printBitmapLine(lineData) {
//     if (lineData.length !== this.bytesPerLine) { // 58mm printers expect 72 bytes per line (576 pixels / 8)
//       throw new Error(`Line data must be exactly ${this.bytesPerLine} bytes (${this.printerWidth} pixels)`);
//     }
    
//     // Mirror the bits for proper cat printer format
//     const mirroredData = lineData.map(byte => CatPrinter.MIRROR_TABLE[byte]);
    
//     console.log(`🖨️ Printing bitmap line (${mirroredData.length} bytes)`);
//     await this.sendPacket(0xA2, mirroredData);
//     await this.delay(25); // Reduced delay for faster printing
//   }

//   // ===============================================
//   // TEST PATTERNS AND DIAGNOSTICS
//   // ===============================================

//   // Create full-width test pattern
//   createTestPattern() {
//     const lines = [];
    
//     // Create 10 lines of different patterns to test full width
//     for (let lineNum = 0; lineNum < 10; lineNum++) {
//       const line = new Array(this.bytesPerLine).fill(0);
      
//       if (lineNum === 0 || lineNum === 9) {
//         // Full solid lines at top and bottom
//         line.fill(0xFF);
//       } else if (lineNum % 3 === 1) {
//         // Alternating pattern
//         for (let i = 0; i < this.bytesPerLine; i++) {
//           line[i] = i % 2 === 0 ? 0xFF : 0x00;
//         }
//       } else if (lineNum % 3 === 2) {
//         // Dotted pattern
//         for (let i = 0; i < this.bytesPerLine; i++) {
//           line[i] = 0xAA; // 10101010 pattern
//         }
//       } else {
//         // Quarter-width sections
//         const quarterWidth = Math.floor(this.bytesPerLine / 4);
//         for (let i = 0; i < quarterWidth; i++) {
//           line[i] = 0xFF; // Left quarter
//           line[this.bytesPerLine - 1 - i] = 0xFF; // Right quarter
//         }
//       }
      
//       lines.push(line);
//     }
    
//     return lines;
//   }

//   // ===============================================
//   // MAIN RECEIPT PRINTING FUNCTIONS
//   // ===============================================

//   // Print complete receipt with exact format matching the sample
//   async printReceipt(receiptData) {
//     if (!this.isConnected) {
//       await this.connect();
//     }

//     try {
//       console.log('🖨️ Starting receipt with proper spacing and separators...');
      
//       // === PRINTER INITIALIZATION ===
//       await this.initialize();
//       await this.startPrintJob();

//       // === HEADER SECTION ===
//       await this.printCenteredText(receiptData.businessName, 1);
//       await this.printCenteredText(receiptData.address, 1);
//       await this.printCenteredText(`GST: ${receiptData.gst}`, 1);
      
//       const now = new Date();
//       const dateTime = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
//       await this.printCenteredText(dateTime, 1);

//       // 1st SEPARATOR: Between header and items
//       await this.printSeparatorLine();
//       await this.feedPaper(2); // Additional space after separator

//       // === ITEMS SECTION ===
//       console.log('📋 Printing items with proper spacing...');
//       for (const item of receiptData.items || []) {
//         const itemTotal = (item.price * item.quantity).toFixed(2);
//         const unitPrice = item.price.toFixed(2);
//         await this.printItemLine(item.name, item.quantity, itemTotal, unitPrice);
//       }

//       // 2nd SEPARATOR: Between items and subtotal
//       await this.printSeparatorLine();
//       await this.feedPaper(2); // Additional space after separator

//       // === TOTALS SECTION ===
//       console.log('💰 Printing totals with proper alignment...');
//       await this.printTotalLine('Subtotal:', `Rs.${receiptData.subtotal.toFixed(2)}`);
//       await this.printTotalLine('CGST (2.5%):', `Rs.${receiptData.cgst.toFixed(2)}`);
//       await this.printTotalLine('SGST (2.5%):', `Rs.${receiptData.sgst.toFixed(2)}`);

//       // 3rd SEPARATOR: Between subtotal and total
//       await this.printSeparatorLine();
//       await this.feedPaper(2); // Additional space after separator

//       // === HIGHLIGHTED TOTAL ===
//       await this.printTotalLine('TOTAL:', `Rs.${receiptData.total.toFixed(2)}`, true);
      
//       // 4th SEPARATOR: At the end of total
//       await this.printSeparatorLine();
//       await this.feedPaper(3); // Additional space after final separator
      
//       // === FINALIZE PRINT JOB ===
//       await this.endPrintJob();
      
//       console.log('✅ Receipt completed with proper spacing and separators!');
      
//     } catch (error) {
//       console.error('❌ Cat printer receipt failed:', error);
//       throw error;
//     }
//   }

//   // ===============================================
//   // TESTING AND DIAGNOSTICS FUNCTIONS
//   // ===============================================

//   // Test print with 58mm paper examples
//   async testPrint() {
//     if (!this.isConnected) {
//       await this.connect();
//     }

//     try {
//       console.log('🧪 Testing improved receipt readability...');
      
//       // === INITIALIZE TEST PRINT ===
//       await this.initialize();
//       await this.startPrintJob();
      
//       // === WIDTH TEST RULERS ===
//       await this.printSimpleText('012345678901234567890123456789012345', 1);
//       await this.printSimpleText('         1         2         3   ', 1);
      
//       // === HEADER SECTION TEST ===
//       await this.printCenteredText('Aushadhapoorna', 2);
//       await this.printCenteredText('Medical Complex, Health Street', 1);
//       await this.printCenteredText('GST: 29ABCDE1234F1Z5', 1);
//       await this.printCenteredText('12/20/2024 3:45:30 PM', 1);
      
//       // Extra spacing after header
//       await this.feedPaper(2);
//       await this.printSeparatorLine();
      
//       // === ITEMS SECTION TEST ===
//       await this.printLeftRightText('PARACETAMOL 500MG x1', '₹25.00', 1);
//       await this.printLeftRightText('VITAMIN D3 x1', '₹120.00', 1);
//       await this.printLeftRightText('CROCIN TABLET x2', '₹50.00', 1);
//       await this.printLeftRightText('HAND SANITIZER x1', '₹55.00', 1);
      
//       // Extra spacing before totals
//       await this.feedPaper(2);
//       await this.printSeparatorLine();
      
//       // === TOTALS SECTION TEST ===
//       await this.printLeftRightText('Subtotal:', '₹250.00', 1);
//       await this.printLeftRightText('CGST (2.5%):', '₹6.25', 1);
//       await this.printLeftRightText('SGST (2.5%):', '₹6.25', 1);
      
//       // === HIGHLIGHTED TOTAL TEST ===
//       await this.feedPaper(1);
//       await this.printSeparatorLine();
//       await this.printBoldText('TOTAL:', '₹263.00');
//       await this.printSeparatorLine();
      
//       // === FOOTER TEST ===
//       await this.feedPaper(4);
//       await this.printCenteredText('THANK YOU!', 3);

//       // === FINALIZE TEST PRINT ===
//       await this.endPrintJob();
      
//       console.log('✅ Test completed with improved readability!');
      
//     } catch (error) {
//       console.error('❌ Cat printer test failed:', error);
//       throw error;
//     }
//   }

//   // ===============================================
//   // CONNECTION MANAGEMENT
//   // ===============================================

//   // Disconnect from printer
//   disconnect() {
//     if (this.device && this.device.gatt.connected) {
//       this.device.gatt.disconnect();
//     }
//     this.isConnected = false;
//     this.device = null;
//     this.characteristic = null;
//     console.log('🔌 Cat printer disconnected');
//   }

//   // ===============================================
//   // TEXT RENDERING AND FONT SYSTEM
//   // ===============================================

//   // Convert text to bitmap with more line spacing
//   textToBitmap(text, spacing = 2, addLineSpacing = true) {
//     const font = {
//       ' ': [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
//       'A': [0x18, 0x24, 0x42, 0x42, 0x7E, 0x42, 0x42, 0x00],
//       'B': [0x7C, 0x42, 0x42, 0x7C, 0x42, 0x42, 0x7C, 0x00],
//       'C': [0x3C, 0x42, 0x40, 0x40, 0x40, 0x42, 0x3C, 0x00],
//       'D': [0x78, 0x44, 0x42, 0x42, 0x42, 0x44, 0x78, 0x00],
//       'E': [0x7E, 0x40, 0x40, 0x7C, 0x40, 0x40, 0x7E, 0x00],
//       'F': [0x7E, 0x40, 0x40, 0x7C, 0x40, 0x40, 0x40, 0x00],
//       'G': [0x3C, 0x42, 0x40, 0x4E, 0x42, 0x42, 0x3C, 0x00],
//       'H': [0x42, 0x42, 0x42, 0x7E, 0x42, 0x42, 0x42, 0x00],
//       'I': [0x3E, 0x08, 0x08, 0x08, 0x08, 0x08, 0x3E, 0x00],
//       'J': [0x02, 0x02, 0x02, 0x02, 0x42, 0x42, 0x3C, 0x00],
//       'K': [0x44, 0x48, 0x50, 0x60, 0x50, 0x48, 0x44, 0x00],
//       'L': [0x40, 0x40, 0x40, 0x40, 0x40, 0x40, 0x7E, 0x00],
//       'M': [0x42, 0x66, 0x5A, 0x42, 0x42, 0x42, 0x42, 0x00],
//       'N': [0x42, 0x62, 0x52, 0x4A, 0x46, 0x42, 0x42, 0x00],
//       'O': [0x3C, 0x42, 0x42, 0x42, 0x42, 0x42, 0x3C, 0x00],
//       'P': [0x7C, 0x42, 0x42, 0x7C, 0x40, 0x40, 0x40, 0x00],
//       'Q': [0x3C, 0x42, 0x42, 0x52, 0x4A, 0x44, 0x3A, 0x00],
//       'R': [0x7C, 0x42, 0x42, 0x7C, 0x50, 0x48, 0x44, 0x00],
//       'S': [0x3C, 0x42, 0x40, 0x3C, 0x02, 0x42, 0x3C, 0x00],
//       'T': [0x7F, 0x08, 0x08, 0x08, 0x08, 0x08, 0x08, 0x00],
//       'U': [0x42, 0x42, 0x42, 0x42, 0x42, 0x42, 0x3C, 0x00],
//       'V': [0x42, 0x42, 0x42, 0x42, 0x24, 0x24, 0x18, 0x00],
//       'W': [0x42, 0x42, 0x42, 0x42, 0x5A, 0x66, 0x42, 0x00],
//       'X': [0x42, 0x24, 0x18, 0x18, 0x24, 0x42, 0x42, 0x00],
//       'Y': [0x41, 0x22, 0x14, 0x08, 0x08, 0x08, 0x08, 0x00],
//       'Z': [0x7E, 0x04, 0x08, 0x10, 0x20, 0x40, 0x7E, 0x00],
//       '0': [0x3C, 0x46, 0x4A, 0x52, 0x62, 0x42, 0x3C, 0x00],
//       '1': [0x18, 0x28, 0x08, 0x08, 0x08, 0x08, 0x3E, 0x00],
//       '2': [0x3C, 0x42, 0x02, 0x3C, 0x40, 0x40, 0x7E, 0x00],
//       '3': [0x3C, 0x42, 0x02, 0x1C, 0x02, 0x42, 0x3C, 0x00],
//       '4': [0x08, 0x18, 0x28, 0x48, 0x7E, 0x08, 0x08, 0x00],
//       '5': [0x7E, 0x40, 0x7C, 0x02, 0x02, 0x42, 0x3C, 0x00],
//       '6': [0x3C, 0x40, 0x7C, 0x42, 0x42, 0x42, 0x3C, 0x00],
//       '7': [0x7E, 0x02, 0x04, 0x08, 0x10, 0x20, 0x20, 0x00],
//       '8': [0x3C, 0x42, 0x42, 0x3C, 0x42, 0x42, 0x3C, 0x00],
//       '9': [0x3C, 0x42, 0x42, 0x3E, 0x02, 0x02, 0x3C, 0x00],
//       '.': [0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x18, 0x00],
//       ':': [0x00, 0x18, 0x18, 0x00, 0x18, 0x18, 0x00, 0x00],
//       '-': [0x00, 0x00, 0x00, 0x3C, 0x00, 0x00, 0x00, 0x00],
//       '!': [0x08, 0x08, 0x08, 0x08, 0x08, 0x00, 0x08, 0x00],
//       '?': [0x3C, 0x42, 0x04, 0x08, 0x08, 0x00, 0x08, 0x00],
//       '(': [0x0C, 0x10, 0x20, 0x20, 0x20, 0x10, 0x0C, 0x00],
//       ')': [0x30, 0x08, 0x04, 0x04, 0x04, 0x08, 0x30, 0x00],
//       '/': [0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x00],
//       '=': [0x00, 0x00, 0x7E, 0x00, 0x7E, 0x00, 0x00, 0x00],
//       '%': [0x62, 0x64, 0x08, 0x10, 0x20, 0x4C, 0x8C, 0x00],
//       '₹': [0x7C, 0x42, 0x42, 0x7C, 0x50, 0x48, 0x44, 0x00],
//     };

//     const lines = [];
//     const chars = text.toUpperCase().split('');
//     const charWidth = 10; // Character width
//     const charSpacing = Math.max(spacing, 2); // Minimum 2 pixel spacing
    
//     console.log(`📝 Creating bitmap for: "${text}" with ${chars.length} chars, width=${charWidth}px, spacing=${charSpacing}px`);
    
//     // === CALCULATE CHARACTER LAYOUT ===
//     const availableWidth = this.actualPrintWidth - 20; // Leave margins
//     const totalCharWidth = charWidth + charSpacing;
//     const maxChars = Math.floor(availableWidth / totalCharWidth);
//     console.log(`📏 Available width: ${availableWidth}px, can fit ${maxChars} characters`);
    
//     // Truncate text if too long
//     const displayChars = chars.slice(0, maxChars);
    
//     // === RENDER CHARACTER BITMAP ===
//     // Create 8 rows of bitmap data (full character height)
//     for (let row = 0; row < 8; row++) {
//       const line = new Array(this.bytesPerLine).fill(0);
//       let currentPixel = 10; // Start with left margin
      
//       for (let charIndex = 0; charIndex < displayChars.length; charIndex++) {
//         const char = displayChars[charIndex];
//         const pattern = font[char] || font[' '];
//         const fontRow = pattern[row] || 0;
        
//         // Render character with bold effect
//         for (let bit = 0; bit < 8; bit++) {
//           if (currentPixel < this.printerWidth - 10) { // Right margin
//             const byteIndex = Math.floor(currentPixel / 8);
//             const bitIndex = 7 - (currentPixel % 8);
            
//             if (byteIndex < this.bytesPerLine) {
//               if (fontRow & (1 << (7 - bit))) {
//                 // Set main pixel
//                 line[byteIndex] |= (1 << bitIndex);
                
//                 // Add bold effect by setting adjacent pixels
//                 if (bitIndex > 0 && byteIndex < this.bytesPerLine) {
//                   line[byteIndex] |= (1 << (bitIndex - 1));
//                 }
//                 if (bit < 7 && currentPixel + 1 < this.printerWidth - 10) {
//                   const nextByteIndex = Math.floor((currentPixel + 1) / 8);
//                   const nextBitIndex = 7 - ((currentPixel + 1) % 8);
//                   if (nextByteIndex < this.bytesPerLine) {
//                     line[nextByteIndex] |= (1 << nextBitIndex);
//                   }
//                 }
//               }
//             }
//             currentPixel++;
//           }
//         }
        
//         // Add spacing between characters
//         currentPixel += charSpacing;
//       }
      
//       lines.push(line);
//     }
    
//     // === ADD LINE SPACING ===
//     if (addLineSpacing) {
//       const blankLine = new Array(this.bytesPerLine).fill(0);
//       lines.push(blankLine); // Add blank line for spacing
//       lines.push(blankLine); // Add second blank line for better spacing
//       lines.push(blankLine);
//       lines.push(blankLine); // Add blank line for spacing
//       lines.push(blankLine); // Add second blank line for better spacing
//       lines.push(blankLine); // Add third blank line for proper spacing
//     }
    
//     return lines;
//   }

//   // ===============================================
//   // RECEIPT FORMATTING HELPER FUNCTIONS
//   // ===============================================

//   // Helper function to print centered text with exact spacing
//   async printCenteredText(text, charSpacing = 1) {
//     console.log(`📝 Printing centered text: "${text}"`);
    
//     // For exact receipt format: 36 character width
//     const maxChars = 36;
//     const paddingChars = Math.max(0, Math.floor((maxChars - text.length) / 2));
//     const centeredText = ' '.repeat(paddingChars) + text;
    
//     const textLines = this.textToBitmap(centeredText, charSpacing, true);
//     for (const line of textLines) {
//       await this.printBitmapLine(line);
//     }
//     await this.feedPaper(2); // Consistent spacing
//   }

//   // Helper function to print left-right aligned text with exact spacing
//   async printLeftRightText(leftText, rightText, charSpacing = 1) {
//     console.log(`📝 Printing aligned: "${leftText}" | "${rightText}"`);
    
//     // For exact receipt format: 36 characters total width
//     const maxWidth = 36;
//     const totalContentLength = leftText.length + rightText.length;
    
//     if (totalContentLength >= maxWidth) {
//       // If too long, truncate left text and keep right text
//       const availableLeftSpace = maxWidth - rightText.length - 1; // Single space minimum
//       const truncatedLeft = leftText.substring(0, Math.max(1, availableLeftSpace));
//       const spacesNeeded = maxWidth - truncatedLeft.length - rightText.length;
//       const alignedText = truncatedLeft + ' '.repeat(Math.max(1, spacesNeeded)) + rightText;
      
//       console.log(`Long text - Left: "${truncatedLeft}" Spaces: ${spacesNeeded} Right: "${rightText}"`);
//       console.log(`Final aligned text: "${alignedText}" (Length: ${alignedText.length})`);
      
//       const textLines = this.textToBitmap(alignedText, charSpacing, true);
//       for (const line of textLines) {
//         await this.printBitmapLine(line);
//       }
//     } else {
//       // Normal case: add spaces to push right text to the right
//       const spacesNeeded = maxWidth - totalContentLength;
//       const alignedText = leftText + ' '.repeat(spacesNeeded) + rightText;
      
//       console.log(`Normal text - Left: "${leftText}" Spaces: ${spacesNeeded} Right: "${rightText}"`);
//       console.log(`Final aligned text: "${alignedText}" (Length: ${alignedText.length})`);
      
//       const textLines = this.textToBitmap(alignedText, charSpacing, true);
//       for (const line of textLines) {
//         await this.printBitmapLine(line);
//       }
//     }
    
//     await this.feedPaper(2); // Better spacing between items
//   }

//   // Print separator line with proper spacing to prevent touching text
//   async printSeparatorLine() {
//     console.log('📏 Printing separator line with proper spacing');
    
//     // Add space before separator
//     await this.feedPaper(2);
    
//     // Create separator matching the text width (36 chars)
//     const separatorLine = new Array(this.bytesPerLine).fill(0);
    
//     // Fill the usable area (36 chars = ~36*8 = 288 pixels)
//     for (let i = 2; i < 38; i++) { // Start at byte 2, end before byte 38
//       separatorLine[i] = 0xFF;
//     }
    
//     await this.printBitmapLine(separatorLine);
    
//     // Add space after separator to prevent touching text below
//     await this.feedPaper(-1);
//   }

//   // Print simple text line with exact spacing
//   async printSimpleText(text, charSpacing = 1) {
//     console.log(`📝 Printing simple text: "${text}"`);
//     const textLines = this.textToBitmap(text, charSpacing, true);
//     for (const line of textLines) {
//       await this.printBitmapLine(line);
//     }
//     await this.feedPaper(3); // Better spacing
//   }

//   // ===============================================
//   // SPECIALIZED RECEIPT ITEM FUNCTIONS
//   // ===============================================

//   // Helper function to print item with exact receipt format
//   async printItemLine(itemName, quantity, price, unitPrice) {
//     console.log(`📝 Printing item: "${itemName}" qty: ${quantity} price: "Rs.${price}"`);
    
//     const maxWidth = 36;
//     const maxNameLength = 24; // Allow space for price alignment
    
//     // === PRODUCT NAME LINE ===
//     const truncatedName = itemName.length > maxNameLength ? 
//       itemName.substring(0, maxNameLength) + '...' : itemName;
    
//     // Line 1: Product name and total price (right aligned)
//     const priceText = `Rs.${price}`;
//     const spacesNeeded = maxWidth - truncatedName.length - priceText.length;
//     const line1 = truncatedName + ' '.repeat(Math.max(1, spacesNeeded)) + priceText;
    
//     console.log(`Item line 1: "${line1}" (Length: ${line1.length})`);
    
//     const textLines1 = this.textToBitmap(line1, 1, false);
//     for (const line of textLines1) {
//       await this.printBitmapLine(line);
//     }
    
//     // === QUANTITY AND UNIT PRICE LINE ===
//     const qtyText = `Qty: ${quantity}`;
//     const unitPriceText = `@ Rs.${unitPrice} each`;
//     const spacesNeeded2 = maxWidth - qtyText.length - unitPriceText.length;
//     const line2 = qtyText + ' '.repeat(Math.max(1, spacesNeeded2)) + unitPriceText;
    
//     console.log(`Item line 2: "${line2}" (Length: ${line2.length})`);
    
//     const textLines2 = this.textToBitmap(line2, 1, true);
//     for (const line of textLines2) {
//       await this.printBitmapLine(line);
//     }
    
//     await this.feedPaper(3); // More space between items
//   }

//   // Helper function to print totals with exact right alignment
//   async printTotalLine(leftText, rightText, isBold = false) {
//     console.log(`📝 Printing total: "${leftText}" | "${rightText}"`);
    
//     const maxWidth = 36;
//     const spacesNeeded = maxWidth - leftText.length - rightText.length;
//     const alignedText = leftText + ' '.repeat(Math.max(1, spacesNeeded)) + rightText;
    
//     console.log(`Total line: "${alignedText}" (Length: ${alignedText.length})`);
    
//     if (isBold) {
//       await this.printBoldText(leftText, rightText);
//     } else {
//       const textLines = this.textToBitmap(alignedText, 1, true);
//       for (const line of textLines) {
//         await this.printBitmapLine(line);
//       }
//       await this.feedPaper(2);
//     }
//   }

//   // Helper function to print bold/highlighted text for TOTAL
//   async printBoldText(leftText, rightText) {
//     console.log(`📝 Printing BOLD text: "${leftText}" | "${rightText}"`);
    
//     const maxWidth = 36;
//     const totalContentLength = leftText.length + rightText.length;
    
//     if (totalContentLength >= maxWidth) {
//       const availableLeftSpace = maxWidth - rightText.length - 1;
//       const truncatedLeft = leftText.substring(0, Math.max(1, availableLeftSpace));
//       const spacesNeeded = maxWidth - truncatedLeft.length - rightText.length;
//       const alignedText = truncatedLeft + ' '.repeat(Math.max(1, spacesNeeded)) + rightText;
      
//       const textLines = this.textToBitmap(alignedText, 3, false);
//       for (const line of textLines) {
//         await this.printBitmapLine(line);
//       }
//     } else {
//       const spacesNeeded = maxWidth - totalContentLength;
//       const alignedText = leftText + ' '.repeat(spacesNeeded) + rightText;
      
//       const textLines = this.textToBitmap(alignedText, 3, false);
//       for (const line of textLines) {
//         await this.printBitmapLine(line);
//       }
//     }
    
//     await this.feedPaper(3);
//   }
// }

// // Export singleton instance
// const catPrinter = new CatPrinter();
// export default catPrinter;





// Cat Printer Utility for Bluetooth Kitty/Cat Printers
// Based on working implementations from NaitLee/kitty-printer and other cat printer projects
// Uses the correct cat printer protocol with proper packet structure and CRC calculation

class CatPrinter {
  constructor() {
    this.device = null;
    this.characteristic = null;
    this.isConnected = false;
    this.printerWidth = 576; // 58mm thermal printer (576 pixels = 72 bytes)
    this.bytesPerLine = 72;  // 576 pixels / 8 bits = 72 bytes
    this.actualPrintWidth = 560; // Usable width (leaving small margins)
  }

  // ===============================================
  // LOOKUP TABLES AND CONSTANTS
  // ===============================================

  // CRC8 calculation table for cat printer protocol
  static CRC_TABLE = [
    0x00, 0x07, 0x0e, 0x09, 0x1c, 0x1b, 0x12, 0x15, 0x38, 0x3f, 0x36, 0x31, 0x24, 0x23, 0x2a, 0x2d,
    0x70, 0x77, 0x7e, 0x79, 0x6c, 0x6b, 0x62, 0x65, 0x48, 0x4f, 0x46, 0x41, 0x54, 0x53, 0x5a, 0x5d,
    0xe0, 0xe7, 0xee, 0xe9, 0xfc, 0xfb, 0xf2, 0xf5, 0xd8, 0xdf, 0xd6, 0xd1, 0xc4, 0xc3, 0xca, 0xcd,
    0x90, 0x97, 0x9e, 0x99, 0x8c, 0x8b, 0x82, 0x85, 0xa8, 0xaf, 0xa6, 0xa1, 0xb4, 0xb3, 0xba, 0xbd,
    0xc7, 0xc0, 0xc9, 0xce, 0xdb, 0xdc, 0xd5, 0xd2, 0xff, 0xf8, 0xf1, 0xf6, 0xe3, 0xe4, 0xed, 0xea,
    0xb7, 0xb0, 0xb9, 0xbe, 0xab, 0xac, 0xa5, 0xa2, 0x8f, 0x88, 0x81, 0x86, 0x93, 0x94, 0x9d, 0x9a,
    0x27, 0x20, 0x29, 0x2e, 0x3b, 0x3c, 0x35, 0x32, 0x1f, 0x18, 0x11, 0x16, 0x03, 0x04, 0x0d, 0x0a,
    0x57, 0x50, 0x59, 0x5e, 0x4b, 0x4c, 0x45, 0x42, 0x6f, 0x68, 0x61, 0x66, 0x73, 0x74, 0x7d, 0x7a,
    0x89, 0x8e, 0x87, 0x80, 0x95, 0x92, 0x9b, 0x9c, 0xb1, 0xb6, 0xbf, 0xb8, 0xad, 0xaa, 0xa3, 0xa4,
    0xf9, 0xfe, 0xf7, 0xf0, 0xe5, 0xe2, 0xeb, 0xec, 0xc1, 0xc6, 0xcf, 0xc8, 0xdd, 0xda, 0xd3, 0xd4,
    0x69, 0x6e, 0x67, 0x60, 0x75, 0x72, 0x7b, 0x7c, 0x51, 0x56, 0x5f, 0x58, 0x4d, 0x4a, 0x43, 0x44,
    0x19, 0x1e, 0x17, 0x10, 0x05, 0x02, 0x0b, 0x0c, 0x21, 0x26, 0x2f, 0x28, 0x3d, 0x3a, 0x33, 0x34,
    0x4e, 0x49, 0x40, 0x47, 0x52, 0x55, 0x5c, 0x5b, 0x76, 0x71, 0x78, 0x7f, 0x6a, 0x6d, 0x64, 0x63,
    0x3e, 0x39, 0x30, 0x37, 0x22, 0x25, 0x2c, 0x2b, 0x06, 0x01, 0x08, 0x0f, 0x1a, 0x1d, 0x14, 0x13,
    0xae, 0xa9, 0xa0, 0xa7, 0xb2, 0xb5, 0xbc, 0xbb, 0x96, 0x91, 0x98, 0x9f, 0x8a, 0x8d, 0x84, 0x83,
    0xde, 0xd9, 0xd0, 0xd7, 0xc2, 0xc5, 0xcc, 0xcb, 0xe6, 0xe1, 0xe8, 0xef, 0xfa, 0xfd, 0xf4, 0xf3
  ];

  // Bit mirroring table for cat printer bitmap format
  static MIRROR_TABLE = [
    0x00, 0x80, 0x40, 0xC0, 0x20, 0xA0, 0x60, 0xE0, 0x10, 0x90, 0x50, 0xD0, 0x30, 0xB0, 0x70, 0xF0,
    0x08, 0x88, 0x48, 0xC8, 0x28, 0xA8, 0x68, 0xE8, 0x18, 0x98, 0x58, 0xD8, 0x38, 0xB8, 0x78, 0xF8,
    0x04, 0x84, 0x44, 0xC4, 0x24, 0xA4, 0x64, 0xE4, 0x14, 0x94, 0x54, 0xD4, 0x34, 0xB4, 0x74, 0xF4,
    0x0C, 0x8C, 0x4C, 0xCC, 0x2C, 0xAC, 0x6C, 0xEC, 0x1C, 0x9C, 0x5C, 0xDC, 0x3C, 0xBC, 0x7C, 0xFC,
    0x02, 0x82, 0x42, 0xC2, 0x22, 0xA2, 0x62, 0xE2, 0x12, 0x92, 0x52, 0xD2, 0x32, 0xB2, 0x72, 0xF2,
    0x0A, 0x8A, 0x4A, 0xCA, 0x2A, 0xAA, 0x6A, 0xEA, 0x1A, 0x9A, 0x5A, 0xDA, 0x3A, 0xBA, 0x7A, 0xFA,
    0x06, 0x86, 0x46, 0xC6, 0x26, 0xA6, 0x66, 0xE6, 0x16, 0x96, 0x56, 0xD6, 0x36, 0xB6, 0x76, 0xF6,
    0x0E, 0x8E, 0x4E, 0xCE, 0x2E, 0xAE, 0x6E, 0xEE, 0x1E, 0x9E, 0x5E, 0xDE, 0x3E, 0xBE, 0x7E, 0xFE,
    0x01, 0x81, 0x41, 0xC1, 0x21, 0xA1, 0x61, 0xE1, 0x11, 0x91, 0x51, 0xD1, 0x31, 0xB1, 0x71, 0xF1,
    0x09, 0x89, 0x49, 0xC9, 0x29, 0xA9, 0x69, 0xE9, 0x19, 0x99, 0x59, 0xD9, 0x39, 0xB9, 0x79, 0xF9,
    0x05, 0x85, 0x45, 0xC5, 0x25, 0xA5, 0x65, 0xE5, 0x15, 0x95, 0x55, 0xD5, 0x35, 0xB5, 0x75, 0xF5,
    0x0D, 0x8D, 0x4D, 0xCD, 0x2D, 0xAD, 0x6D, 0xED, 0x1D, 0x9D, 0x5D, 0xDD, 0x3D, 0xBD, 0x7D, 0xFD,
    0x03, 0x83, 0x43, 0xC3, 0x23, 0xA3, 0x63, 0xE3, 0x13, 0x93, 0x53, 0xD3, 0x33, 0xB3, 0x73, 0xF3,
    0x0B, 0x8B, 0x4B, 0xCB, 0x2B, 0xAB, 0x6B, 0xEB, 0x1B, 0x9B, 0x5B, 0xDB, 0x3B, 0xBB, 0x7B, 0xFB,
    0x07, 0x87, 0x47, 0xC7, 0x27, 0xA7, 0x67, 0xE7, 0x17, 0x97, 0x57, 0xD7, 0x37, 0xB7, 0x77, 0xF7,
    0x0F, 0x8F, 0x4F, 0xCF, 0x2F, 0xAF, 0x6F, 0xEF, 0x1F, 0x9F, 0x5F, 0xDF, 0x3F, 0xBF, 0x7F, 0xFF
  ];

  // ===============================================
  // CORE COMMUNICATION FUNCTIONS
  // ===============================================

  // Calculate CRC8 checksum for data integrity
  calculateCRC8(data) {
    let crc = 0;
    for (const byte of data) {
      crc = CatPrinter.CRC_TABLE[crc ^ byte];
    }
    return crc;
  }

  // Connect to Bluetooth cat printer
  async connect() {
    try {
      console.log('🐱 Connecting to cat printer...');
      
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          "0000ae30-0000-1000-8000-00805f9b34fb", // Cat printer service
          "000018f0-0000-1000-8000-00805f9b34fb"  // Alternative service
        ]
      });

      console.log('📱 Device found:', this.device.name);
      const server = await this.device.gatt.connect();
      
      // Try primary cat printer service first
      let service;
      try {
        service = await server.getPrimaryService("0000ae30-0000-1000-8000-00805f9b34fb");
        this.characteristic = await service.getCharacteristic("0000ae01-0000-1000-8000-00805f9b34fb");
        console.log('✅ Connected using primary service');
      } catch (error) {
        console.log('Primary service failed, trying alternative...');
        // Fallback to alternative service
        service = await server.getPrimaryService("000018f0-0000-1000-8000-00805f9b34fb");
        this.characteristic = await service.getCharacteristic("00002af1-0000-1000-8000-00805f9b34fb");
        console.log('✅ Connected using alternative service');
      }

      this.isConnected = true;
      console.log('✅ Cat printer connected successfully!');
      
      return true;
    } catch (error) {
      console.error('❌ Connection failed:', error);
      this.isConnected = false;
      throw new Error(`Failed to connect to cat printer: ${error.message}`);
    }
  }

  // Send packet to cat printer with reduced delays
  async sendPacket(command, data = []) {
    if (!this.isConnected || !this.characteristic) {
      throw new Error('Cat printer not connected');
    }

    // Cat printer packet structure: [0x51, 0x78, command, type, len_low, len_high, ...data, crc, 0xFF]
    const packet = [
      0x51, 0x78,           // Header magic bytes
      command,              // Command byte
      0x00,                 // Type (0 = data transfer)
      data.length & 0xFF,   // Length low byte
      (data.length >> 8) & 0xFF, // Length high byte
      ...data,              // Data payload
      this.calculateCRC8(data), // CRC8 checksum
      0xFF                  // End marker
    ];

    try {
      console.log(`📤 Sending command 0x${command.toString(16).padStart(2, '0')} with ${data.length} bytes`);
      await this.characteristic.writeValue(new Uint8Array(packet));
      await this.delay(50); // Reduced delay for faster printing
    } catch (error) {
      console.error('Failed to send packet:', error);
      throw error;
    }
  }

  // Utility delay function - reduced for faster printing
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ===============================================
  // PRINTER INITIALIZATION AND CONTROL
  // ===============================================

  // Initialize printer with faster settings
  async initialize() {
    console.log('🔧 Initializing cat printer for fast 58mm printing...');
    
    try {
      // === RESET PRINTER ===
      await this.sendPacket(0xA3, [0x00]); // Reset/Initialize
      await this.delay(500); // Reduced delay

      // === SET PAPER WIDTH ===
      await this.sendPacket(0xA4, [0x40, 0x02]); // Set paper width (576 pixels)
      await this.delay(150); // Reduced delay
      await this.sendPacket(0xA4, [0x48, 0x00]); // Alternative width command
      await this.delay(150); // Reduced delay

      // === CONFIGURE PRINT DENSITY ===
      await this.sendPacket(0xAF, [0xFF, 0xFF]); // Maximum energy/density (both bytes max)
      await this.delay(150); // Reduced delay
      
      // Additional energy commands
      await this.sendPacket(0xBE, [0xFF]); // Print density
      await this.delay(100); // Reduced delay
      
      await this.sendPacket(0xA5, [0xFF]); // Maximum darkness
      await this.delay(100); // Reduced delay

      // === SET PRINT SPEED ===
      await this.sendPacket(0xBD, [0x02]); // Faster print speed (was 0x00)
      await this.delay(100); // Reduced delay

      // === SET HEATING TIME ===
      await this.sendPacket(0xBC, [0xFF, 0xFF]); // Maximum heating time
      await this.delay(100); // Reduced delay

      console.log('✅ Cat printer initialized with FAST settings for 58mm paper');
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      throw error;
    }
  }

  // ===============================================
  // PRINT JOB CONTROL
  // ===============================================

  // Start print job with more initial feed to prevent top cutoff
  async startPrintJob() {
    console.log('📋 Starting print job with generous initial feed...');
    await this.sendPacket(0xA6, [0xAA, 0x55, 0x17, 0x38, 0x44, 0x5F, 0x5F, 0x5F, 0x44, 0x38, 0x2C]);
    await this.delay(100);
    // Add generous initial paper feed to prevent top text cutoff
    await this.feedPaper(3);
  }

  // End print job with maximum paper feed
  async endPrintJob() {
    console.log('📋 Ending print job with maximum cutting feed...');
    await this.sendPacket(0xA6, [0xAA, 0x55, 0x17, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x17]);
    await this.delay(100);
    // Add maximum paper feed for cutting
    await this.feedPaper(30); // Increased to 30 lines with better feed amount calculation
    
    // Additional feed commands to ensure enough paper
    await this.sendPacket(0xA1, [255, 0x00]); // Maximum single feed
    await this.delay(200);
    await this.sendPacket(0xA1, [255, 0x00]); // Another maximum feed
    await this.delay(200);
  }

  // ===============================================
  // PAPER FEED AND MOVEMENT
  // ===============================================

  // Feed paper with proper command and increased amount
  async feedPaper(lines = 1) {
    console.log(`📄 Feeding ${lines} lines...`);
    // Increase the feed amount significantly and ensure it's visible
    const feedAmount = Math.min(lines * 24, 255); // Increased multiplier from 16 to 24
    await this.sendPacket(0xA1, [feedAmount, 0x00]);
    await this.delay(150); // Increased delay to ensure feed completes
  }

  // ===============================================
  // BITMAP PRINTING
  // ===============================================

  // Print bitmap line with reduced delay
  async printBitmapLine(lineData) {
    if (lineData.length !== this.bytesPerLine) { // 58mm printers expect 72 bytes per line (576 pixels / 8)
      throw new Error(`Line data must be exactly ${this.bytesPerLine} bytes (${this.printerWidth} pixels)`);
    }
    
    // Mirror the bits for proper cat printer format
    const mirroredData = lineData.map(byte => CatPrinter.MIRROR_TABLE[byte]);
    
    console.log(`🖨️ Printing bitmap line (${mirroredData.length} bytes)`);
    await this.sendPacket(0xA2, mirroredData);
    await this.delay(25); // Reduced delay for faster printing
  }

  // ===============================================
  // TEST PATTERNS AND DIAGNOSTICS
  // ===============================================

  // Create full-width test pattern
  createTestPattern() {
    const lines = [];
    
    // Create 10 lines of different patterns to test full width
    for (let lineNum = 0; lineNum < 10; lineNum++) {
      const line = new Array(this.bytesPerLine).fill(0);
      
      if (lineNum === 0 || lineNum === 9) {
        // Full solid lines at top and bottom
        line.fill(0xFF);
      } else if (lineNum % 3 === 1) {
        // Alternating pattern
        for (let i = 0; i < this.bytesPerLine; i++) {
          line[i] = i % 2 === 0 ? 0xFF : 0x00;
        }
      } else if (lineNum % 3 === 2) {
        // Dotted pattern
        for (let i = 0; i < this.bytesPerLine; i++) {
          line[i] = 0xAA; // 10101010 pattern
        }
      } else {
        // Quarter-width sections
        const quarterWidth = Math.floor(this.bytesPerLine / 4);
        for (let i = 0; i < quarterWidth; i++) {
          line[i] = 0xFF; // Left quarter
          line[this.bytesPerLine - 1 - i] = 0xFF; // Right quarter
        }
      }
      
      lines.push(line);
    }
    
    return lines;
  }

  // ===============================================
  // MAIN RECEIPT PRINTING FUNCTIONS
  // ===============================================

  // Print complete receipt with exact format matching the sample
  async printReceipt(receiptData) {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      console.log('🖨️ Starting receipt with proper spacing and separators...');
      
      // === PRINTER INITIALIZATION ===
      await this.initialize();
      await this.startPrintJob();

      // === HEADER SECTION ===
      await this.printCenteredText(receiptData.businessName, 1);
      await this.printCenteredText(`GST: ${receiptData.gst}`, 1);
      
      const now = new Date();
      const dateTime = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
      await this.printCenteredText(dateTime, 1);

      // 1st SEPARATOR: Between header and items
      await this.printSeparatorLine();
      await this.feedPaper(2); // Additional space after separator

      // === ITEMS SECTION ===
      console.log('📋 Printing items with proper spacing...');
      for (const item of receiptData.items || []) {
        const itemTotal = (item.price * item.quantity).toFixed(2);
        const unitPrice = item.price.toFixed(2);
        await this.printItemLine(item.name, item.quantity, itemTotal, unitPrice);
      }

      // 2nd SEPARATOR: Between items and subtotal
      await this.printSeparatorLine();
      await this.feedPaper(2); // Additional space after separator

      // === TOTALS SECTION ===
      console.log('💰 Printing totals with proper alignment...');
      await this.printTotalLine('Subtotal:', `Rs.${receiptData.subtotal.toFixed(2)}`);
      await this.printTotalLine('CGST (2.5%):', `Rs.${receiptData.cgst.toFixed(2)}`);
      await this.printTotalLine('SGST (2.5%):', `Rs.${receiptData.sgst.toFixed(2)}`);

      // 3rd SEPARATOR: Between subtotal and total
      await this.printSeparatorLine();
      await this.feedPaper(2); // Additional space after separator

      // === HIGHLIGHTED TOTAL ===
      await this.printTotalLine('TOTAL:', `Rs.${receiptData.total.toFixed(2)}`, true);
      
      // 4th SEPARATOR: At the end of total
      await this.printSeparatorLine();
      await this.feedPaper(3); // Additional space after final separator
      
      // === FINALIZE PRINT JOB ===
      await this.endPrintJob();
      
      console.log('✅ Receipt completed with proper spacing and separators!');
      
    } catch (error) {
      console.error('❌ Cat printer receipt failed:', error);
      throw error;
    }
  }

  // ===============================================
  // TESTING AND DIAGNOSTICS FUNCTIONS
  // ===============================================

  // Test print with 58mm paper examples
  async testPrint() {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      console.log('🧪 Testing improved receipt readability...');
      
      // === INITIALIZE TEST PRINT ===
      await this.initialize();
      await this.startPrintJob();
      
      // === WIDTH TEST RULERS ===
      await this.printSimpleText('012345678901234567890123456789012345', 1);
      await this.printSimpleText('         1         2         3   ', 1);
      
      // === HEADER SECTION TEST ===
      await this.printCenteredText('Aushadhapoorna', 2);
      await this.printCenteredText('Medical Complex, Health Street', 1);
      await this.printCenteredText('GST: 29ABCDE1234F1Z5', 1);
      await this.printCenteredText('12/20/2024 3:45:30 PM', 1);
      
      // Extra spacing after header
      await this.feedPaper(2);
      await this.printSeparatorLine();
      
      // === ITEMS SECTION TEST ===
      await this.printLeftRightText('PARACETAMOL 500MG x1', '₹25.00', 1);
      await this.printLeftRightText('VITAMIN D3 x1', '₹120.00', 1);
      await this.printLeftRightText('CROCIN TABLET x2', '₹50.00', 1);
      await this.printLeftRightText('HAND SANITIZER x1', '₹55.00', 1);
      
      // Extra spacing before totals
      await this.feedPaper(2);
      await this.printSeparatorLine();
      
      // === TOTALS SECTION TEST ===
      await this.printLeftRightText('Subtotal:', '₹250.00', 1);
      await this.printLeftRightText('CGST (2.5%):', '₹6.25', 1);
      await this.printLeftRightText('SGST (2.5%):', '₹6.25', 1);
      
      // === HIGHLIGHTED TOTAL TEST ===
      await this.feedPaper(1);
      await this.printSeparatorLine();
      await this.printBoldText('TOTAL:', '₹263.00');
      await this.printSeparatorLine();
      
      // === FOOTER TEST ===
      await this.feedPaper(4);
      await this.printCenteredText('THANK YOU!', 3);

      // === FINALIZE TEST PRINT ===
      await this.endPrintJob();
      
      console.log('✅ Test completed with improved readability!');
      
    } catch (error) {
      console.error('❌ Cat printer test failed:', error);
      throw error;
    }
  }

  // ===============================================
  // CONNECTION MANAGEMENT
  // ===============================================

  // Disconnect from printer
  disconnect() {
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.isConnected = false;
    this.device = null;
    this.characteristic = null;
    console.log('🔌 Cat printer disconnected');
  }

  // ===============================================
  // TEXT RENDERING AND FONT SYSTEM
  // ===============================================

  // Convert text to bitmap with more line spacing
  textToBitmap(text, spacing = 2, addLineSpacing = true) {
    const font = {
      ' ': [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
      'A': [0x18, 0x24, 0x42, 0x42, 0x7E, 0x42, 0x42, 0x00],
      'B': [0x7C, 0x42, 0x42, 0x7C, 0x42, 0x42, 0x7C, 0x00],
      'C': [0x3C, 0x42, 0x40, 0x40, 0x40, 0x42, 0x3C, 0x00],
      'D': [0x78, 0x44, 0x42, 0x42, 0x42, 0x44, 0x78, 0x00],
      'E': [0x7E, 0x40, 0x40, 0x7C, 0x40, 0x40, 0x7E, 0x00],
      'F': [0x7E, 0x40, 0x40, 0x7C, 0x40, 0x40, 0x40, 0x00],
      'G': [0x3C, 0x42, 0x40, 0x4E, 0x42, 0x42, 0x3C, 0x00],
      'H': [0x42, 0x42, 0x42, 0x7E, 0x42, 0x42, 0x42, 0x00],
      'I': [0x3E, 0x08, 0x08, 0x08, 0x08, 0x08, 0x3E, 0x00],
      'J': [0x02, 0x02, 0x02, 0x02, 0x42, 0x42, 0x3C, 0x00],
      'K': [0x44, 0x48, 0x50, 0x60, 0x50, 0x48, 0x44, 0x00],
      'L': [0x40, 0x40, 0x40, 0x40, 0x40, 0x40, 0x7E, 0x00],
      'M': [0x42, 0x66, 0x5A, 0x42, 0x42, 0x42, 0x42, 0x00],
      'N': [0x42, 0x62, 0x52, 0x4A, 0x46, 0x42, 0x42, 0x00],
      'O': [0x3C, 0x42, 0x42, 0x42, 0x42, 0x42, 0x3C, 0x00],
      'P': [0x7C, 0x42, 0x42, 0x7C, 0x40, 0x40, 0x40, 0x00],
      'Q': [0x3C, 0x42, 0x42, 0x52, 0x4A, 0x44, 0x3A, 0x00],
      'R': [0x7C, 0x42, 0x42, 0x7C, 0x50, 0x48, 0x44, 0x00],
      'S': [0x3C, 0x42, 0x40, 0x3C, 0x02, 0x42, 0x3C, 0x00],
      'T': [0x7F, 0x08, 0x08, 0x08, 0x08, 0x08, 0x08, 0x00],
      'U': [0x42, 0x42, 0x42, 0x42, 0x42, 0x42, 0x3C, 0x00],
      'V': [0x42, 0x42, 0x42, 0x42, 0x24, 0x24, 0x18, 0x00],
      'W': [0x42, 0x42, 0x42, 0x42, 0x5A, 0x66, 0x42, 0x00],
      'X': [0x42, 0x24, 0x18, 0x18, 0x24, 0x42, 0x42, 0x00],
      'Y': [0x41, 0x22, 0x14, 0x08, 0x08, 0x08, 0x08, 0x00],
      'Z': [0x7E, 0x04, 0x08, 0x10, 0x20, 0x40, 0x7E, 0x00],
      '0': [0x3C, 0x46, 0x4A, 0x52, 0x62, 0x42, 0x3C, 0x00],
      '1': [0x18, 0x28, 0x08, 0x08, 0x08, 0x08, 0x3E, 0x00],
      '2': [0x3C, 0x42, 0x02, 0x3C, 0x40, 0x40, 0x7E, 0x00],
      '3': [0x3C, 0x42, 0x02, 0x1C, 0x02, 0x42, 0x3C, 0x00],
      '4': [0x08, 0x18, 0x28, 0x48, 0x7E, 0x08, 0x08, 0x00],
      '5': [0x7E, 0x40, 0x7C, 0x02, 0x02, 0x42, 0x3C, 0x00],
      '6': [0x3C, 0x40, 0x7C, 0x42, 0x42, 0x42, 0x3C, 0x00],
      '7': [0x7E, 0x02, 0x04, 0x08, 0x10, 0x20, 0x20, 0x00],
      '8': [0x3C, 0x42, 0x42, 0x3C, 0x42, 0x42, 0x3C, 0x00],
      '9': [0x3C, 0x42, 0x42, 0x3E, 0x02, 0x02, 0x3C, 0x00],
      '.': [0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x18, 0x00],
      ':': [0x00, 0x18, 0x18, 0x00, 0x18, 0x18, 0x00, 0x00],
      '-': [0x00, 0x00, 0x00, 0x3C, 0x00, 0x00, 0x00, 0x00],
      '!': [0x08, 0x08, 0x08, 0x08, 0x08, 0x00, 0x08, 0x00],
      '?': [0x3C, 0x42, 0x04, 0x08, 0x08, 0x00, 0x08, 0x00],
      '(': [0x0C, 0x10, 0x20, 0x20, 0x20, 0x10, 0x0C, 0x00],
      ')': [0x30, 0x08, 0x04, 0x04, 0x04, 0x08, 0x30, 0x00],
      '/': [0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x00],
      '=': [0x00, 0x00, 0x7E, 0x00, 0x7E, 0x00, 0x00, 0x00],
      '%': [0x62, 0x64, 0x08, 0x10, 0x20, 0x4C, 0x8C, 0x00],
      '₹': [0x7C, 0x42, 0x42, 0x7C, 0x50, 0x48, 0x44, 0x00],
    };

    const lines = [];
    const chars = text.toUpperCase().split('');
    const charWidth = 10; // Character width
    const charSpacing = Math.max(spacing, 2); // Minimum 2 pixel spacing
    
    console.log(`📝 Creating bitmap for: "${text}" with ${chars.length} chars, width=${charWidth}px, spacing=${charSpacing}px`);
    
    // === CALCULATE CHARACTER LAYOUT ===
    const availableWidth = this.actualPrintWidth - 20; // Leave margins
    const totalCharWidth = charWidth + charSpacing;
    const maxChars = Math.floor(availableWidth / totalCharWidth);
    console.log(`📏 Available width: ${availableWidth}px, can fit ${maxChars} characters`);
    
    // Truncate text if too long
    const displayChars = chars.slice(0, maxChars);
    
    // === RENDER CHARACTER BITMAP ===
    // Create 8 rows of bitmap data (full character height)
    for (let row = 0; row < 8; row++) {
      const line = new Array(this.bytesPerLine).fill(0);
      let currentPixel = 10; // Start with left margin
      
      for (let charIndex = 0; charIndex < displayChars.length; charIndex++) {
        const char = displayChars[charIndex];
        const pattern = font[char] || font[' '];
        const fontRow = pattern[row] || 0;
        
        // Render character with bold effect
        for (let bit = 0; bit < 8; bit++) {
          if (currentPixel < this.printerWidth - 10) { // Right margin
            const byteIndex = Math.floor(currentPixel / 8);
            const bitIndex = 7 - (currentPixel % 8);
            
            if (byteIndex < this.bytesPerLine) {
              if (fontRow & (1 << (7 - bit))) {
                // Set main pixel
                line[byteIndex] |= (1 << bitIndex);
                
                // Add bold effect by setting adjacent pixels
                if (bitIndex > 0 && byteIndex < this.bytesPerLine) {
                  line[byteIndex] |= (1 << (bitIndex - 1));
                }
                if (bit < 7 && currentPixel + 1 < this.printerWidth - 10) {
                  const nextByteIndex = Math.floor((currentPixel + 1) / 8);
                  const nextBitIndex = 7 - ((currentPixel + 1) % 8);
                  if (nextByteIndex < this.bytesPerLine) {
                    line[nextByteIndex] |= (1 << nextBitIndex);
                  }
                }
              }
            }
            currentPixel++;
          }
        }
        
        // Add spacing between characters
        currentPixel += charSpacing;
      }
      
      lines.push(line);
    }
    
    // === ADD LINE SPACING ===
    if (addLineSpacing) {
      const blankLine = new Array(this.bytesPerLine).fill(0);
      lines.push(blankLine); // Add blank line for spacing
      lines.push(blankLine); // Add second blank line for better spacing
      lines.push(blankLine);
      lines.push(blankLine); // Add blank line for spacing
      lines.push(blankLine); // Add second blank line for better spacing
      lines.push(blankLine); // Add third blank line for proper spacing
    }
    
    return lines;
  }

  // ===============================================
  // RECEIPT FORMATTING HELPER FUNCTIONS
  // ===============================================

  // Helper function to print centered text with exact spacing
  async printCenteredText(text, charSpacing = 1) {
    console.log(`📝 Printing centered text: "${text}"`);
    
    // For exact receipt format: 36 character width
    const maxChars = 36;
    const paddingChars = Math.max(0, Math.floor((maxChars - text.length) / 2));
    const centeredText = ' '.repeat(paddingChars) + text;
    
    const textLines = this.textToBitmap(centeredText, charSpacing, true);
    for (const line of textLines) {
      await this.printBitmapLine(line);
    }
    await this.feedPaper(2); // Consistent spacing
  }

  // Helper function to print left-right aligned text with exact spacing
  async printLeftRightText(leftText, rightText, charSpacing = 1) {
    console.log(`📝 Printing aligned: "${leftText}" | "${rightText}"`);
    
    // For exact receipt format: 36 characters total width
    const maxWidth = 36;
    const totalContentLength = leftText.length + rightText.length;
    
    if (totalContentLength >= maxWidth) {
      // If too long, truncate left text and keep right text
      const availableLeftSpace = maxWidth - rightText.length - 1; // Single space minimum
      const truncatedLeft = leftText.substring(0, Math.max(1, availableLeftSpace));
      const spacesNeeded = maxWidth - truncatedLeft.length - rightText.length;
      const alignedText = truncatedLeft + ' '.repeat(Math.max(1, spacesNeeded)) + rightText;
      
      console.log(`Long text - Left: "${truncatedLeft}" Spaces: ${spacesNeeded} Right: "${rightText}"`);
      console.log(`Final aligned text: "${alignedText}" (Length: ${alignedText.length})`);
      
      const textLines = this.textToBitmap(alignedText, charSpacing, true);
      for (const line of textLines) {
        await this.printBitmapLine(line);
      }
    } else {
      // Normal case: add spaces to push right text to the right
      const spacesNeeded = maxWidth - totalContentLength;
      const alignedText = leftText + ' '.repeat(spacesNeeded) + rightText;
      
      console.log(`Normal text - Left: "${leftText}" Spaces: ${spacesNeeded} Right: "${rightText}"`);
      console.log(`Final aligned text: "${alignedText}" (Length: ${alignedText.length})`);
      
      const textLines = this.textToBitmap(alignedText, charSpacing, true);
      for (const line of textLines) {
        await this.printBitmapLine(line);
      }
    }
    
    await this.feedPaper(2); // Better spacing between items
  }

  // Print separator line with proper spacing to prevent touching text
  async printSeparatorLine() {
    console.log('📏 Printing separator line with proper spacing');
    
    // Add space before separator
    await this.feedPaper(2);
    
    // Create separator matching the text width (36 chars)
    const separatorLine = new Array(this.bytesPerLine).fill(0);
    
    // Fill the usable area (36 chars = ~36*8 = 288 pixels)
    for (let i = 2; i < 38; i++) { // Start at byte 2, end before byte 38
      separatorLine[i] = 0xFF;
    }
    
    await this.printBitmapLine(separatorLine);
    
    // Add space after separator to prevent touching text below
    await this.feedPaper(-1);
  }

  // Print simple text line with exact spacing
  async printSimpleText(text, charSpacing = 1) {
    console.log(`📝 Printing simple text: "${text}"`);
    const textLines = this.textToBitmap(text, charSpacing, true);
    for (const line of textLines) {
      await this.printBitmapLine(line);
    }
    await this.feedPaper(3); // Better spacing
  }

  // ===============================================
  // SPECIALIZED RECEIPT ITEM FUNCTIONS
  // ===============================================

  // Helper function to print item with exact receipt format
  async printItemLine(itemName, quantity, price, unitPrice) {
    console.log(`📝 Printing item: "${itemName}" qty: ${quantity} price: "Rs.${price}"`);
    
    const maxWidth = 36;
    const maxNameLength = 24; // Allow space for price alignment

    // === PRODUCT NAME LINE ===
    const truncatedName = itemName.length > maxNameLength ? 
      itemName.substring(0, maxNameLength) + '...' : itemName;

    // Add extra spaces between item name and Qty
    const qtyLabel = '   '; // 3 spaces for better separation
    const nameWithSpace = truncatedName + qtyLabel;

    // Line 1: Product name and total price (right aligned)
    const priceText = `Rs.${price}`;
    const spacesNeeded = maxWidth - nameWithSpace.length - priceText.length;
    const line1 = nameWithSpace + ' '.repeat(Math.max(1, spacesNeeded)) + priceText;

    console.log(`Item line 1: "${line1}" (Length: ${line1.length})`);

    const textLines1 = this.textToBitmap(line1, 1, false);
    for (const line of textLines1) {
      await this.printBitmapLine(line);
    }

    // === QUANTITY AND UNIT PRICE LINE ===
    const qtyText = `Qty: ${quantity}`;
    const unitPriceText = `@ Rs.${unitPrice} each`;
    const spacesNeeded2 = maxWidth - qtyText.length - unitPriceText.length;
    const line2 = qtyText + ' '.repeat(Math.max(1, spacesNeeded2)) + unitPriceText;

    console.log(`Item line 2: "${line2}" (Length: ${line2.length})`);

    const textLines2 = this.textToBitmap(line2, 1, true);
    for (const line of textLines2) {
      await this.printBitmapLine(line);
    }

    await this.feedPaper(3); // More space between items
  }

  // Helper function to print totals with exact right alignment
  async printTotalLine(leftText, rightText, isBold = false) {
    console.log(`📝 Printing total: "${leftText}" | "${rightText}"`);
    
    const maxWidth = 36;
    const spacesNeeded = maxWidth - leftText.length - rightText.length;
    const alignedText = leftText + ' '.repeat(Math.max(1, spacesNeeded)) + rightText;
    
    console.log(`Total line: "${alignedText}" (Length: ${alignedText.length})`);
    
    if (isBold) {
      await this.printBoldText(leftText, rightText);
    } else {
      const textLines = this.textToBitmap(alignedText, 1, true);
      for (const line of textLines) {
        await this.printBitmapLine(line);
      }
      await this.feedPaper(2);
    }
  }

  // Helper function to print bold/highlighted text for TOTAL
  async printBoldText(leftText, rightText) {
    console.log(`📝 Printing BOLD text: "${leftText}" | "${rightText}"`);
    
    const maxWidth = 36;
    const totalContentLength = leftText.length + rightText.length;
    
    if (totalContentLength >= maxWidth) {
      const availableLeftSpace = maxWidth - rightText.length - 1;
      const truncatedLeft = leftText.substring(0, Math.max(1, availableLeftSpace));
      const spacesNeeded = maxWidth - truncatedLeft.length - rightText.length;
      const alignedText = truncatedLeft + ' '.repeat(Math.max(1, spacesNeeded)) + rightText;
      
      const textLines = this.textToBitmap(alignedText, 3, false);
      for (const line of textLines) {
        await this.printBitmapLine(line);
      }
    } else {
      const spacesNeeded = maxWidth - totalContentLength;
      const alignedText = leftText + ' '.repeat(spacesNeeded) + rightText;
      
      const textLines = this.textToBitmap(alignedText, 3, false);
      for (const line of textLines) {
        await this.printBitmapLine(line);
      }
    }
    
    await this.feedPaper(3);
  }
}

// Export singleton instance
const catPrinter = new CatPrinter();
export default catPrinter;
