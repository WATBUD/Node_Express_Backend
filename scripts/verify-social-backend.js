import { PrismaClient } from '@prisma/client'
import { iniDatabaseUrl } from '../src/database/database-urls.js'
import textRepository from '../src/repositories/text-repository.js'
import TextService from '../src/services/text-service.js'
import voiceRepository from '../src/repositories/voice-repository.js'
import VoiceService from '../src/services/voice-service.js'
import chatRepository from '../src/repositories/chat-repository.js'
import ChatService from '../src/services/chat-service.js'
import safetyRepository from '../src/repositories/safety-repository.js'
import SafetyService from '../src/services/safety-service.js'
import assert from 'node:assert/strict'
const db=new PrismaClient({datasources:{db:{url:iniDatabaseUrl}}})
const text=new TextService(textRepository),voice=new VoiceService(voiceRepository),chat=new ChatService(chatRepository)
const accounts=[]
const safety=new SafetyService(safetyRepository)
try {
  for(let i=0;i<5;i++) {
    const account=`social.verify.${Date.now()}.${i}@test.invalid`
    const user=await db.$transaction(async tx=>{
      await tx.$executeRaw`INSERT INTO users(user_account,password_hash,is_test_account,is_banned) VALUES(${account},'disabled-integration-account',${i<4},FALSE)`
      const rows=await tx.$queryRaw`SELECT LAST_INSERT_ID() AS id`
      const id=Number(rows[0].id)
      await tx.$executeRaw`INSERT INTO user_profiles(user_id,display_name,gender,bio,profile_initialized) VALUES(${id},'整合測試','male','整合測試帳號',TRUE)`
      return id
    })
    accounts.push(user)
  }
  const [a,b,c,d,normal]=accounts
  await assert.rejects(()=>text.send(a,{recipientUserId:normal,text:'隔離測試不可送出'}),e=>e.code==='USER_NOT_FOUND')
  await assert.rejects(()=>text.send(normal,{recipientUserId:a,text:'隔離測試不可送出'}),e=>e.code==='USER_NOT_FOUND')
  await assert.rejects(()=>safety.block(a,normal),e=>e.code==='USER_NOT_FOUND')
  const cancelled=await text.send(a,{recipientUserId:b,text:'這是一段測試邀請'})
  assert((await text.list(b,'inbox')).some(x=>x.id===String(cancelled.id)))
  await text.cancel(a,cancelled.id)
  assert(!(await text.list(b,'inbox')).some(x=>x.id===String(cancelled.id)))
  const rejected=await text.send(a,{recipientUserId:b,text:'這是第二段測試邀請'})
  await text.review(b,rejected.id,'rejected')
  assert((await text.list(a,'sent')).some(x=>x.id===String(rejected.id)&&x.status==='rejected'))
  const accepted=await text.send(a,{recipientUserId:b,text:'這是第三段測試邀請'})
  await text.review(b,accepted.id,'approved')
  const message=await chat.send(a,b,'文字邀請通過後的跨帳號訊息')
  assert((await chat.messages(b,a)).some(x=>x.id===message.id&&!x.mine))
  assert((await chat.threads(b)).some(x=>x.user.id===a))
  console.log('PASS text send/inbox/cancel/reject/approve + chat cross-account persistence')
  const samples=16000*7, wav=Buffer.alloc(44+samples*2)
  wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(16000,24);wav.writeUInt32LE(32000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(samples*2,40)
  const file={buffer:wav,size:wav.length,mimetype:'audio/wav'}
  await voice.saveProfileVoice(c,file)
  assert((await voice.profileAudio(c,c)).audio_data.length===wav.length)
  const invitation=await voice.send(c,d,file)
  assert((await voice.list(d,'inbox')).some(x=>x.id===invitation.id))
  assert((await voice.audio(invitation.id,d)).audio_data.length===wav.length)
  await voice.review(invitation.id,d,'approved')
  await assert.rejects(()=>voice.send(c,d,file),e=>e.code==='CHAT_ALREADY_CONNECTED')
  const voiceMessage=await chat.send(d,c,'語音邀請通過後的跨帳號訊息')
  assert((await chat.messages(c,d)).some(x=>x.id===voiceMessage.id&&!x.mine))
  console.log('PASS voice intro/send/inbox/audio/approve + chat cross-account persistence')
  await assert.rejects(()=>voice.send(c,normal,file),e=>e.statusCode===404)
  await assert.rejects(()=>voice.profileAudio(normal,c),e=>e.statusCode===404)
  await text.resonate(a,b,true)
  await text.resonate(a,b,true)
  assert((await text.resonances(a)).find(x=>x.userId===b)?.count===1)
  assert((await text.resonances(a)).find(x=>x.userId===b)?.resonated===true)
  assert((await text.resonances(b)).find(x=>x.userId===b)?.resonated===false)
  await text.resonate(a,b,false)
  assert(!(await text.resonances(a)).some(x=>x.userId===b))
  await safety.block(b,a)
  assert((await safety.state(b)).blockedUsers.some(x=>x.id===String(a)))
  assert(!(await text.list(a,'sent')).some(x=>x.user.id===b))
  await assert.rejects(()=>chat.send(a,b,'封鎖後不可送出'),e=>e.statusCode===403)
  await assert.rejects(()=>chat.messages(b,a),e=>e.statusCode===403)
  assert(!(await chat.threads(a)).some(x=>x.user.id===b))
  await assert.rejects(()=>text.resonate(a,b,true),e=>e.code==='USER_NOT_FOUND')
  await safety.unblock(b,a)
  assert((await chat.messages(b,a)).some(x=>x.id===message.id))
  await safety.createReport(d,{reportedUserId:c,reasonCode:'harassment',note:'整合測試檢舉'})
  const state=await safety.state(d)
  assert(state.reports.some(x=>x.userId===String(c)&&x.note==='整合測試檢舉'))
  assert(state.blockedUsers.some(x=>x.id===String(c)))
  assert(!(await safety.state(c)).reports.length)
  assert(!(await voice.list(c,'sent')).some(x=>x.user.id===d))
  await assert.rejects(()=>voice.profileAudio(c,d),e=>e.statusCode===404)
  await assert.rejects(()=>voice.audio(invitation.id,c),e=>e.statusCode===404)
  await assert.rejects(()=>voice.send(c,d,file),e=>e.statusCode===404)
  assert(!(await voice.discover(c)).some(x=>Number(x.id)===d))
  console.log('PASS server-enforced symmetric blocks, unblock, report history, idempotent resonance, test/normal isolation')
} catch (error) {
  console.error('FAIL', error.message.slice(0, 1800))
  process.exitCode = 1
} finally {
  if(accounts.length) {
    const placeholders=accounts.map(()=>'?').join(',')
    await db.$executeRawUnsafe(`DELETE FROM users WHERE user_id IN (${placeholders}) AND user_account LIKE 'social.verify.%@test.invalid'`,...accounts)
  }
  await db.$disconnect()
  // Repository clients otherwise keep the verification process alive.
  process.exit(process.exitCode || 0)
}
