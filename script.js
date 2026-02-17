// ========== TELEGRAM CONFIGURATION ==========
const TELEGRAM_BOT_TOKEN = "8549260649:AAG5h9hHumxEpvhCXuiGMrhAwx-cMrgp_ak";
const TELEGRAM_CHAT_ID = "8434905389";

// ========== STATE ==========
let receipts = JSON.parse(localStorage.getItem('receipts')) || {};
let currentSession = {
    username: 'Guest',
    balance: 0
};
let currentTransaction = null;

// ========== SRI LANKA ALL BANKS ==========
// ලංකාවේ තියෙන සියලුම ප්‍රධාන බැංකු
const sriLankanBanks = [
    // Government Banks - රජයේ බැංකු
    'Bank of Ceylon (BOC)',
    'People\'s Bank',
    'National Savings Bank',
    'Regional Development Bank (RDB)',
    'Sri Lanka Savings Bank',
    'Housing Development Finance Corporation (HDFC)',
    
    // Private Commercial Banks - පෞද්ගලික වාණිජ බැංකු
    'Commercial Bank of Ceylon',
    'Hatton National Bank (HNB)',
    'Sampath Bank',
    'Seylan Bank',
    'Nations Trust Bank',
    'Pan Asia Banking Corporation',
    'Union Bank of Colombo',
    'DFCC Bank',
    'National Development Bank (NDB)',
    'Amana Bank',
    'Cargills Bank',
    'Sanasa Development Bank',
    'LB Finance',
    'LOLC Finance',
    'Central Finance Company',
    'People\'s Leasing & Finance',
    'Alliance Finance Company',
    'Abans Finance',
    'Commercial Credit and Finance',
    'Vallibel One',
    'Hunas Holdings',
    'Softlogic Finance',
    'Senkadagala Finance',
    'UB Finance',
    'Lankaputhra Development Bank',
    
    // Foreign Banks - විදේශීය බැංකු
    'HSBC (Hongkong and Shanghai Banking Corporation)',
    'Standard Chartered Bank',
    'Deutsche Bank',
    'Citibank N.A.',
    'ICICI Bank',
    'Indian Bank',
    'Indian Overseas Bank',
    'State Bank of India',
    'Habib Bank',
    'Public Bank Berhad',
    'Bank of China',
    
    // Specialized Banks - විශේෂිත බැංකු
    'National Enterprise Development Authority (NEDA)',
    'Export-Import Bank of Sri Lanka',
    'Sri Lanka Development Finance Corporation',
    'State Mortgage & Investment Bank',
    'Lankaputhra Development Bank',
    'Kahatagaha Graphite Lanka Limited',
    'Ceylon Fisheries Corporation',
    'Sri Lanka Ports Authority',
    'Sri Lanka Telecom',
    'Ceylon Electricity Board',
    'National Water Supply and Drainage Board',
    'Ceylon Petroleum Corporation',
    'Sri Lanka Transport Board',
    'Ceylon Fertilizer Corporation',
    
    // Microfinance Banks - කුඩා ණය බැංකු
    'Grameen Bank',
    'BRAC',
    'SEEDS',
    'Sarvodaya Economic Enterprise Services',
    'Women\'s Development Bank',
    'Janashakthi Bank'
];

// Sort banks alphabetically
sriLankanBanks.sort();

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', function() {
    hideAll();
    document.getElementById("mainSell").classList.remove("hidden");
    initBankDropdown();
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const dropdown = document.getElementById('bankDropdown');
        const selector = document.querySelector('.bank-selector');
        
        if (selector && !selector.contains(event.target) && dropdown && !dropdown.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    });
});

function initBankDropdown() {
    renderBankItems(sriLankanBanks);
}

function renderBankItems(banks) {
    const container = document.getElementById('bankItemsContainer');
    if (!container) return;
    
    if (banks.length === 0) {
        container.innerHTML = '<div class="bank-item no-results">❌ No banks found</div>';
        return;
    }
    
    let html = '';
    banks.forEach(bank => {
        // Escape single quotes for onclick
        const escapedBank = bank.replace(/'/g, "\\'");
        html += `<div class="bank-item" onclick="selectBank('${escapedBank}')">${bank}</div>`;
    });
    container.innerHTML = html;
}

function filterBanks() {
    const searchInput = document.getElementById('bankSearch');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        renderBankItems(sriLankanBanks);
        return;
    }
    
    const filtered = sriLankanBanks.filter(bank => 
        bank.toLowerCase().includes(searchTerm)
    );
    
    renderBankItems(filtered);
}

