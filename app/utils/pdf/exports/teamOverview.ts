import jsPDF from 'jspdf'
import { captureElement, openPdfInNewTab } from '../shared/pdfBase'
import { addPdfHeaderPortrait } from '../shared/pdfHeader'

export const exportTeamOverview = async (
  element: HTMLElement,
  teams: any[],
  t: (key: string, params?: any) => string
) => {
  const canvas = await captureElement(element)
  const imgData = canvas.toDataURL('image/png')

  const imgWidth = canvas.width
  const imgHeight = canvas.height
  const ratio = imgWidth / imgHeight

  const pdfWidth = 210
  const pdfHeight = 297
  const margin = 15

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // Statistik
  const totalTeams = teams.length
  const totalMembers = teams.reduce((sum: number, t: any) => sum + (t.members?.length || 0), 0)

  // Header mit Logo rechts oben
  const contentStartY = addPdfHeaderPortrait(
    doc,
    'Teamübersicht',
    `Erstellt am: ${new Date().toLocaleDateString('de-DE')}\n${totalTeams} Teams | ${totalMembers} Mitarbeiter`
  )

  let finalWidth = pdfWidth - (2 * margin)
  let finalHeight = finalWidth / ratio

  const maxHeightPerPage = pdfHeight - contentStartY - 15

  if (finalHeight <= maxHeightPerPage) {
    const x = margin
    const y = contentStartY
    doc.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight)
  } else {
    // Multi-page
    let currentY = 0
    let pageNum = 0

    while (currentY < imgHeight) {
      if (pageNum > 0) {
        doc.addPage()
      }

      const sourceY = currentY
      const sourceHeight = Math.min(imgHeight - currentY, (maxHeightPerPage / finalHeight) * imgHeight)
      const destHeight = (sourceHeight / imgHeight) * finalHeight

      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = imgWidth
      tempCanvas.height = sourceHeight
      const tempCtx = tempCanvas.getContext('2d')

      if (tempCtx) {
        tempCtx.drawImage(canvas, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight)
        const tempImgData = tempCanvas.toDataURL('image/png')

        const startY = pageNum === 0 ? contentStartY : 15
        doc.addImage(tempImgData, 'PNG', margin, startY, finalWidth, destHeight)
      }

      currentY += sourceHeight
      pageNum++
    }
  }

  openPdfInNewTab(doc)
}
