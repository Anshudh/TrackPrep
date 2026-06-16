class PdfService {
  async generateAnalyticsPdf(userId, analyticsData) {
    try {
      // Dynamic import to handle optional pdfkit library dependencies
      const PDFDocument = await import('pdfkit');
      
      return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });
        
        doc.on('error', (err) => {
          reject(err);
        });

        // 1. Report Header
        doc.fontSize(22).fillColor('#1e1b4b').text('TrackPrep - Student Performance Analytics', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).fillColor('#4b5563').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
        doc.text(`User Reference: ID-${userId}`, { align: 'right' });
        doc.moveDown(2);

        // 2. Report Overview Table/Visual Metrics
        doc.fontSize(14).fillColor('#1e1b4b').text('Performance Metrics Summary:', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#111827')
           .text(`• Total Solved Coding Problems: ${analyticsData.totalProblems || 0}`)
           .text(`• Total Job Applications Logged: ${analyticsData.totalApplications || 0}`)
           .text(`• Active Pending Planner Tasks: ${analyticsData.pendingTasks || 0}`);
        doc.moveDown(1.5);

        // 3. Footer
        doc.fontSize(10).fillColor('#9ca3af').text('TrackPrep analytics report is compiled dynamically from the relational query services.', { align: 'center' });

        doc.end();
      });
    } catch (err) {
      console.warn('PDFKit not installed. Serving structured text/markdown report stream.', err.message);
      
      // Fallback text buffer format
      const textReport = `
=============================================================
                  TRACKPREP ANALYTICS REPORT                 
=============================================================
Generated on: ${new Date().toLocaleString()}
User Reference: ID-${userId}

Performance Summary:
* Total Solved Problems: ${analyticsData.totalProblems || 0}
* Total Job Applications: ${analyticsData.totalApplications || 0}
* Active Pending Tasks: ${analyticsData.pendingTasks || 0}
=============================================================
      `;
      return Buffer.from(textReport, 'utf-8');
    }
  }
}

export default new PdfService();
