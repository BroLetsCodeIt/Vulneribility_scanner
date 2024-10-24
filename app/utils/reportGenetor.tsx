// /app/utils/reportGenerator.ts

import jsPDF from 'jspdf';

export function generatePDFReport(scanResult: any, url: string) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(`Security Scan Report for ${url}`, 10, 10);

  doc.setFontSize(14);
  doc.text('SSL/TLS Certificate:', 10, 30);
  doc.text(scanResult.sslValid ? 'Valid' : 'Invalid', 60, 30);

  doc.text('XSS Vulnerable:', 10, 40);
  doc.text(scanResult.xssVulnerable ? 'Yes' : 'No', 60, 40);

  doc.text('SQL Injection Vulnerable:', 10, 50);
  doc.text(scanResult.sqlInjectionVulnerable ? 'Yes' : 'No', 60, 50);

  doc.text('Missing Security Headers:', 10, 60);
  if(scanResult.missingHeaders.length > 0) {
    scanResult.missingHeaders.forEach((header: string, index: number) => {
        doc.text(`${header}`, 10, 70 + index * 10);
      })
   }else{
     doc.text('None', 60, 60);
   }
  doc.text('Open Ports:', 10, 80);
  scanResult.openPorts.forEach((port: any, index: number) => {
    doc.text(`${port.port}: ${port.status}`, 60, 90 + index * 10);
  });

  doc.save(`scan_report_${url}.pdf`);
}
