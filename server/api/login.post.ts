import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
    console.log('API Login-Handler aufgerufen')

    const body = await readBody(event)
    const { username, password } = body

    console.log('Empfangene Daten:', { username, password: '***' })

    if (!username || !password) {
        throw createError({
            statusCode: 400,
            message: 'Benutzername und Passwort erforderlich'
        })
    }

    try {
        const filePath = join(process.cwd(), 'credentials.txt')
        console.log('Credentials-Pfad:', filePath)

        if (!existsSync(filePath)) {
            console.error('credentials.txt nicht gefunden!')
            throw createError({
                statusCode: 500,
                message: 'Credentials-Datei nicht gefunden'
            })
        }

        const fileContent = await readFile(filePath, 'utf-8')
        console.log('Datei-Inhalt gelesen')

        const validCredentials = fileContent
            .split('\n')
            .filter(line => line.trim() && !line.startsWith('#'))
            .map(line => {
                const [user, pass] = line.split(':')
                return { username: user?.trim(), password: pass?.trim() }
            })
            .filter(cred => cred.username && cred.password)

        console.log('Geparste Credentials:', validCredentials.length, 'Einträge')

        const isValid = validCredentials.some(
            cred => cred.username === username && cred.password === password
        )

        console.log('Validierung:', isValid ? 'ERFOLGREICH' : 'FEHLGESCHLAGEN')

        if (isValid) {
            return { success: true }
        } else {
            throw createError({
                statusCode: 401,
                message: 'Ungültige Zugangsdaten'
            })
        }
    } catch (error: any) {
        console.error('Fehler im Login-Handler:', error)

        if (error.statusCode) {
            throw error
        }

        throw createError({
            statusCode: 500,
            message: 'Interner Server-Fehler'
        })
    }
})