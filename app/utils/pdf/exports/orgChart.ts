import jsPDF from 'jspdf'
import { captureElement, openPdfInNewTab } from '../shared/pdfBase'
import { addPdfHeaderLandscape } from '../shared/pdfHeader'

export const exportOrgChart = async (
  element: HTMLElement,
  t: (key: string, params?: any) => string
) => {
  const canvas = await captureElement(element)
  const imgData = canvas.toDataURL('image/png')

  const imgWidth = canvas.width
  const imgHeight = canvas.height
  const ratio = imgWidth / imgHeight

  const pdfWidth = 297
  const pdfHeight = 210
  const margin = 20

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  })

  // Header mit Logo rechts oben und Trennlinie
  const contentStartY = addPdfHeaderLandscape(
    doc,
    'Organigramm',
    `Erstellt am: ${new Date().toLocaleDateString('de-DE')}`
  )

  // Berechne verfügbaren Platz für Bild
  const availableHeight = pdfHeight - contentStartY - 15
  let finalWidth = pdfWidth - (2 * margin)
  let finalHeight = finalWidth / ratio

  if (finalHeight > availableHeight) {
    finalHeight = availableHeight
    finalWidth = finalHeight * ratio
  }

  // Bild zentriert einfügen
  const x = (pdfWidth - finalWidth) / 2
  const y = contentStartY

  doc.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight)

  openPdfInNewTab(doc)
}
