import { PDFDocument, rgb } from "pdf-lib";

export interface ExportOptions {
  format: "csv" | "pdf";
  dataType: "applications" | "jobs" | "messages" | "earnings";
  startDate?: Date;
  endDate?: Date;
}

// Экспорт в CSV
export function exportToCSV(data: any[], headers: string[]): string {
  const csvHeaders = headers.join(",");
  const csvRows = data.map((row) => {
    return headers.map((header) => {
      const value = row[header];
      if (typeof value === "string" && value.includes(",")) {
        return `"${value}"`;
      }
      return value || "";
    }).join(",");
  });
  
  return [csvHeaders, ...csvRows].join("\n");
}

// Экспорт в PDF
export async function exportToPDF(data: any[], title: string, headers: string[]): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const pageSize = page.getSize();
  const height = pageSize.height;
  
  let yPosition = height - 50;
  let currentPage = page;
  
  // Заголовок
  currentPage.drawText(title, {
    x: 50,
    y: yPosition,
    size: 18,
    color: rgb(0, 0, 0),
  });
  
  yPosition -= 40;
  
  // Таблица заголовков
  const columnWidth = 500 / headers.length;
  headers.forEach((header, index) => {
    currentPage.drawText(header, {
      x: 50 + index * columnWidth,
      y: yPosition,
      size: 10,
      color: rgb(0.2, 0.2, 0.2),
    });
  });
  
  yPosition -= 20;
  
  // Данные
  data.forEach((row) => {
    if (yPosition < 50) {
      currentPage = pdfDoc.addPage([595, 842]);
      yPosition = height - 50;
    }
    
    headers.forEach((header, index) => {
      const value = String(row[header] || "");
      currentPage.drawText(value, {
        x: 50 + index * columnWidth,
        y: yPosition,
        size: 9,
        color: rgb(0, 0, 0),
      });
    });
    
    yPosition -= 15;
  });
  
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

// Подготовка данных для экспорта
export async function prepareExportData(
  userId: number,
  options: ExportOptions
): Promise<any[]> {
  return [];
}

// Генерация имени файла для экспорта
export function generateExportFileName(dataType: string, format: string): string {
  const timestamp = new Date().toISOString().split("T")[0];
  return `${dataType}_${timestamp}.${format}`;
}

// Валидация параметров экспорта
export function validateExportOptions(options: ExportOptions): boolean {
  if (!["csv", "pdf"].includes(options.format)) {
    return false;
  }
  
  if (!["applications", "jobs", "messages", "earnings"].includes(options.dataType)) {
    return false;
  }
  
  if (options.startDate && options.endDate && options.startDate > options.endDate) {
    return false;
  }
  
  return true;
}

// Основная функция экспорта
export async function exportUserData(
  userId: number,
  options: ExportOptions
): Promise<{ fileName: string; data: string | Buffer }> {
  if (!validateExportOptions(options)) {
    throw new Error("Invalid export options");
  }
  
  const data = await prepareExportData(userId, options);
  const fileName = generateExportFileName(options.dataType, options.format);
  
  if (options.format === "csv") {
    const headers = getHeadersForDataType(options.dataType);
    const csvData = exportToCSV(data, headers);
    return { fileName, data: csvData };
  } else {
    const title = getTitleForDataType(options.dataType);
    const headers = getHeadersForDataType(options.dataType);
    const pdfData = await exportToPDF(data, title, headers);
    return { fileName, data: pdfData };
  }
}

function getHeadersForDataType(dataType: string): string[] {
  const headersMap: Record<string, string[]> = {
    applications: ["id", "jobTitle", "status", "appliedAt", "salary"],
    jobs: ["id", "title", "category", "salary", "createdAt"],
    messages: ["id", "sender", "content", "timestamp"],
    earnings: ["id", "amount", "source", "date", "status"],
  };
  
  return headersMap[dataType] || [];
}

function getTitleForDataType(dataType: string): string {
  const titlesMap: Record<string, string> = {
    applications: "История откликов",
    jobs: "Мои вакансии",
    messages: "История сообщений",
    earnings: "История доходов",
  };
  
  return titlesMap[dataType] || "Экспорт данных";
}
