import { Prisma } from '@prisma/client'

// Always symmetric: neither party may interact while either has blocked the other.
export const notBlocked = (viewer, peer) => Prisma.sql`NOT EXISTS (
  SELECT 1 FROM user_blocks ub
  WHERE (ub.blocker_user_id = ${viewer} AND ub.blocked_user_id = ${peer})
     OR (ub.blocker_user_id = ${peer} AND ub.blocked_user_id = ${viewer})
)`
