// app/config/branding.ts
/**
 * Zentrale Branding-Konfiguration
 * 
 * Hier können alle firmenspezifischen Informationen angepasst werden.
 * Dies erleichtert die Wiederverwendung der Software für andere Unternehmen.
 */

export const branding = {
  /**
   * Firmenname
   */
  company: {
    name: 'TecKonzept',
    fullName: 'TecKonzept GmbH',
    website: 'https://www.teckonzept.de'
  },

  /**
   * Logos
   * Pfade relativ zum /public Verzeichnis
   */
  logo: {
    // Hauptlogo (mit transparentem Hintergrund)
    main: '/Logo_TecKonzept_noBg.png',
    
    // Logo für PDFs (blau/dunkel)
    pdf: '/Logo_TecKonzept_noBg_blue.png',
    
    // Favicon
    favicon: '/favicon.ico',
    
    // Logo-Dimensionen für PDFs
    pdfWidth: 30,
    pdfHeight: 30
  },

  /**
   * Kontaktinformationen
   */
  contact: {
    email: 'info@teckonzept.de',
    phone: '+49 123 456789',
    address: {
      street: 'Musterstraße 123',
      zip: '12345',
      city: 'Musterstadt',
      country: 'Deutschland'
    }
  },

  /**
   * Anwendungsinformationen
   */
  app: {
    name: 'Urlaubsverwaltung',
    fullName: 'TecKonzept Urlaubsverwaltungssystem',
    version: '1.0.0',
    description: 'Modernes Urlaubsverwaltungssystem'
  },

  /**
   * Farben (optional - für Theme-Anpassungen)
   */
  colors: {
    primary: '#3b82f6',      // Blau
    secondary: '#667eea',    // Lila
    accent: '#f59e0b'        // Orange
  }
}

/**
 * Helper-Funktionen für einfachen Zugriff
 */
export const getCompanyName = () => branding.company.name
export const getCompanyFullName = () => branding.company.fullName
export const getAppName = () => branding.app.name
export const getAppFullName = () => branding.app.fullName
export const getLogoPath = (type: 'main' | 'pdf' = 'main') => branding.logo[type]

/**
 * PDF-spezifische Funktionen
 */
export const getPdfHeader = () => ({
  logo: branding.logo.pdf,
  logoWidth: branding.logo.pdfWidth,
  logoHeight: branding.logo.pdfHeight,
  company: branding.company.name
})

/**
 * Vollständige Kontaktinformationen formatiert
 */
export const getFormattedAddress = () => {
  const addr = branding.contact.address
  return `${addr.street}, ${addr.zip} ${addr.city}, ${addr.country}`
}

/**
 * Beispiel für verschiedene Konfigurationen:
 * 
 * // Firma A
 * export const branding = {
 *   company: { name: 'TecKonzept' },
 *   logo: { main: '/Logo_TecKonzept.png' }
 * }
 * 
 * // Firma B
 * export const branding = {
 *   company: { name: 'Musterfirma' },
 *   logo: { main: '/Logo_Musterfirma.png' }
 * }
 */
