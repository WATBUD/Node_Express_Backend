import fs from 'node:fs/promises'
import { PrismaClient } from '@prisma/client'
import { iniDatabaseUrl } from '../src/database/database-urls.js'
const db = new PrismaClient({ datasources: { db: { url: iniDatabaseUrl } } })
try {
  const sql = await fs.readFile(new URL('../src/database/prisma/migrations/20260915130000_text_invites/migration.sql', import.meta.url), 'utf8')
  for (const statement of sql.split(';').map(s => s.trim()).filter(Boolean)) await db.$executeRawUnsafe(statement)
  console.log('Text invite schema ready.')
} finally { await db.$disconnect() }
