import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import api from '../../../api';

interface SaleItem {
  name: string;
  quantity: number;
  price: number;
}

interface Sale {
  orderId: string;
  timestamp: string;
  total: number;
  paymentMethod: string;
  items: SaleItem[];
  customerName: string;
  amount: number;
  paid: number;
  dueDate: string;
}

interface SalesHistoryItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
}

interface SalesHistory {
  orderId: string;
  timestamp: string;
  total: number;
  paymentMethodId: number;
  items: SalesHistoryItem[];
  salesItems: SalesHistoryItem[];
}

interface CreditTransactions {
  creditId: number;
  salesHistory: SalesHistory;
  customerName: string;
  amount: number;
  paid: number;
  dueDate: string;
  timestamp: string;
}

export const generateCreditReportPDF = async () => {
  const fetchCreditTransactions = async (): Promise<Sale[]> => {
    try {
      const response = await api.get('/credit-transactions');
      console.log('Credit transactions response:', response.data);
      const creditTransactions: CreditTransactions[] = response.data;

      // Map to Sale objects with items
      const salesData = creditTransactions.map((item) => ({
        orderId: item.salesHistory.orderId,
        timestamp: item.salesHistory.timestamp,
        total: item.salesHistory.total,
        paymentMethod: 'Credit',
        items: item.salesHistory.items.map((saleItem) => ({
          name: saleItem.productName,
          quantity: saleItem.quantity,
          price: saleItem.price,
        })),
        customerName: item.customerName,
        amount: item.amount,
        paid: item.paid,
        dueDate: item.dueDate,
      }));

      return salesData;
    } catch (err: any) {
      console.error('Error fetching credit transactions:', err.message, err.response?.data);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load credit transactions.',
        position: 'top',
        visibilityTime: 2500,
        topOffset: 40,
      });
      throw err;
    }
  };

  try {
    const salesData = await fetchCreditTransactions();
    if (salesData.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No Data',
        text2: 'No credit transactions available.',
        position: 'top',
        visibilityTime: 2500,
        topOffset: 40,
      });
      throw new Error('No credit transactions available.');
    }

    const totalSales = salesData.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const totalItems = salesData.reduce(
      (sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );
    const periodStart = new Date(salesData[0].timestamp).toLocaleDateString();
    const periodEnd = new Date(salesData[salesData.length - 1].timestamp).toLocaleDateString();

    const logoUrl = 'https://res.cloudinary.com/dzwjjpvdb/image/upload/w_180,c_scale/v1750505959/EggCited/ixxau4ellammx0drebgo.png';

    const htmlContent = `
      <html>
        <head>
          <style>
            @page {
              size: 595pt 842pt;
              background-color: #FFF7ED;
              margin: 40px;
            }
            body {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              color: #333;
              background-color: #FFF7ED;
              margin: 0;
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
              page-break-inside: avoid;
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
                display: block;
              }
              .header {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${logoUrl}" alt="EggCited Logo" class="logo" />
            <h1 class="title">Credit Transactions Report</h1>
            <p class="subtitle">Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="subsequent-header">
            <img src="${logoUrl}" alt="EggCited Logo" class="logo" />
            <h1 class="title">Credit Transactions Report</h1>
            <p class="subtitle">Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="summary">
            <p><strong>Total Sales:</strong> ₱${totalSales.toFixed(2)}</p>
            <p><strong>Total Items Sold:</strong> ${totalItems}</p>
            <p><strong>Period:</strong> ${periodStart}${periodStart === periodEnd ? '' : ` - ${periodEnd}`}</p>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date & Time</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total (₱)</th>
                <th>Amount (₱)</th>
                <th>Paid (₱)</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              ${salesData
                .map(
                  (sale: Sale) => `
                    <tr>
                      <td>${sale.orderId}</td>
                      <td>${new Date(sale.timestamp).toLocaleString()}</td>
                      <td>${sale.customerName}</td>
                      <td>
                        ${sale.items
                          .map(
                            (item: SaleItem) =>
                              `${item.name} (Qty: ${item.quantity} @ ₱${item.price.toFixed(2)})`
                          )
                          .join('<br>')}
                      </td>
                      <td>₱${sale.total.toFixed(2)}</td>
                      <td>₱${sale.amount.toFixed(2)}</td>
                      <td>₱${sale.paid.toFixed(2)}</td>
                      <td>${new Date(sale.dueDate).toLocaleDateString()}</td>
                    </tr>
                  `
                )
                .join('')}
            </tbody>
          </table>
          <p class="total">Grand Total: ₱${totalSales.toFixed(2)}</p>
          <p class="footer">Generated by EggCited POS System | EggCited Korean Eggdrop Sandwiches</p>
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
    console.error('Error generating credit report:', error);
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: error.message.includes('image') ? 'Failed to load logo from Cloudinary.' : 'Failed to generate Credit Transactions Report.',
      position: 'top',
      visibilityTime: 2500,
      topOffset: 40,
    });
    throw error;
  }
};