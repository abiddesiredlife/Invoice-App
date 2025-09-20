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
    if (num < 100) {
        const ten = Math.floor(num / 10);
        const unit = num % 10;
        return tens[ten] + (unit ? ' ' + units[unit] : '');
    }
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    return units[hundred] + ' Hundred' + (remainder ? ' ' + convertLessThanThousand(remainder) : '');
}

function getWords(num) {
    if (num === 0) return '';
    if (num >= 1000000) {
        return getWords(Math.floor(num / 1000000)) + ' Million ' + getWords(num % 1000000);
    }
    if (num >= 1000) {
        return getWords(Math.floor(num / 1000)) + ' Thousand ' + getWords(num % 1000);
    }
    return convertLessThanThousand(num);
}

function numberToWords(num) {
    const numStr = num.toFixed(2).split('.');
    let whole = parseInt(numStr[0]);
    let decimal = parseInt(numStr[1]) || 0;
    let words = getWords(whole);
    if (words) words += ' Dollars';
    if (decimal > 0) {
        words += ' and ' + getWords(decimal) + ' Cents';
    }
    return words.trim();
}

attachInputListeners();
updateTotals();

function prepareStaticClone() {
    const original = document.querySelector('.invoice-container');
    const clone = original.cloneNode(true);
    // Remove buttons
    clone.querySelectorAll('button').forEach(btn => btn.remove());
    // Ensure INVOICE TO section
    const invoiceTo = clone.querySelector('.invoice-to');
    invoiceTo.innerHTML = `
        <h3>INVOICE TO</h3>
        <p><strong>Global Security Solution Pty Ltd</strong></p>
        <p>03 5263 1628</p>
        <p>accounts@gssvic.com.au</p>
    `;
    // Rebuild table with all data
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
        newRow.style.pageBreakInside = 'avoid';
        newTbody.appendChild(newRow);
    });
    tbody.parentNode.replaceChild(newTbody, tbody);
    // Ensure table headers
    const table = clone.querySelector('table');
    let thead = clone.querySelector('thead');
    if (!thead) {
        thead = document.createElement('thead');
        table.insertBefore(thead, table.firstChild);
    }
    thead.innerHTML = `<tr><th>Description</th><th>Qty</th><th>Unit Price ($)</th><th>Amount ($)</th></tr>`;
    thead.querySelectorAll('th').forEach(th => th.style.pageBreakInside = 'avoid');
    // Update totals
    const subtotal = parseFloat(document.getElementById('subtotal').textContent) || 0;
    const gst = parseFloat(document.getElementById('gst').textContent) || 0;
    const total = parseFloat(document.getElementById('total').textContent) || 0;
    clone.querySelector('#subtotal').textContent = subtotal.toFixed(2);
    clone.querySelector('#gst').textContent = gst.toFixed(2);
    clone.querySelector('#total').textContent = total.toFixed(2);
    clone.querySelector('#totalWords').textContent = `Total in Words: ${numberToWords(total)}`;
    // Add borders and styles
    table.style.border = '1px solid #000';
    clone.style.border = '1px solid #000';
    const style = document.createElement('style');
    style.innerHTML = `
        tr, td, th { page-break-inside: avoid; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 8px; }
        h3 { margin-bottom: 10px; }
        .invoice-container { font-size: 12pt; font-family: Arial, sans-serif; }
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
    const margin = 40;
    const pdfWidth = doc.internal.pageSize.getWidth() - 2 * margin;
    const pdfHeight = doc.internal.pageSize.getHeight() - 2 * margin;
    const clone = prepareStaticClone();
    clone.style.width = `${pdfWidth}px`; // Fit to PDF width
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    document.body.appendChild(clone);
    setTimeout(() => {
        html2canvas(clone, {
            scale: 2,
            useCORS: true,
            width: clone.offsetWidth,
            height: clone.scrollHeight,
            logging: true
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = canvas.width / 2; // Adjust for scale
            const imgHeight = canvas.height / 2;
            const ratio = pdfWidth / imgWidth;
            const scaledImgHeight = imgHeight * ratio;
            let positionY = 0;
            let heightLeft = scaledImgHeight;
            doc.addImage(imgData, 'PNG', margin, margin + positionY, pdfWidth, scaledImgHeight);
            heightLeft -= pdfHeight;
            while (heightLeft > 0) {
                positionY = heightLeft - scaledImgHeight;
                doc.addPage();
                doc.addImage(imgData, 'PNG', margin, margin + positionY, pdfWidth, scaledImgHeight);
                heightLeft -= pdfHeight;
            }
            doc.save('invoice.pdf');
            document.body.removeChild(clone);
        }).catch(error => {
            console.error('PDF Generation Error:', error);
            alert('PDF generation failed. Check console for details.');
        });
    }, 500); // Increased delay for rendering
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
