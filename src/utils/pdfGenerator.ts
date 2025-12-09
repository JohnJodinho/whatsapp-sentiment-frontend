import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

export const downloadDashboardPDF = async (elementId: string, fileName: string = "dashboard-analysis.pdf") => {
  const element = document.getElementById(elementId);

  if (!element) {
    toast.error("Could not find dashboard content.");
    return;
  }

  try {
    // 1. Convert DOM to image
    const dataUrl = await toPng(element, { 
      cacheBust: true, 
      pixelRatio: 2, // Higher quality
      backgroundColor: "#ffffff", // Force white background
    });

    // 2. Load image to calculate dimensions
    const img = new Image();
    img.src = dataUrl;
    
    img.onload = () => {
      const imgWidth = img.width;
      const imgHeight = img.height;

      // 3. Create PDF with exact dimensions of the image (adaptive size)
      const orientation = imgWidth > imgHeight ? 'l' : 'p';
      
      const pdf = new jsPDF({
        orientation,
        unit: 'px',
        format: [imgWidth, imgHeight]
      });

      // 4. Add image to PDF
      pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(fileName);
      
      toast.success("Report downloaded successfully!");
    };

  } catch (error) {
    console.error("PDF Generation Error:", error);
    toast.error("Failed to generate PDF. Please try again.");
  }
};