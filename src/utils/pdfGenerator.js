import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateSalesPdf = (sales, startDate, endDate, totalSales) => {
    const doc = new jsPDF();

    // --- Header ---
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text('ROSS & FLOR', 105, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.text('Reporte de Ventas', 105, 30, { align: 'center' });

    // --- Date Range ---
    doc.setFontSize(10);
    doc.setTextColor(100);
    const dateText = (startDate && endDate)
        ? `Período: ${startDate} al ${endDate}`
        : 'Período: Histórico Completo';
    doc.text(dateText, 105, 38, { align: 'center' });

    // --- Totals Summary Box ---
    doc.setDrawColor(0);
    doc.setFillColor(245, 245, 245);
    doc.rect(140, 45, 60, 20, 'F');

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('Venta Total en el Periodo:', 170, 52, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 100, 0); // Dark Green
    doc.text(`S/. ${totalSales.toFixed(2)}`, 170, 60, { align: 'center' });

    // --- Table ---
    const tableColumn = ["Fecha", "Hora", "Modo Pago", "Total (S/.)"];
    const tableRows = [];

    sales.forEach(sale => {
        const dateObj = new Date(sale.fechaHora);
        const dateStr = dateObj.toLocaleDateString('es-PE');
        const timeStr = dateObj.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

        const saleData = [
            dateStr,
            timeStr,
            sale.modoPago || 'N/A',
            sale.totalFinal ? sale.totalFinal.toFixed(2) : '0.00'
        ];
        tableRows.push(saleData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 75,
        theme: 'grid',
        headStyles: { fillColor: [60, 60, 60] },
        styles: { fontSize: 10, cellPadding: 3 },
        alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    // --- Footer ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
        doc.text(`Generado el: ${new Date().toLocaleString()}`, 200, 290, { align: 'right' });
    }

    doc.save('Reporte_Ventas.pdf');
};