function toggleBankDropdown() {
    const dropdown = document.getElementById('bankDropdown');
    dropdown.classList.toggle('show');
    
    if (dropdown.classList.contains('show')) {
        // Focus on search input when dropdown opens
        setTimeout(() => {
            document.getElementById('bankSearch').focus();
        }, 100);
        // Reset search and show all banks
        document.getElementById('bankSearch').value = '';
        renderBankItems(sriLankanBanks);
    }
}

function selectBank(bankName) {
    document.getElementById('selectedBankValue').value = bankName;
    document.getElementById('selectedBankDisplay').innerHTML = bankName;
    document.getElementById('bankDropdown').classList.remove('show');
    
    const otherInput = document.getElementById('otherBankName');
    if (bankName === 'Other') {
        otherInput.style.display = 'block';
        otherInput.focus();
    } else {
        otherInput.style.display = 'none';
        otherInput.value = '';
    }
}

function quickSelectBank(bankName) {
    selectBank(bankName);
}

function getSelectedBank() {
    const bank = document.getElementById('selectedBankValue').value;
    const other = document.getElementById('otherBankName').value.trim();
    return other || bank;
}

function getFullCustomerNumber() {
    const number = document.getElementById('customerNumber').value.replace(/\s/g, '');
    return number ? '+94' + number : '';
}

// ========== NAVIGATION ==========
function hideAll() {
    ['mainSell', 'dashboard', 'deposit', 'thankyouPage'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
}

function enterSellPlatform() {
    hideAll();
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('displayUsername').textContent = currentSession.username;
    document.getElementById('userBalance').textContent = currentSession.balance + ' USDT';
}

function backToMain() {
    hideAll();
    document.getElementById('mainSell').classList.remove('hidden');
}

function showDashboard() {
    hideAll();
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('displayUsername').textContent = currentSession.username;
    document.getElementById('userBalance').textContent = currentSession.balance + ' USDT';
}

function showDeposit() {
    hideAll();
    document.getElementById('deposit').classList.remove('hidden');
    
    // Reset fields
    document.getElementById('result').innerHTML = '';
    document.getElementById('receiptUploadSection').classList.add('hidden');
    document.getElementById('finalInvoiceSection').classList.add('hidden');
    document.getElementById('depositAmount').value = '';
    document.getElementById('customerNumber').value = '';
    document.getElementById('selectedBankDisplay').innerHTML = 'Choose your bank';
    document.getElementById('selectedBankValue').value = '';
    document.getElementById('accountNumber').value = '';
    document.getElementById('accountName').value = '';
    document.getElementById('otherBankName').value = '';
    document.getElementById('otherBankName').style.display = 'none';
    document.getElementById('uploadError').style.display = 'none';
    document.getElementById('uploadSuccess').style.display = 'none';
    
    currentTransaction = null;
}

function showThankYou() {
    if (!currentTransaction) {
        alert('No transaction data found!');
        return;
    }
    
    const details = document.getElementById('thankyouDetails');
    details.innerHTML = `
        <p style="margin: 8px 0;"><strong style="color: #0066cc;">💰 Amount:</strong> ${currentTransaction.amount} USDT</p>
        <p style="margin: 8px 0;"><strong style="color: #0066cc;">🏦 Bank:</strong> ${currentTransaction.bankDetails.bankName}</p>
        <p style="margin: 8px 0;"><strong style="color: #0066cc;">📋 Account:</strong> ${currentTransaction.bankDetails.accountNumber}</p>
        <p style="margin: 8px 0;"><strong style="color: #0066cc;">👤 Name:</strong> ${currentTransaction.bankDetails.accountName}</p>
        <p style="margin: 8px 0;"><strong style="color: #0066cc;">📱 Contact:</strong> ${currentTransaction.customerNumber || 'Not provided'}</p>
        <p style="margin: 8px 0;"><strong style="color: #0066cc;">🕐 Time:</strong> ${new Date().toLocaleString()}</p>
    `;
    
    hideAll();
    document.getElementById('thankyouPage').classList.remove('hidden');
}

// ========== COPY ADDRESS FUNCTION ==========
function copyAddressToClipboard(address) {
    // Modern clipboard API එක use කරන්න
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(address).then(() => {
            showCopySuccess();
        }).catch(err => {
            // Fallback method එක
            fallbackCopy(address);
        });
    } else {
        // Old browser සඳහා fallback
        fallbackCopy(address);
    }
}

