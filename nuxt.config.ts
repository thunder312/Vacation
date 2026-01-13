export default defineNuxtConfig({
    compatibilityDate: '2025-11-30',

    css: ['~/assets/css/main.css'],

    devtools: { enabled: true },

    debug: true,

    app: {
        head: {
            link: [
                { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
                // Oder für PNG:
                // { rel: 'icon', type: 'image/png', href: '/favicon.png' }
                // Oder für SVG:
                // { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
            ]
        }
    }
})