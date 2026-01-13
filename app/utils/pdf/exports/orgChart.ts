import jsPDF from 'jspdf'
import { captureElement, openPdfInNewTab } from '../shared/pdfBase'
import { addPdfHeaderLandscape } from '../shared/pdfHeader'

// Hilfsfunktion: Finde optimale Schnittposition (in Zwischenräumen)
const findBestCutPosition = (
  canvas: HTMLCanvasElement,
  startY: number,
  idealY: number,
  maxY: number,
  searchRange: number = 50
): number => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return idealY

  const width = canvas.width

  // Suche im Bereich idealY +/- searchRange nach einer "leeren" Zeile
  const minSearch = Math.max(startY + 100, idealY - searchRange)
  const maxSearch = Math.min(maxY - 50, idealY + searchRange)

  let bestY = idealY
  let bestScore = -1

  for (let y = minSearch; y < maxSearch; y++) {
    // Prüfe ob diese Zeile "leer" ist (einheitliche helle Farbe)
    const imageData = ctx.getImageData(0, y, width, 3)
    const data = imageData.data

    let isUniform = true
    let lightPixels = 0

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      // Prüfe ob Pixel hell ist (Hintergrund)
      if (r > 240 && g > 240 && b > 240) {
        lightPixels++
      }
    }

    // Score basierend auf Anteil heller Pixel
    const score = lightPixels / (width * 3)

    if (score > bestScore && score > 0.8) {
      bestScore = score
      bestY = y
    }
  }

  return bestY
}

// Hilfsfunktion: Finde optimale horizontale Schnittposition
const findBestHorizontalCutPosition = (
  canvas: HTMLCanvasElement,
  startX: number,
  idealX: number,
  maxX: number,
  searchRange: number = 50
): number => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return idealX

  const height = canvas.height

  const minSearch = Math.max(startX + 100, idealX - searchRange)
  const maxSearch = Math.min(maxX - 50, idealX + searchRange)

  let bestX = idealX
  let bestScore = -1

  for (let x = minSearch; x < maxSearch; x++) {
    const imageData = ctx.getImageData(x, 0, 3, height)
    const data = imageData.data

    let lightPixels = 0

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      if (r > 240 && g > 240 && b > 240) {
        lightPixels++
      }
    }

    const score = lightPixels / (height * 3)

    if (score > bestScore && score > 0.7) {
      bestScore = score
      bestX = x
    }
  }

  return bestX
}

