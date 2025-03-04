import PDFDocument from 'pdfkit'; 
import fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  totalAmount: number;
}

async function generateGSTInvoice(email: string, invoiceData: InvoiceData) {
  // Create a new PDF document
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Pipe the PDF output to a file
  doc.pipe(fs.createWriteStream('invoice.pdf'));
  

  // Colors
  const headerColor = '#2c3e50';
  const borderColor = '#bdc3c7';

  // Document Dimensions
  const pageWidth = doc.page.width;
  const pageMargin = 50;
  const contentWidth = pageWidth - (2 * pageMargin);

  // Header Section
  doc.fillColor(headerColor)
     .font('Helvetica-Bold')
     .fontSize(20)
     .text('TAX INVOICE', { align: 'center' });

  // Draw a line under the header
  doc.moveTo(pageMargin, doc.y + 10)
     .lineTo(pageWidth - pageMargin, doc.y + 10)
     .strokeColor(borderColor)
     .lineWidth(1)
     .stroke();

  doc.moveDown(1);

  // Company and Invoice Details Grid
  doc.fillColor('black').font('Helvetica');
  
  // Create a grid-like layout
  const gridY = doc.y;
  const col1X = pageMargin;
  const col2X = pageWidth / 2 + 25;

  // Company Details (Left Column)
  doc.font('Helvetica-Bold').fontSize(10)
     .text('Seller Details', col1X, gridY);
  doc.font('Helvetica').fontSize(9)
     .text('Techno Solutions Pvt Ltd', col1X, doc.y + 5)
     .text('123 Business Park, Tech City', col1X, doc.y + 15)
     .text('GSTIN: 07AATCA2480C1Z0', col1X, doc.y + 25);

  // Invoice Details (Right Column)
  doc.font('Helvetica-Bold')
     .text('Invoice Details', col2X, gridY);
  doc.font('Helvetica')
     .text(`Invoice No: ${invoiceData.invoiceNumber}`, col2X, doc.y + 5)
     .text(`Date: ${invoiceData.date}`, col2X, doc.y + 15)
     .text(`Email: ${email}`, col2X, doc.y + 25);

  // Draw grid border
  doc.moveTo(pageMargin, gridY - 5)
     .lineTo(pageWidth - pageMargin, gridY - 5)
     .moveTo(pageWidth / 2 + 25, gridY - 5)
     .lineTo(pageWidth / 2 + 25, doc.y + 35)
     .strokeColor(borderColor)
     .lineWidth(0.5)
     .stroke();

  doc.moveDown(4);

  // Invoice Items Table
  const tableHeader = ['SL', 'Description', 'Quantity', 'Unit Price', 'Total'];
  const columnWidths = [30, 200, 80, 80, 100];
  
  // Table Header
  doc.font('Helvetica-Bold').fontSize(10);
  let xPos = pageMargin;
  tableHeader.forEach((header, index) => {
    doc.text(header, xPos, doc.y, { width: columnWidths[index], align: 'center' });
    xPos += columnWidths[index];
  });

  // Horizontal Line
  doc.moveTo(pageMargin, doc.y + 10)
     .lineTo(pageWidth - pageMargin, doc.y + 10)
     .strokeColor(borderColor)
     .lineWidth(0.5)
     .stroke();

  // Table Items
  doc.font('Helvetica').fontSize(9);
  invoiceData.items.forEach((item, index) => {
    doc.moveDown();
    xPos = pageMargin;
    
    // Serial Number
    doc.text((index + 1).toString(), xPos, doc.y, { width: columnWidths[0], align: 'center' });
    xPos += columnWidths[0];

    // Description
    doc.text(item.description, xPos, doc.y, { width: columnWidths[1], align: 'left' });
    xPos += columnWidths[1];

    // Quantity
    doc.text(item.quantity.toString(), xPos, doc.y, { width: columnWidths[2], align: 'center' });
    xPos += columnWidths[2];

    // Unit Price
    doc.text(`₹${item.price.toFixed(2)}`, xPos, doc.y, { width: columnWidths[3], align: 'right' });
    xPos += columnWidths[3];

    // Total
    doc.text(`₹${item.total.toFixed(2)}`, xPos, doc.y, { width: columnWidths[4], align: 'right' });
  });

  // Total Calculation Section
  doc.moveDown(2);
  doc.font('Helvetica-Bold').fontSize(10);
  
  // Subtotal
  doc.text('Subtotal', pageWidth - pageMargin - 200, doc.y, { width: 100, align: 'left' })
     .text(`₹${invoiceData.subtotal.toFixed(2)}`, pageWidth - pageMargin - 100, doc.y, { width: 100, align: 'right' });

  // CGST
  doc.moveDown();
  doc.font('Helvetica')
     .text('CGST (9%)', pageWidth - pageMargin - 200, doc.y, { width: 100, align: 'left' })
     .text(`₹${invoiceData.cgst.toFixed(2)}`, pageWidth - pageMargin - 100, doc.y, { width: 100, align: 'right' });

  // SGST
  doc.moveDown();
  doc.text('SGST (9%)', pageWidth - pageMargin - 200, doc.y, { width: 100, align: 'left' })
     .text(`₹${invoiceData.sgst.toFixed(2)}`, pageWidth - pageMargin - 100, doc.y, { width: 100, align: 'right' });

  // Total Amount
  doc.moveDown();
  doc.font('Helvetica-Bold').fontSize(12)
     .text('Total Amount', pageWidth - pageMargin - 200, doc.y, { width: 100, align: 'left' })
     .text(`₹${invoiceData.totalAmount.toFixed(2)}`, pageWidth - pageMargin - 100, doc.y, { width: 100, align: 'right' });

  // Footer Notes
  doc.moveDown(2);
  doc.font('Helvetica').fontSize(8)
     .text('Payment Terms: Due within 30 days', pageMargin, doc.y)
     .text('Thank you for your business!', pageMargin, doc.y + 10);


  console.log('PDF invoice generated: invoice.pdf');
  //
  try {
   // AWS S3 Configuration
   const s3 = new S3Client({ 
     region: 'ap-south-1',
     credentials: {
       accessKeyId: 'AKIA44Y6CATPWMRUCTY5', 
       secretAccessKey: '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' 
     },
   });
  const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
   const buffers: Buffer[] = [];
   doc.on('data', (chunk) => buffers.push(chunk));
   doc.on('end', () => resolve(Buffer.concat(buffers)));
   doc.on('error', (err) => reject(err));
   // Finalize the PDF
   doc.end(); 
 });

 // Upload to S3 
 const params = {
   Bucket: 'accountant-app', 
   Key: `invoices/invoice-${invoiceData.invoiceNumber}-${Date.now()}.pdf`, 
   Body: pdfBuffer, 
   ContentType: 'application/pdf', 
 };

 const command = new PutObjectCommand(params);
 await s3.send(command); 

 console.log('PDF invoice uploaded to S3:', params.Key);

} catch (error) {
 console.error('Error uploading to S3:', error);
} 
}
//

// Example Invoice Data
export const invoiceData: InvoiceData = {
    invoiceNumber: 'INV-12345',
    date: '2024-01-18',
    items: [
      { description: 'Web Development Service', quantity: 2, price: 5000, total: 10000 },
      { description: 'UI/UX Design', quantity: 1, price: 7500, total: 7500 },
      { description: 'Hosting Setup', quantity: 3, price: 1000, total: 3000 }
    ],
    subtotal: 20500,
    cgst: 1845,    // 9% of subtotal
    sgst: 1845,    // 9% of subtotal
    totalAmount: 24190
  };

const senderEmail = 'amansatyawani10@gmail.com';
generateGSTInvoice(senderEmail, invoiceData);