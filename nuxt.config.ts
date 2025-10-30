// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: [
        '@nuxtjs/supabase'
    ],
    supabase: {
        // Optionale Konfiguration hier
        // url: process.env.SUPABASE_URL,
        // key: process.env.SUPABASE_KEY,
    },
    pages: true,
})
