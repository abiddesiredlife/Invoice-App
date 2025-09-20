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

function convertLessThanHundred(num) {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if (num === 0) return '';
    if (num < 10) return units[num];
    if (num < 20) return teens[num - 10];
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    return tens[ten] + (unit ? ' ' + units[unit] : '');
}

function numberToWords(num) {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const numStr = num.toFixed(2).split('.');
    let whole = parseInt(numStr[0]);
    let decimal = parseInt(numStr[1]) || 0;
    let words = '';

    if (whole === 0 && decimal === 0) return 'Zero Dollars';

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
        words += convertLessThanHundred(whole);
    }

    if (words) words += ' Dollars';
    if (decimal > 0) {
        words += ' and ' + convertLessThanHundred(decimal) + ' Cents';
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
    // Rebuild table with all data
    const tbody = clone.querySelector('tbody');
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
        newRow.style.pageBreakInside = 'avoid'; // Prevent row splitting
        newTbody.appendChild(newRow);
    });
    tbody.parentNode.replaceChild(newTbody, tbody);
    // Ensure table headers
    const thead = clone.querySelector('thead');
    if (!thead) {
        const table = clone.querySelector('table');
        const newThead = document.createElement('thead');
        newThead.innerHTML = `<tr><th>Description</th><th>Qty</th><th>Unit Price ($)</th><th>Amount ($)</th></tr>`;
        table.insertBefore(newThead, table.firstChild);
    }
    thead.querySelectorAll('th').forEach(th => th.style.pageBreakInside = 'avoid');
    // Update totals
    const subtotal = parseFloat(document.getElementById('subtotal').textContent) || 0;
    const gst = parseFloat(document.getElementById('gst').textContent) || 0;
    const total = parseFloat(document.getElementById('total').textContent) || 0;
    clone.querySelector('#subtotal').textContent = subtotal.toFixed(2);
    clone.querySelector('#gst').textContent = gst.toFixed(2);
    clone.querySelector('#total').textContent = total.toFixed(2);
    clone.querySelector('#totalWords').textContent = `Total in Words: ${numberToWords(total)}`;
    // Add borders
    clone.querySelector('table').style.border = '1px solid #000';
    clone.style.border = '1px solid #000';
    // Add style to prevent page breaks inside rows
    const style = document.createElement('style');
    style.innerHTML = `
        tr, td, th { page-break-inside: avoid; }
        table { width: 100%; }
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
    const clone = prepareStaticClone();
    clone.style.width = '750px'; // A4 width in points approx.
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    document.body.appendChild(clone);
    // Force layout reflow
    clone.offsetHeight;
    const opt = {
        callback: function (doc) {
            doc.save('invoice.pdf');
            document.body.removeChild(clone);
        },
        margin: [30, 30, 30, 30], // Reduced margins to fit more content
        autoPaging: 'text',
        html2canvas: {
            scale: 2,
            dpi: 300,
            letterRendering: true,
            useCORS: true,
            width: clone.offsetWidth,
            height: clone.scrollHeight,
            windowWidth: clone.offsetWidth,
            windowHeight: clone.scrollHeight
        }
    };
    doc.html(clone, opt).catch(error => console.error('PDF Generation Error:', error));
}

function generateJPEG() {
    const clone = prepareStaticClone();
    clone.style.width = '750px';
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    document.body.appendChild(clone);
    // Force layout reflow
    clone.offsetHeight;
    html2canvas(clone, {
        scale: 2,
        useCORS: true,
        width: clone.offsetWidth,
        height: clone.scrollHeight,
        windowWidth: clone.offsetWidth,
        windowHeight: clone.scrollHeight,
        logging: true // Enable logging for debugging
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'invoice.jpg';
        link.href = canvas.toDataURL('image/jpeg', 1.0);
        link.click();
        document.body.removeChild(clone);
    }).catch(error => {
        console.error('JPEG Generation Failed:', error);
        alert('JPEG generation failed. Check browser console for details.');
    });
}
