import { PrismaClient } from '@prisma/client'
import { iniDatabaseUrl } from '../database/database-urls.js'

const db = new PrismaClient({ datasources: { db: { url: iniDatabaseUrl } } })

export default {
  async compatible(viewer, peer) {
    const rows = await db.$queryRaw`SELECT b.user_id FROM users a JOIN users b ON a.is_test_account=b.is_test_account WHERE a.user_id=${Number(viewer)} AND b.user_id=${Number(peer)} AND a.is_banned=FALSE AND b.is_banned=FALSE`
    return rows.length > 0
  },
  async block(viewer, peer) {
    await db.$executeRaw`INSERT INTO user_blocks(blocker_user_id,blocked_user_id) VALUES(${Number(viewer)},${Number(peer)}) ON DUPLICATE KEY UPDATE blocker_user_id=VALUES(blocker_user_id)`
    return { blocked: true }
  },
  async unblock(viewer, peer) {
    await db.$executeRaw`DELETE FROM user_blocks WHERE blocker_user_id=${Number(viewer)} AND blocked_user_id=${Number(peer)}`
    return { blocked: false }
  },
  async state(viewer) {
    const blocked = await db.$queryRaw`SELECT u.user_id,p.display_name,p.avatar_id,p.gender FROM user_blocks b JOIN users u ON u.user_id=b.blocked_user_id LEFT JOIN user_profiles p ON p.user_id=u.user_id WHERE b.blocker_user_id=${Number(viewer)} ORDER BY b.created_at DESC`
    const reports = await db.$queryRaw`SELECT r.id,r.reported_user_id,r.reason_code,r.note,r.created_at,r.status,p.display_name FROM safety_reports r LEFT JOIN user_profiles p ON p.user_id=r.reported_user_id WHERE r.reporter_user_id=${Number(viewer)} ORDER BY r.created_at DESC,r.id DESC LIMIT 200`
    return {
      blockedUsers: blocked.map(u=>({id:String(u.user_id),name:u.display_name||'會員',image:u.avatar_id||'star-dragon',gender:u.gender||'male'})),
      reports: reports.map(r=>({id:String(r.id),userId:String(r.reported_user_id),name:r.display_name||'會員',reasonId:r.reason_code,note:r.note||'',at:r.created_at,status:r.status})),
    }
  },
  async userExists(userId) {
    const rows = await db.$queryRaw`SELECT user_id FROM users WHERE user_id = ${Number(userId)} AND is_banned = FALSE LIMIT 1`
    return rows.length > 0
  },
  async createReport(reporterUserId, reportedUserId, reasonCode, note) {
    return db.$transaction(async tx => {
      await tx.$executeRaw`INSERT INTO safety_reports (reporter_user_id, reported_user_id, reason_code, note) VALUES (${reporterUserId}, ${reportedUserId}, ${reasonCode}, ${note || null})`
      const ids = await tx.$queryRaw`SELECT LAST_INSERT_ID() AS id`
      await tx.$executeRaw`INSERT INTO user_blocks(blocker_user_id,blocked_user_id) VALUES(${reporterUserId},${reportedUserId}) ON DUPLICATE KEY UPDATE blocker_user_id=VALUES(blocker_user_id)`
      return { id: Number(ids[0].id), status: 'pending', createdAt: new Date().toISOString() }
    })
  },
}