export const exportOrgChart = async (
  element: HTMLElement,
  t: (key: string, params?: any) => string
) => {
  const canvas = await captureElement(element)

  const pdfWidth = 297 // A4 Landscape
  const pdfHeight = 210
  const margin = 15
  const headerHeight = 45 // Platz für Header
  const footerHeight = 12 // Platz für Footer/Schnittmarken

  // Verfügbarer Druckbereich pro Seite
  const printableWidth = pdfWidth - (2 * margin)
  const printableHeight = pdfHeight - headerHeight - footerHeight

  const imgWidthPx = canvas.width
  const imgHeightPx = canvas.height

  // Berechne Skalierung für beste Lesbarkeit
  // Wir wollen nicht zu klein skalieren - mindestens 0.5 der Originalgröße
  const scaleToFitWidth = printableWidth / (imgWidthPx * 0.264583) // px to mm (96 DPI)
  const scaleToFitHeight = printableHeight / (imgHeightPx * 0.264583)

  // Verwende eine vernünftige Skalierung
  const targetScale = Math.min(scaleToFitWidth, scaleToFitHeight, 1.0)
  const minScale = 0.4 // Nicht kleiner als 40%
  const actualScale = Math.max(targetScale, minScale)

  // Berechne finale Größe in mm
  const scaledWidthMm = imgWidthPx * 0.264583 * actualScale
  const scaledHeightMm = imgHeightPx * 0.264583 * actualScale

  // Berechne benötigte Seiten
  const colCount = Math.ceil(scaledWidthMm / printableWidth)
  const rowCount = Math.ceil(scaledHeightMm / printableHeight)
  const totalPages = colCount * rowCount

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  })

  if (totalPages === 1) {
    // Normaler Modus: Passt auf eine Seite
    const contentStartY = addPdfHeaderLandscape(
      doc,
      t('organization.orgChart'),
      `${t('organization.createdOn')}: ${new Date().toLocaleDateString('de-DE')}`
    )

    const x = (pdfWidth - scaledWidthMm) / 2
    const y = contentStartY

    const imgData = canvas.toDataURL('image/png')
    doc.addImage(imgData, 'PNG', x, y, scaledWidthMm, scaledHeightMm)

  } else {
    // Poster-Modus: Auf mehrere Seiten aufteilen
    // Header nur auf erster Seite - Folgeseiten haben mehr Platz
    const firstPageContentY = headerHeight
    const otherPageContentY = 10 // Nur kleiner Rand auf Folgeseiten
    const firstPagePrintableHeight = printableHeight
    const otherPagePrintableHeight = pdfHeight - otherPageContentY - footerHeight

    // Berechne Pixel pro Kachel (erste Seite kleiner, Rest größer)
    const pxPerCol = Math.floor(imgWidthPx / colCount)

    // Für Zeilen: erste Zeile bekommt weniger Pixel (wegen Header)
    const firstRowRatio = firstPagePrintableHeight / (firstPagePrintableHeight + (rowCount - 1) * otherPagePrintableHeight)
    const pxFirstRow = Math.floor(imgHeightPx * firstRowRatio)
    const pxOtherRows = Math.floor((imgHeightPx - pxFirstRow) / Math.max(1, rowCount - 1))

    // Finde optimale Schnittpositionen
    const cutPositionsX: number[] = [0]
    const cutPositionsY: number[] = [0]

    // Horizontale Schnitte (Spalten)
    for (let col = 1; col < colCount; col++) {
      const idealX = col * pxPerCol
      const bestX = findBestHorizontalCutPosition(canvas, cutPositionsX[col - 1], idealX, imgWidthPx)
      cutPositionsX.push(bestX)
    }
    cutPositionsX.push(imgWidthPx)

    // Vertikale Schnitte (Zeilen) - erste Zeile kleiner
    if (rowCount > 1) {
      const firstCutY = findBestCutPosition(canvas, 0, pxFirstRow, imgHeightPx)
      cutPositionsY.push(firstCutY)

      for (let row = 2; row < rowCount; row++) {
        const idealY = cutPositionsY[row - 1] + pxOtherRows
        const bestY = findBestCutPosition(canvas, cutPositionsY[row - 1], idealY, imgHeightPx)
        cutPositionsY.push(bestY)
      }
    }
    cutPositionsY.push(imgHeightPx)

    let pageNum = 0

    for (let row = 0; row < rowCount; row++) {
      for (let col = 0; col < colCount; col++) {
        if (pageNum > 0) {
          doc.addPage()
        }
        pageNum++

        const isFirstPage = pageNum === 1
        const contentY = isFirstPage ? firstPageContentY : otherPageContentY
        const availableHeight = isFirstPage ? firstPagePrintableHeight : otherPagePrintableHeight

        // Header nur auf erster Seite
        if (isFirstPage) {
          addPdfHeaderLandscape(
            doc,
            t('organization.orgChart'),
            `${t('organization.createdOn')}: ${new Date().toLocaleDateString('de-DE')}`
          )
        }

        // Berechne Quell-Koordinaten
        const srcX = cutPositionsX[col]
        const srcY = cutPositionsY[row]
        const srcWidth = cutPositionsX[col + 1] - srcX
        const srcHeight = cutPositionsY[row + 1] - srcY

        // Erstelle temporären Canvas für diese Kachel
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = srcWidth
        tempCanvas.height = srcHeight
        const ctx = tempCanvas.getContext('2d')

        if (ctx) {
          // Weißer Hintergrund
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, srcWidth, srcHeight)

          // Zeichne den Ausschnitt
          ctx.drawImage(
            canvas,
            srcX, srcY, srcWidth, srcHeight,
            0, 0, srcWidth, srcHeight
          )

          const imgData = tempCanvas.toDataURL('image/png')

          // Berechne Zielgröße in mm
          const tileWidthMm = srcWidth * 0.264583 * actualScale
          const tileHeightMm = srcHeight * 0.264583 * actualScale

          // Zentriert einfügen
          const x = margin + (printableWidth - tileWidthMm) / 2
          const y = contentY

          doc.addImage(imgData, 'PNG', x, y, tileWidthMm, tileHeightMm)

          // Seiteninfo und Position im Grid
          doc.setFontSize(8)
          doc.setTextColor(128, 128, 128)

          let positionInfo = ''
          if (colCount > 1 || rowCount > 1) {
            positionInfo = ` (${t('pdf.row')} ${row + 1}/${rowCount}`
            if (colCount > 1) {
              positionInfo += `, ${t('pdf.column')} ${col + 1}/${colCount}`
            }
            positionInfo += ')'
          }

          const pageInfo = `${t('pdf.page')} ${pageNum} ${t('pdf.of')} ${totalPages}${positionInfo}`
          doc.text(pageInfo, pdfWidth / 2, pdfHeight - 5, { align: 'center' })

          // Schnittmarkierungen
          doc.setDrawColor(200, 200, 200)
          doc.setLineWidth(0.2)

          // Markierungen für Zusammenkleben
          const markLength = 5

          // Oben (wenn nicht erste Zeile)
          if (row > 0) {
            doc.setLineDashPattern([1, 1], 0)
            doc.line(margin, contentY - 2, margin + markLength, contentY - 2)
            doc.line(pdfWidth - margin - markLength, contentY - 2, pdfWidth - margin, contentY - 2)
            doc.setFontSize(5)
            doc.text(String.fromCharCode(9650), margin + 2, contentY - 4) // Dreieck oben
          }

          // Unten (wenn nicht letzte Zeile)
          if (row < rowCount - 1) {
            const bottomY = contentY + tileHeightMm + 2
            doc.setLineDashPattern([1, 1], 0)
            doc.line(margin, bottomY, margin + markLength, bottomY)
            doc.line(pdfWidth - margin - markLength, bottomY, pdfWidth - margin, bottomY)
            doc.setFontSize(5)
            doc.text(String.fromCharCode(9660), margin + 2, bottomY + 3) // Dreieck unten
          }

          // Links (wenn nicht erste Spalte)
          if (col > 0) {
            doc.setLineDashPattern([1, 1], 0)
            doc.line(margin - 2, contentY, margin - 2, contentY + markLength)
            doc.setFontSize(5)
            doc.text(String.fromCharCode(9664), margin - 5, contentY + 3) // Dreieck links
          }

          // Rechts (wenn nicht letzte Spalte)
          if (col < colCount - 1) {
            const rightX = margin + tileWidthMm + 2
            doc.setLineDashPattern([1, 1], 0)
            doc.line(rightX, contentY, rightX, contentY + markLength)
            doc.setFontSize(5)
            doc.text(String.fromCharCode(9654), rightX + 1, contentY + 3) // Dreieck rechts
          }

          doc.setLineDashPattern([], 0)
        }
      }
    }

    // Hinweis auf erster Seite wenn Poster-Modus
    if (totalPages > 1) {
      doc.setPage(1)
      doc.setFontSize(7)
      doc.setTextColor(150, 150, 150)
      doc.text(t('pdf.posterHint'), pdfWidth / 2, pdfHeight - 10, { align: 'center' })
    }
  }

  openPdfInNewTab(doc)
}
