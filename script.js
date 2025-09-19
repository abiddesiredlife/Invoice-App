function addItem() {
    const tbody = document.getElementById('invoiceItems');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" class="description" placeholder="Enter description"></td>
        <td><input type="number" class="quantity" min="1" value="1"></td>
        <td><input type="number" step="0.01" class="unit-price" min="0" value="0.00"></td>
        <td class="amount">0.00</td>
    `;
    tbody.appendChild(row);
    updateTotals();
}

function updateTotals() {
    let subtotal = 0;
    document.querySelectorAll('#invoiceItems tr').forEach(row => {
        const qty = parseFloat(row.querySelector('.quantity').value) || 0;
        const price = parseFloat(row.querySelector('.unit-price').value) || 0;
        const amount = qty * price;
        row.querySelector('.amount').textContent = amount.toFixed(2);
        subtotal += amount;
    });
    const gst = subtotal * 0.1;
    const total = subtotal + gst;
    document.getElementById('subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('gst').textContent = gst.toFixed(2);
    document.getElementById('total').textContent = total.toFixed(2);
    document.getElementById('totalWords').textContent = `Total in Words: ${numberToWords(total)} Dollars`;
}

function numberToWords(num) {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const numStr = num.toString().split('.');
    let whole = Math.floor(parseFloat(numStr[0]));
    let decimal = numStr.length > 1 ? Math.round(parseFloat('0.' + numStr[1]) * 100) : 0;
    let words = '';

    if (whole === 0) return 'Zero';
    if (whole >= 1000000) {
        words += numberToWords(Math.floor(whole / 1000000)) + ' Million ';
        whole %= 1000000;
    }
    if (whole >= 1000) {
        words += numberToWords(Math.floor(whole / 1000)) + ' Thousand ';
        whole %= 1000;
    }
    if (whole >= 100) {
        words += numberToWords(Math.floor(whole / 100)) + ' Hundred ';
        whole %= 100;
    }
    if (whole > 0) {
        if (whole < 10) words += units[whole];
        else if (whole < 20) words += teens[whole - 10];
        else {
            words += tens[Math.floor(whole / 10)];
            if (whole % 10 > 0) words += '-' + units[whole % 10];
        }
    }
    if (decimal > 0) words += ' and ' + units[decimal] + ' Cents';
    return words.trim();
}

document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', updateTotals);
});

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.html(document.querySelector('.invoice-container'), {
        callback: function (doc) {
            doc.save('invoice.pdf');
        },
        x: 10,
        y: 10
    });
}

function generateJPEG() {
    html2canvas(document.querySelector('.invoice-container')).then(canvas => {
        const link = document.createElement('a');
        link.download = 'invoice.jpg';
        link.href = canvas.toDataURL('image/jpeg', 1.0); // 1.0 for HD quality
        link.click();
    });
}

updateTotals(); // Initial calculation
