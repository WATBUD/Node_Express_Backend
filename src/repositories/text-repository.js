import { PrismaClient } from '@prisma/client'
import { iniDatabaseUrl } from '../database/database-urls.js'
const db = new PrismaClient({ datasources: { db: { url: iniDatabaseUrl } } })
const id = Number
const compatible = async (tx, sender, recipient) => {
  const rows = await tx.$queryRaw`SELECT b.user_id FROM users a JOIN users b ON b.is_test_account=a.is_test_account WHERE a.user_id=${id(sender)} AND b.user_id=${id(recipient)} AND a.is_banned=FALSE AND b.is_banned=FALSE`
  return rows.length > 0
}
export default {
  async send(sender, recipient, body) {
    return db.$transaction(async tx => {
      await tx.$queryRaw`SELECT user_id FROM users WHERE user_id=${id(sender)} FOR UPDATE`
      if (!await compatible(tx, sender, recipient)) return { error: 'USER_NOT_FOUND' }
      const low = Math.min(id(sender), id(recipient)), high = Math.max(id(sender), id(recipient))
      const connected = await tx.$queryRaw`SELECT id FROM connections WHERE user_low_id=${low} AND user_high_id=${high}`
      if (connected.length) return { error: 'CHAT_ALREADY_CONNECTED' }
      const existing = await tx.$queryRaw`SELECT id FROM text_invites WHERE sender_user_id=${id(sender)} AND recipient_user_id=${id(recipient)} AND status='pending'`
      if (existing.length) return { error: 'TEXT_ALREADY_SENT' }
      await tx.$executeRaw`INSERT INTO text_invites(sender_user_id,recipient_user_id,body) VALUES(${id(sender)},${id(recipient)},${body})`
      const rows = await tx.$queryRaw`SELECT LAST_INSERT_ID() AS id`
      return { id: id(rows[0].id), status: 'pending' }
    })
  },
  async list(userId, box) {
    const owner = box === 'inbox' ? 'v.recipient_user_id' : 'v.sender_user_id'
    const peer = box === 'inbox' ? 'v.sender_user_id' : 'v.recipient_user_id'
    return db.$queryRawUnsafe(`SELECT v.id,v.body,v.status,v.created_at,v.reviewed_at,u.user_id,p.display_name AS name,p.gender,p.avatar_id AS image,p.bio,p.headline,p.birthdate,p.location FROM text_invites v JOIN users u ON u.user_id=${peer} JOIN user_profiles p ON p.user_id=u.user_id WHERE ${owner}=? AND u.is_banned=FALSE AND u.is_test_account=(SELECT is_test_account FROM users WHERE user_id=?) ORDER BY v.created_at DESC,v.id DESC LIMIT 100`, id(userId), id(userId))
  },
  async cancel(invite, sender) {
    return db.$executeRaw`DELETE FROM text_invites WHERE id=${id(invite)} AND sender_user_id=${id(sender)} AND status='pending'`
  },
  async review(invite, recipient, decision) {
    return db.$transaction(async tx => {
      const rows = await tx.$queryRaw`SELECT sender_user_id,recipient_user_id FROM text_invites WHERE id=${id(invite)} AND recipient_user_id=${id(recipient)} AND status='pending' FOR UPDATE`
      if (!rows.length || !await compatible(tx, rows[0].sender_user_id, recipient)) return 0
      await tx.$executeRaw`UPDATE text_invites SET status=${decision},pending_marker=NULL,reviewed_at=CURRENT_TIMESTAMP WHERE id=${id(invite)}`
      if (decision === 'approved') {
        const low = Math.min(id(rows[0].sender_user_id), id(recipient)), high = Math.max(id(rows[0].sender_user_id), id(recipient))
        await tx.$executeRaw`INSERT INTO connections(user_low_id,user_high_id,source,source_invite_id) VALUES(${low},${high},'text',NULL) ON DUPLICATE KEY UPDATE id=id`
      }
      return 1
    })
  },
}
