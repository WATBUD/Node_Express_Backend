import { PrismaClient, Prisma } from '@prisma/client'
import { iniDatabaseUrl } from '../database/database-urls.js'
import { notBlocked } from './social-policy.js'
const db = new PrismaClient({ datasources: { db: { url: iniDatabaseUrl } } })
const id = Number
const compatible = async (tx, sender, recipient) => {
  const rows = await tx.$queryRaw`SELECT b.user_id FROM users a JOIN users b ON b.is_test_account=a.is_test_account WHERE a.user_id=${id(sender)} AND b.user_id=${id(recipient)} AND a.is_banned=FALSE AND b.is_banned=FALSE AND ${notBlocked(id(sender),id(recipient))}`
  return rows.length > 0
}
export default {
  async resonances(viewer) {
    const rows = await db.$queryRaw`SELECT r.profile_user_id,
      SUM(r.user_id=${id(viewer)}) AS mine, COUNT(*) AS total
      FROM text_resonances r JOIN users actor ON actor.user_id=r.user_id JOIN users target ON target.user_id=r.profile_user_id
      WHERE actor.is_test_account=target.is_test_account
        AND target.is_test_account=(SELECT is_test_account FROM users WHERE user_id=${id(viewer)})
        AND actor.is_banned=FALSE AND target.is_banned=FALSE
        AND ${notBlocked(id(viewer),Prisma.raw('r.profile_user_id'))}
        AND ${notBlocked(Prisma.raw('r.user_id'),Prisma.raw('r.profile_user_id'))}
      GROUP BY r.profile_user_id`
    return rows.map(r=>({userId:Number(r.profile_user_id),resonated:Number(r.mine)>0,count:Number(r.total)}))
  },
  async resonate(viewer, peer, enabled) {
    return db.$transaction(async tx=>{
      if (!await compatible(tx,viewer,peer)) return {error:'USER_NOT_FOUND'}
      if (enabled) await tx.$executeRaw`INSERT INTO text_resonances(user_id,profile_user_id) VALUES(${id(viewer)},${id(peer)}) ON DUPLICATE KEY UPDATE user_id=VALUES(user_id)`
      else await tx.$executeRaw`DELETE FROM text_resonances WHERE user_id=${id(viewer)} AND profile_user_id=${id(peer)}`
      return {resonated:enabled}
    })
  },
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
    return db.$queryRaw`SELECT v.id,v.body,v.status,v.created_at,v.reviewed_at,u.user_id,p.display_name AS name,p.gender,p.avatar_id AS image,p.bio,p.headline,p.birthdate,p.location FROM text_invites v JOIN users u ON u.user_id=${Prisma.raw(peer)} JOIN user_profiles p ON p.user_id=u.user_id WHERE ${Prisma.raw(owner)}=${id(userId)} AND u.is_banned=FALSE AND u.is_test_account=(SELECT is_test_account FROM users WHERE user_id=${id(userId)}) AND ${notBlocked(id(userId),Prisma.raw('u.user_id'))} ORDER BY v.created_at DESC,v.id DESC LIMIT 100`
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
