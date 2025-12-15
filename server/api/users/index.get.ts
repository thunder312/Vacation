// server/api/users/index.get.ts
import { query } from '../../database/db'

export default defineEventHandler(async (event) => {
  console.log('====================================')
  console.log('🔍 GET /api/users - START')
  console.log('====================================')
  
  try {
    console.log('📊 Step 1: Preparing SQL query...')
    
    const sql = `
      SELECT 
        username,
        firstName,
        lastName,
        CASE 
          WHEN firstName IS NOT NULL AND lastName IS NOT NULL 
          THEN firstName || ' ' || lastName
          ELSE username
        END as displayName,
        role,
        vacationDays,
        teamleadId,
        isActive,
        createdAt
      FROM users
      ORDER BY isActive DESC, displayName ASC
    `
    
    console.log('📝 SQL Query:')
    console.log(sql)
    
    console.log('📊 Step 2: Executing query...')
    const users = query<any>(sql)
    
    console.log('✅ Step 3: Query executed successfully!')
    console.log(`📋 Found ${users?.length || 0} users`)
    
    if (users && users.length > 0) {
      console.log('👤 First user:', JSON.stringify(users[0], null, 2))
      console.log('👥 All usernames:', users.map((u: any) => u.username).join(', '))
    } else {
      console.log('⚠️  No users found!')
    }
    
    console.log('====================================')
    console.log('✅ Returning users to client')
    console.log('====================================')
    
    return users
    
  } catch (error: any) {
    console.log('====================================')
    console.error('❌ ERROR in GET /api/users')
    console.log('====================================')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    console.error('Full error:', error)
    console.error('Stack trace:', error.stack)
    console.log('====================================')
    
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Laden der Benutzer: ' + error.message
    })
  }
})