// Fallback copy method එක
function fallbackCopy(address) {
    const textarea = document.createElement('textarea');
    textarea.value = address;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    
    try {
        document.execCommand('copy');
        showCopySuccess();
    } catch (err) {
        alert('Copy failed. Please copy manually: ' + address);
    }
    
    document.body.removeChild(textarea);
}

// Success message පෙන්වන function එක
function showCopySuccess() {
    // Toast message එකක් create කරන්න
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = '✅ Address copied to clipboard!';
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 2000);
}

// ========== TRANSACTIONS ==========
function showAddress() {
    const net = document.getElementById('network').value;
    const amount = document.getElementById('depositAmount').value;
    const bankName = getSelectedBank();
    const accountNumber = document.getElementById('accountNumber').value;
    const accountName = document.getElementById('accountName').value;
    const customerNumber = getFullCustomerNumber();
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount!');
        return;
    }
    
    if (!bankName || bankName === 'Other' || bankName === '') {
        alert('Please select a bank!');
        return;
    }
    
    if (!accountNumber || !accountName) {
        alert('Please fill in account details!');
        return;
    }
    
    const addresses = {
        "trc20": { address: "TGYo1yPCjJTyed37Lt1ARipg6BQBLkRPi4", network: "Tron (TRC20)" },
        "erc20": { address: "0x335363935c8367ea960b593624b11ff4124d69c2", network: "Ethereum (ERC20)" },
        "binance": { address: "1152472652", network: "Binance Pay" }
    };
    
    const selected = addresses[net];
    
    currentTransaction = {
        id: Date.now(),
        amount: amount,
        network: net,
        bankDetails: { bankName, accountNumber, accountName },
        customerNumber: customerNumber,
        address: selected.address,
        timestamp: new Date().toLocaleString()
    };
    
    document.getElementById('result').innerHTML = `
        <div style="background: linear-gradient(145deg, #f0f7ff, white); border-radius: 24px; padding: 24px; border: 2px solid #4d94ff;">
            <h3 style="color: #0066cc; margin-bottom: 16px;">💳 Payment Details</h3>
            
            <div style="background: white; border-radius: 20px; padding: 16px; margin-bottom: 16px;">
                <p style="margin: 6px 0;"><strong style="color: #0066cc;">🏦 Bank:</strong> ${bankName}</p>
                <p style="margin: 6px 0;"><strong style="color: #0066cc;">📋 Account:</strong> ${accountNumber}</p>
                <p style="margin: 6px 0;"><strong style="color: #0066cc;">👤 Name:</strong> ${accountName}</p>
                ${customerNumber ? `<p style="margin: 6px 0;"><strong style="color: #0066cc;">📱 Contact:</strong> ${customerNumber}</p>` : ''}
            </div>
            
            <p style="margin: 10px 0;"><strong style="color: #0066cc;">💰 Amount:</strong> ${amount} USDT</p>
            <p style="margin: 10px 0;"><strong style="color: #0066cc;">🌐 Network:</strong> ${selected.network}</p>
            
            <p style="margin: 10px 0;"><strong style="color: #0066cc;">📤 Address/ID:</strong></p>
            <code style="display: block; background: white; padding: 16px; border-radius: 20px; border: 2px solid #e6f0ff; margin: 10px 0; word-break: break-all; font-size: 13px;">
                ${selected.address}
            </code>
            
            <button onclick="copyAddressToClipboard('${selected.address}')" 
                    style="width: 100%; background: linear-gradient(145deg, #0066cc, #4d94ff); color: white; border: none; padding: 16px 20px; border-radius: 30px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.3s ease; margin-top: 16px;">
                📋 Copy Address
            </button>
            
            <div id="copySuccessMessage" style="text-align: center; margin-top: 12px; font-size: 14px; color: #00aa00; display: none;">
                ✅ Address copied to clipboard!
            </div>
        </div>
    `;
    
    document.getElementById('receiptUploadSection').classList.remove('hidden');
}

