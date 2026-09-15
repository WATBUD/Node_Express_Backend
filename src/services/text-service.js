const fail = (code, statusCode) => Object.assign(new Error(code), { code, statusCode })
const validId = value => Number.isInteger(Number(value)) && Number(value) > 0
export default class TextService {
  constructor(repository) { this.repository = repository }
  async send(userId, input) {
    const body = typeof input?.text === 'string' ? input.text.trim() : ''
    if (!validId(input?.recipientUserId) || Number(input.recipientUserId) === Number(userId)) throw fail('INVALID_USER_ID', 400)
    if (Array.from(body).length < 5 || Array.from(body).length > 1000) throw fail('INVALID_TEXT_INVITE', 400)
    const result = await this.repository.send(userId, input.recipientUserId, body)
    if (result.error) throw fail(result.error, result.error === 'USER_NOT_FOUND' ? 404 : 409)
    return result
  }
  async list(userId, box = 'inbox') {
    if (!['inbox', 'sent'].includes(box)) throw fail('INVALID_INBOX', 400)
    return (await this.repository.list(userId, box)).map(row => ({
      id: String(row.id), message: row.body, status: row.status, createdAt: row.created_at,
      user: { id: Number(row.user_id), name: row.name, gender: row.gender, image: row.image || '', bio: row.bio || '', headline: row.headline || '', birthdate: row.birthdate, location: row.location || '' },
    }))
  }
  async cancel(userId, inviteId) {
    if (!validId(inviteId)) throw fail('INVALID_INVITE_ID', 400)
    if (!await this.repository.cancel(inviteId, userId)) throw fail('INVITE_NOT_FOUND', 404)
    return { id: String(inviteId), status: 'cancelled' }
  }
  async review(userId, inviteId, decision) {
    if (!validId(inviteId) || !['approved', 'rejected'].includes(decision)) throw fail('INVALID_REVIEW', 400)
    if (!await this.repository.review(inviteId, userId, decision)) throw fail('INVITE_NOT_FOUND', 404)
    return { id: String(inviteId), status: decision }
  }
}
