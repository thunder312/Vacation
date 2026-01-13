import type { jsPDF } from 'jspdf'
import { getPdfHeader } from '~/config/branding'

/**
 * PDF Header für Querformat (Landscape)
 * Logo rechts oben, Titel links, Trennlinie
 */
export const addPdfHeaderLandscape = (
    doc: jsPDF,
    title: string,
    subtitle?: string
) => {
    const pdfHeader = getPdfHeader()
    const pageWidth = doc.internal.pageSize.getWidth() // 297mm für A4 landscape

    // Logo rechts oben
    try {
        const logoX = pageWidth - pdfHeader.logoWidth - 20
        const logoY = 10
        doc.addImage(pdfHeader.logo, 'PNG', logoX, logoY, pdfHeader.logoWidth, pdfHeader.logoHeight)
    } catch (error) {
        console.warn('Logo konnte nicht geladen werden:', error)
    }

    // Titel links oben
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text(title, 20, 25)

    // Untertitel falls vorhanden (mehrere Zeilen möglich)
    let currentY = 33
    if (subtitle) {
        const subtitles = subtitle.split('\n')
        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 100, 100)

        subtitles.forEach((line) => {
            doc.text(line, 20, currentY)
            currentY += 6
        })
    }

    // Trennlinie
    const lineY = currentY + 3
    doc.setDrawColor(180, 180, 180)
    doc.setLineWidth(0.3)
    doc.line(20, lineY, pageWidth - 20, lineY)

    // Farbe zurücksetzen
    doc.setTextColor(0, 0, 0)

    return lineY + 8 // Rückgabe: Y-Position wo Content beginnen kann
}

/**
 * PDF Header für Hochformat (Portrait)
 * Logo rechts oben, Titel links, Trennlinie
 */
export const addPdfHeaderPortrait = (
    doc: jsPDF,
    title: string,
    subtitle?: string
) => {
    const pdfHeader = getPdfHeader()
    const pageWidth = doc.internal.pageSize.getWidth() // 210mm für A4 portrait

    // Logo rechts oben
    try {
        const logoX = pageWidth - pdfHeader.logoWidth - 15
        const logoY = 10
        doc.addImage(pdfHeader.logo, 'PNG', logoX, logoY, pdfHeader.logoWidth, pdfHeader.logoHeight)
    } catch (error) {
        console.warn('Logo konnte nicht geladen werden:', error)
    }

    // Titel links oben
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text(title, 15, 20)

    // Untertitel falls vorhanden
    let currentY = 33
    if (subtitle) {
        const subtitles = subtitle.split('\n')
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 100, 100)

        subtitles.forEach((line) => {
            doc.text(line, 15, currentY)
            currentY += 5
        })
    }

    // Trennlinie
    const lineY = currentY + 2
    doc.setDrawColor(180, 180, 180)
    doc.setLineWidth(0.3)
    doc.line(15, lineY, pageWidth - 15, lineY)

    // Farbe zurücksetzen
    doc.setTextColor(0, 0, 0)

    return lineY + 6 // Rückgabe: Y-Position wo Content beginnen kann
}

/**
 * Automatische Auswahl basierend auf Seitenformat
 */
export const addPdfHeader = (
    doc: jsPDF,
    title: string,
    subtitle?: string
) => {
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Landscape wenn Breite > Höhe
    if (pageWidth > pageHeight) {
        return addPdfHeaderLandscape(doc, title, subtitle)
    } else {
        return addPdfHeaderPortrait(doc, title, subtitle)
    }
}