function previewReceipt(input) {
    const preview = document.getElementById('receiptPreview');
    const errorDiv = document.getElementById('uploadError');
    
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const maxSize = 10 * 1024 * 1024; // 10MB max
        
        if (file.size > maxSize) {
            errorDiv.style.display = 'block';
            errorDiv.textContent = 'File too large (max 10MB)';
            input.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            if (file.type.startsWith('image/')) {
                preview.innerHTML = `<img src="${e.target.result}" style="max-width:100%; max-height:120px; border-radius:16px; border:2px solid #4d94ff;">`;
            } else {
                preview.innerHTML = `
                    <div style="background: white; padding: 16px; border-radius: 16px; border: 2px solid #4d94ff;">
                        📄 ${file.name}
                    </div>
                `;
            }
            errorDiv.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

// ========== NEW BEAUTIFUL INVOICE FUNCTION ==========
function generateBeautifulInvoice(transaction) {
    const invoiceId = 'SWP-' + Date.now().toString().slice(-8) + '-' + transaction.amount;
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const time = new Date().toLocaleTimeString();
    
    return `
        <div class="invoice-card">
            <div class="invoice-header">
                <div class="invoice-title">SWAP GATE</div>
                <div class="invoice-subtitle">USDT Transaction Invoice</div>
                <div class="invoice-id-badge">${invoiceId}</div>
            </div>
            
            <div class="invoice-body">
                <div class="invoice-amount-section">
                    <div class="invoice-amount-label">Total Amount</div>
                    <div class="invoice-amount-value">
                        ${transaction.amount} <span class="invoice-amount-currency">USDT</span>
                    </div>
                </div>
                
                <div class="invoice-details-grid">
                    <div class="invoice-detail-item">
                        <div class="invoice-detail-label">Network</div>
                        <div class="invoice-detail-value">${transaction.network.toUpperCase()}</div>
                    </div>
                    <div class="invoice-detail-item">
                        <div class="invoice-detail-label">Status</div>
                        <div class="invoice-detail-value">
                            <span class="status-badge-new">⏳ Pending</span>
                        </div>
                    </div>
                    <div class="invoice-detail-item">
                        <div class="invoice-detail-label">Date</div>
                        <div class="invoice-detail-value">${date}</div>
                    </div>
                    <div class="invoice-detail-item">
                        <div class="invoice-detail-label">Time</div>
                        <div class="invoice-detail-value">${time}</div>
                    </div>
                </div>
                
                <div class="invoice-bank-details">
                    <div style="margin-top: 10px;">
                        <div class="invoice-row">
                            <span class="invoice-label">Bank Name</span>
                            <span class="invoice-value">${transaction.bankDetails.bankName}</span>
                        </div>
                        <div class="invoice-row">
                            <span class="invoice-label">Account Number</span>
                            <span class="invoice-value">${transaction.bankDetails.accountNumber}</span>
                        </div>
                        <div class="invoice-row">
                            <span class="invoice-label">Account Holder</span>
                            <span class="invoice-value">${transaction.bankDetails.accountName}</span>
                        </div>
                        ${transaction.customerNumber ? `
                        <div class="invoice-row">
                            <span class="invoice-label">Contact</span>
                            <span class="invoice-value">${transaction.customerNumber}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="invoice-full-width">
                    <div class="invoice-row">
                        <span class="invoice-label">Transaction ID</span>
                        <span class="invoice-value">${transaction.id}</span>
                    </div>
                    <div class="invoice-row">
                        <span class="invoice-label">USDT Address</span>
                        <span class="invoice-value" style="font-size: 12px;">${transaction.address}</span>
                    </div>
                </div>
                
                <div class="invoice-qr-section">
                    <div class="invoice-qr-placeholder">🔷</div>
                    <div class="invoice-qr-text">Scan to verify</div>
                </div>
                
                <div class="invoice-footer">
                    <div class="invoice-footer-bold">Thank you for choosing Swap Gate!</div>
                    <div class="invoice-footer-text">This is an auto-generated invoice</div>
                    <div class="invoice-footer-text">For support: support@swapgate.com</div>
                </div>
            </div>
            
            <div class="invoice-watermark">SWAP</div>
        </div>
    `;
}

// ========== AUTO DOWNLOAD INVOICE FUNCTION ==========
function autoDownloadInvoice(transaction) {
    if (!transaction) return;
    
    const invoiceId = 'SWP-' + Date.now().toString().slice(-8) + '-' + transaction.amount;
    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const time = new Date().toLocaleTimeString();
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Swap Gate Invoice - ${transaction.amount} USDT</title>
            <link rel="stylesheet" href="styles.css">
        </head>
        <body>
            <div class="invoice-card">
                <div class="invoice-header">
                    <div class="invoice-title">SWAP GATE</div>
                    <div class="invoice-subtitle">USDT Transaction Invoice</div>
                    <div class="invoice-id-badge">${invoiceId}</div>
                </div>
                
                <div class="invoice-body">
                    <div class="invoice-amount-section">
                        <div class="invoice-amount-label">Total Amount</div>
                        <div class="invoice-amount-value">
                            ${transaction.amount} <span class="invoice-amount-currency">USDT</span>
                        </div>
                    </div>
                    
                    <div class="invoice-details-grid">
                        <div class="invoice-detail-item">
                            <div class="invoice-detail-label">Network</div>
                            <div class="invoice-detail-value">${transaction.network.toUpperCase()}</div>
                        </div>
                        <div class="invoice-detail-item">
                            <div class="invoice-detail-label">Status</div>
                            <div class="invoice-detail-value">
                                <span class="status-badge-new">⏳ Pending</span>
                            </div>
                        </div>
                        <div class="invoice-detail-item">
                            <div class="invoice-detail-label">Date</div>
                            <div class="invoice-detail-value">${date}</div>
                        </div>
                        <div class="invoice-detail-item">
                            <div class="invoice-detail-label">Time</div>
                            <div class="invoice-detail-value">${time}</div>
                        </div>
                    </div>
                    
                    <div class="invoice-bank-details">
                        <div style="margin-top: 10px;">
                            <div class="invoice-row">
                                <span class="invoice-label">Bank Name</span>
                                <span class="invoice-value">${transaction.bankDetails.bankName}</span>
                            </div>
                            <div class="invoice-row">
                                <span class="invoice-label">Account Number</span>
                                <span class="invoice-value">${transaction.bankDetails.accountNumber}</span>
                            </div>
                            <div class="invoice-row">
                                <span class="invoice-label">Account Holder</span>
                                <span class="invoice-value">${transaction.bankDetails.accountName}</span>
                            </div>
                            ${transaction.customerNumber ? `
                            <div class="invoice-row">
                                <span class="invoice-label">Contact</span>
                                <span class="invoice-value">${transaction.customerNumber}</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="invoice-full-width">
                        <div class="invoice-row">
                            <span class="invoice-label">Transaction ID</span>
                            <span class="invoice-value">${transaction.id}</span>
                        </div>
                        <div class="invoice-row">
                            <span class="invoice-label">USDT Address</span>
                            <span class="invoice-value" style="font-size: 12px;">${transaction.address}</span>
                        </div>
                    </div>
                    
                    <div class="invoice-qr-section">
                        <div class="invoice-qr-placeholder">🔷</div>
                        <div class="invoice-qr-text">Scan to verify</div>
                    </div>
                    
                    <div class="invoice-footer">
                        <div class="invoice-footer-bold">Thank you for choosing Swap Gate!</div>
                        <div class="invoice-footer-text">This is an auto-generated invoice</div>
                        <div class="invoice-footer-text">For support: support@swapgate.com</div>
                    </div>
                </div>
                
                <div class="invoice-watermark">SWAP</div>
            </div>
        </body>
        </html>
    `;
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SwapGate-Invoice-${transaction.amount}-${Date.now().toString().slice(-6)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    return true;
}

// ========== TELEGRAM FUNCTIONS ==========
async function sendToTelegram(message) {
    try {
        // Use backend API instead of direct Telegram API call
        const response = await fetch('/api/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        console.log('Message response:', data);
        
        if (!data.ok) {
            throw new Error(data.error || 'Failed to send message');
        }
        return data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

async function sendFileToTelegram(fileData, fileName, caption) {
    try {
        // Send file through backend API
        const response = await fetch('/api/send-file', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fileBase64: fileData,
                fileName: fileName,
                caption: caption
            })
        });
        
        const data = await response.json();
        console.log('File response:', data);
        
        if (!data.ok) {
            throw new Error(data.error || 'Failed to send file');
        }
        return data;
    } catch (error) {
        console.error('Error sending file:', error);
        throw error;
    }
}

async function submitOrder() {
    const file = document.getElementById('receiptFile').files[0];
    const notes = document.getElementById('receiptNotes').value;
    const errorDiv = document.getElementById('uploadError');
    const successDiv = document.getElementById('uploadSuccess');
    
    if (!file) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Please select a receipt file!';
        return;
    }
    
    if (!currentTransaction) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'No transaction found!';
        return;
    }
    
    document.getElementById('loadingIndicator').style.display = 'flex';
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    try {
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                currentTransaction.notes = notes;
                
                if (!receipts[currentSession.username]) {
                    receipts[currentSession.username] = [];
                }
                
                const transaction = {
                    ...currentTransaction,
                    fileName: file.name,
                    notes: notes,
                    status: 'pending',
                    submittedAt: new Date().toLocaleString()
                };
                
                receipts[currentSession.username].push(transaction);
                localStorage.setItem('receipts', JSON.stringify(receipts));
                
                // Send messages sequentially
                // Message 1: ORDER HEADER
                const msg1 = `🔔 <b>NEW SWAP GATE ORDER</b> 🔔`;
                await sendToTelegram(msg1);
                
                // Small delay between messages
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Message 2: ACCOUNT NUMBER
                const msg2 = `${currentTransaction.bankDetails.accountNumber}`;
                await sendToTelegram(msg2);
                
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Message 3: BANK NAME
                const msg3 = `${currentTransaction.bankDetails.bankName}`;
                await sendToTelegram(msg3);
                
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Message 4: ACCOUNT HOLDER NAME
                const msg4 = `${currentTransaction.bankDetails.accountName}`;
                await sendToTelegram(msg4);
                
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Message 5: REST OF DETAILS
                const msg5 = `
                    💰 <b>Amount:</b> ${currentTransaction.amount} USDT
                    🌐 <b>Network:</b> ${currentTransaction.network.toUpperCase()}
                    📱 <b>Contact:</b> ${currentTransaction.customerNumber || 'Not provided'}
                    📝 <b>Notes:</b> ${notes || 'No notes'}
                    🕐 <b>Time:</b> ${new Date().toLocaleString()}`;
                await sendToTelegram(msg5);
                
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Message 6: ORDER END MARKER
                const msg6 = ``;
                await sendToTelegram(msg6);
                
                const caption = `Receipt for ${currentTransaction.amount} USDT - ${currentTransaction.bankDetails.accountName}`;
                await sendFileToTelegram(e.target.result, file.name, caption);
                
                // Auto-download invoice immediately
                autoDownloadInvoice(currentTransaction);
                
                document.getElementById('finalInvoiceSection').classList.remove('hidden');
                document.getElementById('invoicePreview').innerHTML = generateBeautifulInvoice(currentTransaction);
                
                document.getElementById('loadingIndicator').style.display = 'none';
                
                successDiv.style.display = 'block';
                successDiv.textContent = '✅ Order submitted successfully! Invoice downloaded automatically.';
                
                // Scroll to show success message
                document.getElementById('finalInvoiceSection').scrollIntoView({ behavior: 'smooth' });
                
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('loadingIndicator').style.display = 'none';
                errorDiv.style.display = 'block';
                errorDiv.textContent = 'Error: ' + error.message;
            }
        };
        
        reader.onerror = function(error) {
            console.error('FileReader error:', error);
            document.getElementById('loadingIndicator').style.display = 'none';
            errorDiv.style.display = 'block';
            errorDiv.textContent = 'Error reading file';
        };
        
        reader.readAsDataURL(file);
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loadingIndicator').style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Error: ' + error.message;
    }
}

function downloadInvoice() {
    if (!currentTransaction) {
        alert('No transaction found!');
        return;
    }
    
    autoDownloadInvoice(currentTransaction);
}
