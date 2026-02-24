import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PlacedApprovedStudentRow {
  name: string;
  registerNumber?: string;
  department?: string;
  section?: string;
  gpa?: number;
  isPlaced?: boolean;
  approvedCompany?: string;
}

export const exportPlacedApprovedStudentsPdf = (
  students: PlacedApprovedStudentRow[],
  filenamePrefix: string
) => {
  const doc = new jsPDF({ orientation: 'landscape' });
  const generatedDate = new Date().toLocaleString();

  doc.setFontSize(16);
  doc.text('Placed / Approved Students List', 14, 14);
  doc.setFontSize(10);
  doc.text(`Generated: ${generatedDate}`, 14, 20);

  autoTable(doc, {
    startY: 26,
    head: [['#', 'Name', 'Register No', 'Department', 'Section', 'GPA', 'Status', 'Approved Company']],
    body: students.map((student, index) => [
      index + 1,
      student.name || 'N/A',
      student.registerNumber || 'N/A',
      student.department || 'N/A',
      student.section || 'N/A',
      typeof student.gpa === 'number' ? student.gpa.toFixed(2) : 'N/A',
      student.isPlaced ? 'Placed' : 'Approved',
      student.approvedCompany || 'N/A',
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 2,
    },
    headStyles: {
      fontSize: 9,
      fillColor: [41, 128, 185],
    },
    didDrawPage: (data) => {
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.text(`Page ${data.pageNumber} of ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 6);
    },
  });

  const datePart = new Date().toISOString().split('T')[0];
  doc.save(`${filenamePrefix}-${datePart}.pdf`);
};