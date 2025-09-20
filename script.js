            document.body.removeChild(clone);
        },
        margin: [40, 40, 40, 40],
        autoPaging: 'text',
        html2canvas: {
            scale: 2,
            dpi: 300,
            letterRendering: true,
            useCORS: true,
            width: 750 // Match A4 width in points
        }
    };
    doc.html(clone, opt).then(() => document.body.removeChild(clone));
}

function generateJPEG() {
    const clone = prepareStaticClone();
    clone.style.width = '750px'; // Match A4 width
    document.body.appendChild(clone);
    html2canvas(clone, {
        scale: 2,
        useCORS: true,
        width: 750,
        windowWidth: 750
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'invoice.jpg';
        link.href = canvas.toDataURL('image/jpeg', 1.0);
        link.click();
        document.body.removeChild(clone);
    }).catch(error => {
        console.error('JPEG Generation Failed:', error);
        alert('Failed to generate JPEG. Check console for details.');
    });
}
