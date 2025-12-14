import fs from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body

  try {
    // credentials.txt aus dem Stammverzeichnis lesen
    const credentialsPath = path.join(process.cwd(), 'credentials.txt')
    const fileContent = fs.readFileSync(credentialsPath, 'utf-8')
    
    const lines = fileContent.split('\n').filter(line => 
      line.trim() && !line.startsWith('#')
    )

    for (const line of lines) {
      const parts = line.trim().split(':')
      
      let user = null
      
      // Admin und Office (Format: username:password:role)
      if (parts.length === 3) {
        const [uname, pwd, role] = parts
        if (uname.toLowerCase() === username.toLowerCase() && pwd === password) {
          user = {
            username: uname,
            password: pwd,
            role,
            displayName: uname
          }
        }
      }
      // Normale Accounts (Format: Nachname:Vorname:Passwort:Rolle)
      else if (parts.length === 4) {
        const [lastName, firstName, pwd, role] = parts
        if (lastName.toLowerCase() === username.toLowerCase() && pwd === password) {
          user = {
            username: lastName,
            firstName,
            lastName,
            password: pwd,
            role,
            displayName: `${firstName} ${lastName}`
          }
        }
      }

      if (user) {
        // Passwort nicht zurückgeben
        const { password: _, ...userWithoutPassword } = user
        return {
          success: true,
          user: userWithoutPassword
        }
      }
    }

    // Kein passender User gefunden
    return {
      success: false,
      error: 'Invalid credentials'
    }

  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: 'Server error'
    }
  }
})
