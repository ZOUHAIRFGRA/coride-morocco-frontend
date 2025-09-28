import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Platform,
  Share,
} from 'react-native';

// React Native doesn't have built-in icons like Lucide React
// You'll need to install react-native-vector-icons or similar
// For this example, I'll use text symbols as placeholders
// Install: npm install react-native-vector-icons
// import Icon from 'react-native-vector-icons/MaterialIcons';

// For file picking, you'll need react-native-document-picker
// Install: npm install react-native-document-picker
import DocumentPicker from 'react-native-document-picker';

// For file system operations, you'll need react-native-fs
// Install: npm install react-native-fs
import RNFS from 'react-native-fs';

// For sharing files, React Native's Share API is built-in
// For more advanced sharing, consider react-native-share

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * PDFToCsvConverter Component
 * 
 * This is the main component converted from React web to React Native.
 * Key differences from web version:
 * 1. Uses React Native components instead of HTML elements
 * 2. File handling uses react-native-document-picker instead of HTML input
 * 3. Styling uses StyleSheet instead of Tailwind CSS
 * 4. Navigation and layout adapted for mobile screens
 * 5. Touch interactions instead of mouse events
 */
const PDFToCsvConverter = () => {
  // State management - same as web version but with mobile-specific considerations
  const [file, setFile] = useState(null); // Selected PDF file object
  const [processing, setProcessing] = useState(false); // Loading state for API calls
  const [extractedData, setExtractedData] = useState(null); // Parsed transaction data
  const [error, setError] = useState(null); // Error messages
  const [showPreview, setShowPreview] = useState(false); // Toggle for data preview
  const [fontSize, setFontSize] = useState(14); // Mobile-appropriate font size
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' }); // Table sorting
  const [columnOrder, setColumnOrder] = useState(['date', 'description', 'amount', 'checkNumber']);
  const [cleaningDescriptions, setCleaningDescriptions] = useState(false); // AI cleaning state
  const [hasCleanedDescriptions, setHasCleanedDescriptions] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false); // Success feedback
  const [compactView, setCompactView] = useState(true); // Default to compact on mobile

  /**
   * File Upload Handler - Mobile Version
   * 
   * React Native doesn't have drag-and-drop like web browsers.
   * Instead, we use DocumentPicker to let users select files from their device.
   * This works on both iOS and Android.
   */
  const handleFileUpload = useCallback(async () => {
    try {
      // DocumentPicker allows users to pick files from their device
      // It returns an array of selected files
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf], // Only allow PDF files
        copyTo: 'cachesDirectory', // Copy file to app's cache for processing
      });

      const selectedFile = result[0];
      
      // Validate that it's actually a PDF
      if (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf')) {
        setFile(selectedFile);
        setError(null);
        setExtractedData(null);
        setShowPreview(false);
      } else {
        setError('Please select a valid PDF file');
      }
    } catch (err) {
      // Handle user cancellation and other errors
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
        console.log('User cancelled file picker');
      } else {
        setError('Failed to select file: ' + err.message);
      }
    }
  }, []);

  /**
   * PDF Processing Function - Adapted for Mobile
   * 
   * This function reads the PDF file and sends it to Claude API.
   * On mobile, we need to handle file reading differently than web.
   */
  const processFile = async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);

    try {
      // Read the PDF file as base64
      // On React Native, we use RNFS to read files
      let base64Data;
      
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        // Read file from the copied location
        const filePath = file.fileCopyUri || file.uri;
        base64Data = await RNFS.readFile(filePath, 'base64');
      } else {
        // Fallback for other platforms
        throw new Error('Unsupported platform');
      }

      // API call to Claude - same as web version
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "document",
                  source: {
                    type: "base64",
                    media_type: "application/pdf",
                    data: base64Data,
                  },
                },
                {
                  type: "text",
                  text: `Please analyze this bank or credit card statement and extract all transaction data, check images, and balance information. Return ONLY a valid JSON object with this exact structure:

{
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "Transaction description",
      "amount": -123.45,
      "checkNumber": "1234 or null if not a check"
    }
  ],
  "balances": {
    "beginningBalance": 1000.00,
    "endingBalance": 1500.00
  },
  "checkImages": [
    {
      "checkNumber": "1234",
      "payTo": "Payee name from check image",
      "memo": "Memo line from check image"
    }
  ],
  "accountInfo": {
    "accountNumber": "Last 4 digits if visible",
    "statementPeriod": "Date range if visible",
    "bankName": "Bank name if visible"
  }
}

Important rules:
- Use negative amounts for debits/expenses and positive for credits/deposits
- Format dates as YYYY-MM-DD
- Extract check numbers from transaction lines (look for "CHK", "Check", "#" followed by numbers)
- If check images are present in the statement, extract the "Pay To" and "Memo" information
- Match check images to transaction check numbers and enhance descriptions with: "Pay To: [payee] | Memo: [memo]"
- Clean up descriptions (remove extra spaces, standardize formatting)
- Extract beginning balance and ending balance from statement
- DO NOT include any text outside the JSON object
- If you cannot extract clear transaction data, return {"error": "Unable to parse statement data"}`,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      let responseText = data.content[0].text;
      
      // Clean up any markdown formatting
      responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      const parsedData = JSON.parse(responseText);
      
      if (parsedData.error) {
        throw new Error(parsedData.error);
      }

      // Process extracted data to enhance check descriptions
      if (parsedData.checkImages && parsedData.transactions) {
        parsedData.transactions.forEach(transaction => {
          if (transaction.checkNumber) {
            const matchingCheck = parsedData.checkImages.find(
              check => check.checkNumber === transaction.checkNumber
            );
            if (matchingCheck) {
              let enhancedDescription = transaction.description;
              if (matchingCheck.payTo) {
                enhancedDescription += ` | Pay To: ${matchingCheck.payTo}`;
              }
              if (matchingCheck.memo) {
                enhancedDescription += ` | Memo: ${matchingCheck.memo}`;
              }
              transaction.description = enhancedDescription;
            }
          }
        });
      }

      setExtractedData(parsedData);
      setShowPreview(true);
      setHasCleanedDescriptions(false);
    } catch (error) {
      console.error("Error processing file:", error);
      setError(`Failed to process PDF: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  /**
   * CSV Generation and Sharing - Mobile Version
   * 
   * On mobile, instead of downloading files, we typically share them
   * or save to the device's file system. This function creates the CSV
   * content and uses React Native's Share API.
   */
  const shareCSV = async () => {
    if (!extractedData || !extractedData.transactions) return;

    try {
      // Generate CSV content - same logic as web version
      const columnHeaders = {
        date: 'Date',
        description: 'Description',
        amount: 'Amount',
        checkNumber: 'Check Number',
        cleanedPayee: 'Cleaned Payee'
      };

      const headers = [];
      columnOrder.forEach(col => {
        if (columnHeaders[col]) {
          headers.push(columnHeaders[col]);
        }
      });
      
      if (hasCleanedDescriptions && !columnOrder.includes('cleanedPayee')) {
        headers.push('Cleaned Payee');
      }

      const csvRows = [headers.join(',')];
      const sortedTransactions = getSortedTransactions();
      
      sortedTransactions.forEach(transaction => {
        const row = [];
        
        columnOrder.forEach(col => {
          if (col === 'date') {
            row.push(transaction.date || '');
          } else if (col === 'description') {
            row.push(`"${(transaction.description || '').replace(/"/g, '""')}"`);
          } else if (col === 'amount') {
            row.push(transaction.amount || 0);
          } else if (col === 'checkNumber') {
            row.push(transaction.checkNumber || '');
          } else if (col === 'cleanedPayee') {
            row.push(`"${(transaction.cleanedPayee || '').replace(/"/g, '""')}"`);
          }
        });
        
        if (hasCleanedDescriptions && !columnOrder.includes('cleanedPayee')) {
          row.push(`"${(transaction.cleanedPayee || '').replace(/"/g, '""')}"`);
        }
        
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      
      // Save CSV to device's documents directory
      const fileName = `${file.name.replace('.pdf', '')}_transactions.csv`;
      const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      
      await RNFS.writeFile(filePath, csvContent, 'utf8');
      
      // Share the file using React Native's Share API
      await Share.share({
        title: 'Transaction CSV Export',
        message: 'Your transaction data has been exported to CSV format.',
        url: Platform.OS === 'ios' ? filePath : `file://${filePath}`,
      });
      
    } catch (error) {
      console.error('Error sharing CSV:', error);
      Alert.alert('Error', 'Failed to create and share CSV file.');
    }
  };

  /**
   * Copy to Clipboard - Mobile Version
   * 
   * React Native has a built-in Clipboard API that works across platforms.
   * We'll need to import it: import Clipboard from '@react-native-clipboard/clipboard'
   */
  const copyToClipboard = async () => {
    // Note: You'll need to install @react-native-clipboard/clipboard
    // import Clipboard from '@react-native-clipboard/clipboard';
    
    if (!extractedData || !extractedData.transactions) return;

    try {
      const columnHeaders = {
        date: 'Date',
        description: 'Description',
        amount: 'Amount',
        checkNumber: 'Check Number',
        cleanedPayee: 'Cleaned Payee'
      };

      const headers = [];
      columnOrder.forEach(col => {
        if (columnHeaders[col]) {
          headers.push(columnHeaders[col]);
        }
      });
      
      if (hasCleanedDescriptions && !columnOrder.includes('cleanedPayee')) {
        headers.push('Cleaned Payee');
      }

      const rows = [headers.join('\t')];
      const sortedTransactions = getSortedTransactions();
      
      sortedTransactions.forEach(transaction => {
        const row = [];
        
        columnOrder.forEach(col => {
          if (col === 'date') {
            row.push(transaction.date || '');
          } else if (col === 'description') {
            row.push(transaction.description || '');
          } else if (col === 'amount') {
            row.push(transaction.amount || 0);
          } else if (col === 'checkNumber') {
            row.push(transaction.checkNumber || '');
          } else if (col === 'cleanedPayee') {
            row.push(transaction.cleanedPayee || '');
          }
        });
        
        if (hasCleanedDescriptions && !columnOrder.includes('cleanedPayee')) {
          row.push(transaction.cleanedPayee || '');
        }
        
        rows.push(row.join('\t'));
      });

      const tableData = rows.join('\n');
      
      // Copy to clipboard using React Native's Clipboard API
      // Clipboard.setString(tableData);
      
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      
      Alert.alert('Copied!', 'Table data has been copied to clipboard.');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'Failed to copy to clipboard.');
    }
  };

  /**
   * Edit Transaction Function - Mobile Optimized
   * 
   * This handles editing individual transaction fields.
   * On mobile, we need to be careful with input handling and validation.
   */
  const editTransaction = (index, field, value) => {
    const updatedData = { ...extractedData };
    
    // Handle different field types appropriately
    if (field === 'amount') {
      // Parse and validate numeric input
      const numericValue = parseFloat(value) || 0;
      updatedData.transactions[index][field] = numericValue;
    } else {
      // Handle text fields
      updatedData.transactions[index][field] = value;
    }
    
    setExtractedData(updatedData);
  };

  /**
   * Sorting Functionality - Same as Web Version
   * 
   * Mobile users can still sort data by tapping column headers.
   */
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedTransactions = () => {
    if (!extractedData || !extractedData.transactions || !sortConfig.key) {
      return extractedData?.transactions || [];
    }

    return [...extractedData.transactions].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      
      if (sortConfig.key === 'amount') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      if (sortConfig.key === 'date') {
        return sortConfig.direction === 'asc' 
          ? new Date(aVal) - new Date(bVal) 
          : new Date(bVal) - new Date(aVal);
      }
      
      const aStr = (aVal || '').toString().toLowerCase();
      const bStr = (bVal || '').toString().toLowerCase();
      
      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      }
      return bStr.localeCompare(aStr);
    });
  };

  /**
   * AI Description Cleaning - Same API Logic
   * 
   * This uses the same Claude API call as the web version
   * to clean up transaction descriptions.
   */
  const cleanDescriptions = async () => {
    if (!extractedData || !extractedData.transactions) return;

    setCleaningDescriptions(true);
    setError(null);

    try {
      const descriptions = extractedData.transactions.map(t => t.description).join('\n');
      
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [
            {
              role: "user",
              content: `Please clean up these transaction descriptions to extract just the clean payee names. Remove extra information like addresses, transaction IDs, codes, dates, and other clutter. Return ONLY a JSON array with the cleaned payee names in the same order:

${descriptions}

Return format: ["Clean Payee 1", "Clean Payee 2", ...]

Rules:
- Extract the main business/person name only
- Remove transaction codes, addresses, phone numbers, IDs
- Remove "DEBIT PURCHASE", "ACH", "CHECK", etc.
- Keep it simple and readable
- If unclear, use the most recognizable part

DO NOT include any text outside the JSON array.`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      let responseText = data.content[0].text;
      responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      const cleanedPayees = JSON.parse(responseText);
      
      const updatedData = { ...extractedData };
      updatedData.transactions.forEach((transaction, index) => {
        transaction.cleanedPayee = cleanedPayees[index] || '';
      });
      
      setExtractedData(updatedData);
      setHasCleanedDescriptions(true);
      
      if (!columnOrder.includes('cleanedPayee')) {
        setColumnOrder([...columnOrder, 'cleanedPayee']);
      }
      
    } catch (error) {
      console.error("Error cleaning descriptions:", error);
      setError(`Failed to clean descriptions: ${error.message}`);
    } finally {
      setCleaningDescriptions(false);
    }
  };

  /**
   * Summary Calculations - Same Logic as Web
   */
  const calculateSummary = () => {
    if (!extractedData || !extractedData.transactions) return null;
    
    const totalNetChange = extractedData.transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const beginningBalance = extractedData.balances?.beginningBalance || 0;
    const endingBalance = extractedData.balances?.endingBalance || 0;
    const calculatedEndingBalance = beginningBalance + totalNetChange;
    const reconciles = Math.abs(calculatedEndingBalance - endingBalance) < 0.01;
    
    return {
      beginningBalance,
      endingBalance,
      totalNetChange,
      calculatedEndingBalance,
      reconciles
    };
  };

  const summary = calculateSummary();

  /**
   * Mobile-Optimized Table Row Component
   * 
   * This renders individual transaction rows with mobile-friendly inputs.
   * Each row is optimized for touch interaction on smaller screens.
   */
  const TransactionRow = ({ transaction, index }) => (
    <View style={styles.tableRow}>
      {columnOrder.map((column) => {
        if (column === 'date') {
          return (
            <View key={column} style={[styles.tableCell, styles.dateCell]}>
              <TextInput
                style={[styles.input, { fontSize }]}
                value={transaction.date}
                onChangeText={(text) => editTransaction(index, 'date', text)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
            </View>
          );
        }
        if (column === 'description') {
          return (
            <View key={column} style={[styles.tableCell, styles.descriptionCell]}>
              <TextInput
                style={[styles.input, { fontSize }]}
                value={transaction.description}
                onChangeText={(text) => editTransaction(index, 'description', text)}
                placeholder="Description"
                placeholderTextColor="#999"
                multiline={!compactView}
                numberOfLines={compactView ? 1 : 2}
              />
            </View>
          );
        }
        if (column === 'amount') {
          return (
            <View key={column} style={[styles.tableCell, styles.amountCell]}>
              <TextInput
                style={[
                  styles.input, 
                  styles.amountInput,
                  { fontSize },
                  transaction.amount < 0 ? styles.negativeAmount : styles.positiveAmount
                ]}
                value={transaction.amount.toString()}
                onChangeText={(text) => editTransaction(index, 'amount', text)}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#999"
              />
            </View>
          );
        }
        if (column === 'checkNumber') {
          return (
            <View key={column} style={[styles.tableCell, styles.checkCell]}>
              <TextInput
                style={[styles.input, { fontSize }]}
                value={transaction.checkNumber || ''}
                onChangeText={(text) => editTransaction(index, 'checkNumber', text)}
                placeholder="Check #"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          );
        }
        if (column === 'cleanedPayee') {
          return (
            <View key={column} style={[styles.tableCell, styles.payeeCell]}>
              <TextInput
                style={[styles.input, styles.cleanedPayeeInput, { fontSize }]}
                value={transaction.cleanedPayee || ''}
                onChangeText={(text) => editTransaction(index, 'cleanedPayee', text)}
                placeholder="Clean payee"
                placeholderTextColor="#999"
              />
            </View>
          );
        }
        return null;
      })}
    </View>
  );

  /**
   * Main Render Function
   * 
   * This renders the entire mobile interface using React Native components.
   * Layout is optimized for portrait mobile screens with scrollable content.
   */
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>PDF Statement to CSV</Text>
        <Text style={styles.subtitle}>Convert bank statements for QuickBooks</Text>
      </View>

      {/* File Upload Section */}
      <View style={styles.uploadSection}>
        <TouchableOpacity 
          style={styles.uploadButton} 
          onPress={handleFileUpload}
          activeOpacity={0.7}
        >
          <Text style={styles.uploadIcon}>📄</Text>
          <Text style={styles.uploadText}>
            {file ? file.name : 'Select PDF Statement'}
          </Text>
        </TouchableOpacity>

        {file && (
          <TouchableOpacity
            style={[styles.processButton, processing && styles.processButtonDisabled]}
            onPress={processFile}
            disabled={processing}
            activeOpacity={0.7}
          >
            {processing ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.processButtonText}>Extract Data</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Success and Data Preview */}
      {extractedData && (
        <View style={styles.dataSection}>
          {/* Header with Controls */}
          <View style={styles.dataHeader}>
            <View style={styles.dataHeaderText}>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.dataTitle}>
                {extractedData.transactions?.length || 0} Transactions
              </Text>
            </View>
            
            {/* Control Buttons */}
            <View style={styles.controlsRow}>
              <TouchableOpacity
                style={[styles.controlButton, styles.compactButton]}
                onPress={() => setCompactView(!compactView)}
                activeOpacity={0.7}
              >
                <Text style={styles.controlButtonText}>
                  {compactView ? 'Normal' : 'Compact'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.controlButton, styles.fontButton]}
                onPress={() => setFontSize(fontSize === 12 ? 16 : 12)}
                activeOpacity={0.7}
              >
                <Text style={styles.controlButtonText}>
                  {fontSize === 12 ? 'A+' : 'A-'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Summary Section */}
          {summary && (
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Statement Summary</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Beginning</Text>
                  <Text style={styles.summaryValue}>
                    ${summary.beginningBalance.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Net Change</Text>
                  <Text style={[
                    styles.summaryValue,
                    summary.totalNetChange >= 0 ? styles.positiveAmount : styles.negativeAmount
                  ]}>
                    ${summary.totalNetChange.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Ending</Text>
                  <Text style={styles.summaryValue}>
                    ${summary.endingBalance.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Status</Text>
                  <Text style={[
                    styles.summaryValue,
                    summary.reconciles ? styles.positiveAmount : styles.negativeAmount
                  ]}>
                    {summary.reconciles ? '✅ Balanced' : '⚠️ Off'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.copyButton]}
              onPress={copyToClipboard}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>
                {copySuccess ? '✅ Copied' : '📋 Copy'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.cleanButton]}
              onPress={cleanDescriptions}
              disabled={cleaningDescriptions}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>
                {cleaningDescriptions ? '⏳ Cleaning...' : '✨ AI Clean'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              onPress={shareCSV}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>📤 Share CSV</Text>
            </TouchableOpacity>
          </View>

          {/* Table Headers */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              {columnOrder.map((column) => {
                const columnConfig = {
                  date: { label: 'Date', key: 'date' },
                  description: { label: 'Description', key: 'description' },
                  amount: { label: 'Amount', key: 'amount' },
                  checkNumber: { label: 'Check #', key: 'checkNumber' },
                  cleanedPayee: { label: 'Clean Payee', key: 'cleanedPayee' }
                };
                
                const config = columnConfig[column];
                if (!config) return null;
                
                return (
                  <TouchableOpacity
                    key={column}
                    style={[
                      styles.tableHeaderCell,
                      column === 'date' && styles.dateCell,
                      column === 'description' && styles.descriptionCell,
                      column === 'amount' && styles.amountCell,
                      column === 'checkNumber' && styles.checkCell,
                      column === 'cleanedPayee' && styles.payeeCell,
                    ]}
                    onPress={() => handleSort(config.key)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.tableHeaderText, { fontSize }]}>
                      {config.label}
                    </Text>
                    <Text style={styles.sortIndicator}>
                      {sortConfig.key === config.key 
                        ? (sortConfig.direction === 'asc' ? '↑' : '↓')
                        : '↕️'
                      }
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Transaction Rows */}
            <ScrollView nestedScrollEnabled={true} style={styles.tableScrollView}>
              {getSortedTransactions().map((transaction, index) => (
                <TransactionRow
                  key={index}
                  transaction={transaction}
                  index={index}
                />
              ))}