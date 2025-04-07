import { Incident } from "@shared/schema";

// Helper to format a date for export
const formatDate = (date: Date | string | null): string => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Function to export incidents to CSV
export const exportToCSV = (incidents: Incident[]): void => {
  // CSV headers
  const headers = [
    'Incident ID',
    'Title',
    'Description',
    'Priority',
    'Category',
    'Status',
    'Assigned To',
    'Created Date',
    'Due Date',
    'Resolved Date'
  ];

  // Convert incidents to CSV rows
  const rows = incidents.map(incident => [
    incident.incidentId,
    incident.title,
    incident.description || '',
    incident.priority,
    incident.category,
    incident.status,
    incident.assignedTo || '',
    formatDate(incident.createdAt),
    formatDate(incident.dueDate),
    formatDate(incident.resolvedAt)
  ]);

  // Add headers to the beginning
  rows.unshift(headers);

  // Convert to CSV string
  const csv = rows.map(row => row.map(value => 
    `"${String(value).replace(/"/g, '""')}"`
  ).join(',')).join('\n');

  // Create a blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `incidents_export_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Function to export incidents to PDF (using browser print for MVP)
export const exportToPDF = (incidents: Incident[]): void => {
  // Create a printable HTML representation
  const html = `
    <html>
      <head>
        <title>Incidents Report</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .report-title { text-align: center; margin-bottom: 20px; }
          .incident-priority-critical { color: #dc2626; }
          .incident-priority-high { color: #ea580c; }
          .incident-priority-medium { color: #f59e0b; }
          .incident-priority-low { color: #65a30d; }
          .incident-status-open { color: #6b7280; }
          .incident-status-in-progress { color: #3b82f6; }
          .incident-status-resolved { color: #10b981; }
          .incident-status-closed { color: #1e293b; }
        </style>
      </head>
      <body>
        <h1 class="report-title">Incident Report - ${new Date().toLocaleDateString()}</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Priority</th>
              <th>Category</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            ${incidents.map(incident => `
              <tr>
                <td>${incident.incidentId}</td>
                <td>${incident.title}</td>
                <td class="incident-priority-${incident.priority}">${incident.priority}</td>
                <td>${incident.category}</td>
                <td class="incident-status-${incident.status}">${incident.status}</td>
                <td>${formatDate(incident.createdAt)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  // Open a new window with the HTML content
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
