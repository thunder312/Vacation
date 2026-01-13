export const captureElement = async (element: HTMLElement) => {
  const html2canvas = (await import('html2canvas')).default
  
  return await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    logging: false,
    useCORS: true
  })
}

export const openPdfInNewTab = (doc: any) => {
  const pdfBlob = doc.output('blob')
  const pdfUrl = URL.createObjectURL(pdfBlob)
  window.open(pdfUrl, '_blank')
  setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000)
}
