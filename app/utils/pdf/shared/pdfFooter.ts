import type { jsPDF } from 'jspdf'

export const addPdfFooter = (doc: jsPDF, pageText: (current: number, total: number) => string) => {
  const pageCount = doc.internal.getNumberOfPages()
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(9)
    doc.setTextColor(128, 128, 128)
    
    const text = pageText(i, pageCount)
    const pageWidth = doc.internal.pageSize.getWidth()
    const textWidth = doc.getTextWidth(text)
    
    // Zentriert am unteren Rand
    doc.text(text, (pageWidth - textWidth) / 2, doc.internal.pageSize.getHeight() - 10)
  }
}
