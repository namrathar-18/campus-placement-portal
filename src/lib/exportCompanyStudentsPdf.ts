import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface CompanyStudentPdfRow {
  name: string;
  registerNumber?: string;
  department?: string;
  email?: string;
  status: string;
  appliedDate?: string;
}

export const exportCompanyStudentsPdf = ({
  companyName,
  reportType,
  students,
}: {
  companyName: string;
  reportType: 'applied' | 'approved';
  students: CompanyStudentPdfRow[];
}) => {
  const doc = new jsPDF();
  const generatedDate = new Date().toLocaleString();
  const reportTitle = reportType === 'applied' ? 'Applied Students' : 'Approved Students';

  doc.setFontSize(16);
  doc.text(`${companyName} - ${reportTitle}`, 14, 14);
  doc.setFontSize(10);
  doc.text(`Generated: ${generatedDate}`, 14, 20);

  autoTable(doc, {
    startY: 26,
    head: [['#', 'Name', 'Register No', 'Department', 'Email', 'Status', 'Applied Date']],
    body: students.map((student, index) => [
      index + 1,
      student.name || 'N/A',
      student.registerNumber || 'N/A',
      student.department || 'N/A',
      student.email || 'N/A',
      student.status || 'N/A',
      student.appliedDate || 'N/A',
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 2,
    },
    headStyles: {
      fontSize: 9,
      fillColor: [41, 128, 185],
    },
  });

  const safeCompanyName = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const datePart = new Date().toISOString().split('T')[0];
  doc.save(`${safeCompanyName}-${reportType}-students-${datePart}.pdf`);
};