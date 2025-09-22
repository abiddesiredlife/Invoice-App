window.onload = function() {
    let lastInvoice = localStorage.getItem('lastInvoice') || 1000;
    document.getElementById('invoiceNo').value = parseInt(lastInvoice) + 1;
    attachInputListeners();
    updateTotals();
};

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
    attachInputListeners();
    updateTotals();
}

function attachInputListeners() {
    document.querySelectorAll('input').forEach(input => {
        input.removeEventListener('input', updateTotals);
        input.addEventListener('input', updateTotals);
    });
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
    document.getElementById('totalWords').textContent = `Total in Words: ${numberToWords(total)}`;
}

function convertLessThanThousand(num) {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if (num === 0) return '';
    if (num < 10) return units[num];
    if (num < 20) return teens[num - 10];
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    let str = tens[ten];
    if (unit > 0) str += ' ' + units[unit];
    if (num < 100) return str;
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    str = units[hundred] + ' Hundred';
    if (remainder > 0) str += ' ' + convertLessThanThousand(remainder);
    return str;
}

function getWords(num) {
    if (num === 0) return '';
    if (num >= 1000000) return getWords(Math.floor(num / 1000000)) + ' Million ' + getWords(num % 1000000);
    if (num >= 1000) return getWords(Math.floor(num / 1000)) + ' Thousand ' + getWords(num % 1000);
    return convertLessThanThousand(num);
}

function numberToWords(num) {
    const numStr = num.toFixed(2).split('.');
    let whole = parseInt(numStr[0]);
    let decimal = parseInt(numStr[1]) || 0;
    let words = getWords(whole);
    if (words) words += ' Dollars';
    if (decimal > 0) words += ' and ' + getWords(decimal) + ' Cents';
    return words.trim();
}

function prepareStaticClone() {
    const original = document.querySelector('.invoice-container');
    const clone = original.cloneNode(true);
    clone.querySelectorAll('button').forEach(btn => btn.remove());
    clone.querySelector('#invoiceNo').outerHTML = `<span>${clone.querySelector('#invoiceNo').value}</span>`;
    clone.querySelector('#date').outerHTML = `<span>${clone.querySelector('#date').value}</span>`;
    const invoiceTo = clone.querySelector('.invoice-to');
    invoiceTo.innerHTML = `
        <h3>INVOICE TO</h3>
        <p><strong>Global Security Solution Pty Ltd</strong></p>
        <p>03 5263 1628</p>
        <p>accounts@gssvic.com.au</p>
    `;
    const tbody = clone.querySelector('#invoiceItems');
    const newTbody = document.createElement('tbody');
    document.querySelectorAll('#invoiceItems tr').forEach((row) => {
        const desc = row.querySelector('.description').value || 'N/A';
        const qty = parseFloat(row.querySelector('.quantity').value) || 0;
        const price = parseFloat(row.querySelector('.unit-price').value) || 0;
        const amount = qty * price;
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${desc}</td>
            <td>${qty}</td>
            <td>${price.toFixed(2)}</td>
            <td>${amount.toFixed(2)}</td>
        `;
        newTbody.appendChild(newRow);
    });
    tbody.parentNode.replaceChild(newTbody, tbody);
    const table = clone.querySelector('table');
    let thead = clone.querySelector('thead');
    if (!thead) {
        thead = document.createElement('thead');
        table.insertBefore(thead, table.firstChild);
    }
    thead.innerHTML = `<tr><th>Description</th><th>Qty</th><th>Unit Price ($)</th><th>Amount ($)</th></tr>`;
    const subtotal = parseFloat(document.getElementById('subtotal').textContent) || 0;
    const gst = parseFloat(document.getElementById('gst').textContent) || 0;
    const total = parseFloat(document.getElementById('total').textContent) || 0;
    clone.querySelector('#subtotal').textContent = subtotal.toFixed(2);
    clone.querySelector('#gst').textContent = gst.toFixed(2);
    clone.querySelector('#total').textContent = total.toFixed(2);
    clone.querySelector('#totalWords').textContent = `Total in Words: ${numberToWords(total)}`;
    table.style.border = '1px solid #000';
    clone.style.border = '1px solid #000';
    const style = document.createElement('style');
    style.innerHTML = `
        tr, td, th { page-break-inside: avoid; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 5px; line-height: 1.2; text-align: center; }
        h2, h3 { margin: 5px 0; }
        p { margin: 3px 0; }
        .invoice-container { font-size: 10pt; font-family: Arial, sans-serif; padding: 10px; margin: 0; }
        .header, .invoice-to { padding: 5px; margin-bottom: 5px; }
        .terms, .total-words { margin: 5px 0; }
    `;
    clone.appendChild(style);
    return clone;
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4',
        compress: true
    });
    const margin = 20;
    const pdfWidth = doc.internal.pageSize.getWidth() - 2 * margin;
    const pdfPageHeight = doc.internal.pageSize.getHeight() - 2 * margin;
    const scale = 2;
    const clone = prepareStaticClone();
    clone.style.width = `${pdfWidth}px`;
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    document.body.appendChild(clone);
    setTimeout(() => {
        html2canvas(clone, {
            scale: scale,
            useCORS: true,
            width: clone.offsetWidth,
            height: clone.scrollHeight,
            logging: true
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = clone.offsetWidth;
            const imgHeight = clone.scrollHeight;
            const ratio = pdfWidth / imgWidth;
            const scaledImgHeight = imgHeight * ratio;
            let y = 0;
            while (y < scaledImgHeight) {
                doc.addPage();
                const h = Math.min(pdfPageHeight, scaledImgHeight - y);
                const sourceY = (y / ratio);
                const sourceH = (h / ratio);
                doc.addImage(imgData, 'PNG', margin, margin, pdfWidth, h, undefined, 'FAST', 0, sourceY, canvas.width, sourceH * scale);
                y += h;
            }
            doc.deletePage(1); // Remove initial blank page if present
            doc.save('invoice.pdf');
            localStorage.setItem('lastInvoice', document.getElementById('invoiceNo').value);
            document.body.removeChild(clone);
        }).catch(error => {
            console.error('PDF Generation Error:', error);
            alert('PDF generation failed. Check console for details.');
        });
    }, 1000); // Increased delay for complex rendering
}

function generateJPEG() {
    const clone = prepareStaticClone();
    clone.style.width = '750px';
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    document.body.appendChild(clone);
    html2canvas(clone, {
        scale: 2,
        useCORS: true,
        width: clone.offsetWidth,
        height: clone.scrollHeight,
        logging: true
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'invoice.jpg';
        link.href = canvas.toDataURL('image/jpeg', 1.0);
        link.click();
        document.body.removeChild(clone);
    }).catch(error => {
        console.error('JPEG Generation Failed:', error);
        alert('JPEG generation failed. Check console for details.');
    });
}
