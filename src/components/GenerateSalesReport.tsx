import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import salesData from '../scripts/sales_history.json';

interface SaleItem {
  name: string;
  quantity: number;
  price: number;
}

interface Sale {
  orderId: string;
  timestamp: string;
  total: number;
  items: SaleItem[];
}

export const generateSalesHistoryPDF = async () => {
  try {
    const totalSales = salesData.sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalItems = salesData.sales.reduce(
      (sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    const logoUrl = 'https://res.cloudinary.com/dzwjjpvdb/image/upload/w_180,c_scale/v1750505959/EggCited/ixxau4ellammx0drebgo.png';

    const htmlContent = `
      <html>
        <head>
          <style>
            @page {
              size: 595pt 842pt; /* A4: 8.27in x 11.7in at 72dpi */
              background-color: #FFF7ED;
              margin: 40px;
            }
            body {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              color: #333;
              background-color: #FFF7ED;
              margin: 0; /* Reset body margin, rely on @page */
              padding: 40px;
              box-sizing: border-box;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #FBBF24;
              padding-bottom: 15px;
              margin-top: -40px;
              page-break-after: avoid;
            }
            .subsequent-header {
              text-align: center;
              border-bottom: 1px solid #FBBF24;
              padding-bottom: 10px;
              margin-top: -40px;
              display: none;
              page-break-after: avoid;
            }
            .logo {
              max-width: 180px;
            }
            .title {
              color: #D97706;
              font-size: 22px;
              font-weight: bold;
              margin-top: -20px;
              margin-bottom: 0;
              margin-left: 0;
              margin-right: 0;
            }
            .subtitle {
              color: #7C3AED;
              font-size: 11px;
              font-style: italic;
            }
            .summary {
              background: #FEF3C7;
              padding: 15px;
              border-radius: 10px;
              margin-bottom: 20px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
              page-break-inside: avoid;
            }
            .summary p {
              margin: 6px 0;
              font-size: 13px;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #FBBF24;
              padding: 10px;
              text-align: left;
            }
            th {
              background: #FCD34D;
              color: #92400E;
              font-weight: bold;
            }
            td {
              background: #FFFFFF;
            }
            tr {
              page-break-inside: avoid; /* Prevent row splitting */
            }
            .total {
              font-weight: bold;
              margin-top: 20px;
              text-align: right;
              font-size: 15px;
              color: #D97706;
              page-break-before: avoid;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #666;
              font-size: 11px;
              border-top: 1px solid #FBBF24;
              padding-top: 8px;
              page-break-before: avoid;
            }
            @media print {
              .table { page-break-before: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
              thead { display: table-header-group; }
              .subsequent-header {
                display: block; /* Show on new pages */
              }
              .header {
                display: none; /* Hide original header after first page */
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${logoUrl}" alt="EggCited Logo" class="logo" />
            <h1 class="title">Sales History Report</h1>
            <p class="subtitle">Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="subsequent-header">
            <img src="${logoUrl}" alt="EggCited Logo" class="logo" />
            <h1 class="title">Sales History Report</h1>
            <p class="subtitle">Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="summary">
            <p><strong>Total Sales:</strong> ₱${totalSales.toFixed(2)}</p>
            <p><strong>Total Items Sold:</strong> ${totalItems}</p>
            <p><strong>Period:</strong> ${new Date(salesData.sales[0].timestamp).toLocaleDateString()} - 
              ${new Date(salesData.sales[salesData.sales.length - 1].timestamp).toLocaleDateString()}</p>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date & Time</th>
                <th>Items</th>
                <th>Total (₱)</th>
              </tr>
            </thead>
            <tbody>
              ${salesData.sales
                .map(
                  (sale: Sale) => `
                    <tr>
                      <td>${sale.orderId}</td>
                      <td>${new Date(sale.timestamp).toLocaleString()}</td>
                      <td>
                        ${sale.items
                          .map(
                            (item: SaleItem) =>
                              `${item.name} (Qty: ${item.quantity} @ ₱${item.price.toFixed(2)})`
                          )
                          .join('<br>')}
                      </td>
                      <td>₱${sale.total.toFixed(2)}</td>
                    </tr>
                  `
                )
                .join('')}
            </tbody>
          </table>
          <p class="total">Grand Total: ₱${totalSales.toFixed(2)}</p>
          <p class="footer">Generated by ${salesData.store} POS System | EggCited Korean Eggdrop Sandwiches</p>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    } else {
      Alert.alert('Success', 'PDF generated and saved to device!');
    }
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    throw new Error(error.message.includes('image') ? 'Failed to load logo from Cloudinary. Please check the image URL or network.' : 'Failed to generate Sales History Report.');
  }
};