import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { username, password } = body

    try {
        // Pfad zur Textdatei mit Zugangsdaten
        const filePath = path.join(process.cwd(), 'credentials.txt')
        const fileContent = fs.readFileSync(filePath, 'utf-8')

        // Zugangsdaten aus der Datei parsen
        // Format: username:password (eine Zeile pro Benutzer)
        const validCredentials = fileContent
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
                const [user, pass] = line.split(':')
                return { username: user?.trim(), password: pass?.trim() }
            })

        // Prüfen ob Zugangsdaten korrekt sind
        const isValid = validCredentials.some(
            cred => cred.username === username && cred.password === password
        )

        if (isValid) {
            return { success: true }
        } else {
            throw createError({
                statusCode: 401,
                message: 'Ungültige Zugangsdaten'
            })
        }
    } catch (error) {
        throw createError({
            statusCode: 401,
            message: 'Ungültige Zugangsdaten'
        })
    }
})