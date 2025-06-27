import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import api from '../../../api';

interface Expense {
  expenseId: number;
  timestamp: string;
  expenseType: string;
  amount: number;
  remarks: string;
  recordedBy: string;
}

interface ExpensesReportView {
  expenseId: number;
  timestamp: string;
  expenseType: string;
  amount: number;
  remarks: string;
  firstname: string;
  lastname: string;
}

export const generateExpensesReportPDF = async () => {
  const fetchExpensesReport = async (): Promise<Expense[]> => {
    try {
      const response = await api.get('/expenses/report');
      console.log('Expenses report response:', response.data);
      const expenses: ExpensesReportView[] = response.data;

      // Map to Expense objects
      const expensesData = expenses.map((item) => ({
        expenseId: item.expenseId,
        timestamp: item.timestamp,
        expenseType: item.expenseType,
        amount: item.amount,
        remarks: item.remarks,
        recordedBy: `${item.firstname} ${item.lastname}`,
      }));

      return expensesData;
    } catch (err: any) {
      console.error('Error fetching expenses report:', err.message, err.response?.data);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load expenses report.',
        position: 'top',
        visibilityTime: 2500,
        topOffset: 40,
      });
      throw err;
    }
  };

  try {
    const expensesData = await fetchExpensesReport();
    if (expensesData.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No Data',
        text2: 'No expenses available.',
        position: 'top',
        visibilityTime: 2500,
        topOffset: 40,
      });
      throw new Error('No expenses available.');
    }

    const totalExpenses = expensesData.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const totalTransactions = expensesData.length;
    const periodStart = new Date(expensesData[0].timestamp).toLocaleDateString();
    const periodEnd = new Date(expensesData[expensesData.length - 1].timestamp).toLocaleDateString();

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
            <h1 class="title">Expenses Report</h1>
            <p class="subtitle">Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="subsequent-header">
            <img src="${logoUrl}" alt="EggCited Logo" class="logo" />
            <h1 class="title">Expenses Report</h1>
            <p class="subtitle">Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="summary">
            <p><strong>Total Expenses:</strong> ₱${totalExpenses.toFixed(2)}</p>
            <p><strong>Total Transactions:</strong> ${totalTransactions}</p>
            <p><strong>Period:</strong> ${periodStart}${periodStart === periodEnd ? '' : ` - ${periodEnd}`}</p>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Expense ID</th>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Amount (₱)</th>
                <th>Remarks</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              ${expensesData
                .map(
                  (expense: Expense) => `
                    <tr>
                      <td>${expense.expenseId}</td>
                      <td>${new Date(expense.timestamp).toLocaleString()}</td>
                      <td>${expense.expenseType}</td>
                      <td>₱${expense.amount.toFixed(2)}</td>
                      <td>${expense.remarks}</td>
                      <td>${expense.recordedBy}</td>
                    </tr>
                  `
                )
                .join('')}
            </tbody>
          </table>
          <p class="total">Grand Total: ₱${totalExpenses.toFixed(2)}</p>
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
    console.error('Error generating expenses report:', error);
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: error.message.includes('image') ? 'Failed to load logo from Cloudinary.' : 'Failed to generate Expenses Report.',
      position: 'top',
      visibilityTime: 2500,
      topOffset: 40,
    });
    throw error;
  }
};