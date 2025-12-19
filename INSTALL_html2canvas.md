# Installation: html2canvas

Das Organigramm-PDF benötigt das Paket `html2canvas` um die visuelle Darstellung zu rendern.

## Installation:

```bash
npm install html2canvas
```

## Oder mit yarn:

```bash
yarn add html2canvas
```

Nach der Installation den Dev-Server neu starten:

```bash
npm run dev
```

## Was macht html2canvas?

- Rendert HTML-Elemente als Canvas/Bild
- Ermöglicht Export des visuellen Organigramms
- Erhält alle Farben, Styles und Layouts

## Verwendung im Code:

```typescript
import html2canvas from 'html2canvas'

const canvas = await html2canvas(element, {
  scale: 2,              // Hohe Auflösung
  backgroundColor: '#ffffff',
  logging: false,
  useCORS: true         // Für externe Bilder (Logo)
})

const imgData = canvas.toDataURL('image/png')
// Dann ins PDF einfügen
```
