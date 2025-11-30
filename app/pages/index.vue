<template>
  <div class="home-container">
    <div class="welcome-box">
      <div class="icon">✓</div>
      <h1>Erfolgreich eingeloggt!</h1>
      <p>Willkommen zurück. Dein Login war erfolgreich.</p>

      <div class="info-section">
        <div class="info-card">
          <h3>Dashboard</h3>
          <p>Hier könnte dein Dashboard sein</p>
        </div>

        <div class="info-card">
          <h3>Profil</h3>
          <p>Verwalte deine Einstellungen</p>
        </div>

        <div class="info-card">
          <h3>Einstellungen</h3>
          <p>Passe deine Präferenzen an</p>
        </div>
      </div>

      <button @click="logout" class="btn-primary">Abmelden</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const logout = () => {
  navigateTo('/login')
}
</script>

// server/api/login.post.ts
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
const body = await readBody(event)
const { username, password } = body

if (!username || !password) {
throw createError({
statusCode: 400,
message: 'Benutzername und Passwort erforderlich'
})
}

try {
const filePath = join(process.cwd(), 'credentials.txt')

if (!existsSync(filePath)) {
throw createError({
statusCode: 500,
message: 'Credentials-Datei nicht gefunden'
})
}

const fileContent = await readFile(filePath, 'utf-8')

const validCredentials = fileContent
.split('\n')
.filter(line => line.trim() && !line.startsWith('#'))
.map(line => {
const [user, pass, role] = line.split(':')
return {
username: user?.trim(),
password: pass?.trim(),
role: role?.trim() || 'employee'
}
})
.filter(cred => cred.username && cred.password)

const user = validCredentials.find(
cred => cred.username === username && cred.password === password
)

if (user) {
return {
success: true,
role: user.role
}
} else {
throw createError({
statusCode: 401,
message: 'Ungültige Zugangsdaten'
})
}
} catch (error: any) {
if (error.statusCode) {
throw error
}

throw createError({
statusCode: 500,
message: 'Interner Server-Fehler'
})
}
})