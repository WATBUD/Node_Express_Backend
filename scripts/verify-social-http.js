import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import {PrismaClient} from '@prisma/client'
import {iniDatabaseUrl} from '../src/database/database-urls.js'
import {hashPassword} from '../src/utilities/password-helper.js'

const base=process.env.SOCIAL_VERIFY_URL||'https://node-express-backend-auqk.onrender.com'
const db=new PrismaClient({datasources:{db:{url:iniDatabaseUrl}}})
const users=[]
const password=crypto.randomBytes(18).toString('hex')
const prefix=`social.http.${Date.now()}.`
const call=async(path,token,method='GET',body,expected=200,raw=false)=>{
  const response=await fetch(`${base}${path}`,{method,headers:{...(token?{Authorization:`Bearer ${token}`}:{ }),...(body instanceof FormData?{}:{'Content-Type':'application/json'})},body:body instanceof FormData?body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(30000)})
  assert.equal(response.status,expected,`${method} ${path}: unexpected HTTP status`)
  if(raw)return response.arrayBuffer()
  const result=await response.json()
  if(expected>=200&&expected<300) assert(result.success,`${path}: failure envelope`)
  return result.data
}
try {
  const hash=await hashPassword(password)
  for(let i=0;i<4;i++){
    const account=`${prefix}${i}@test.invalid`
    const id=await db.$transaction(async tx=>{
      await tx.$executeRaw`INSERT INTO users(user_account,password_hash,is_test_account,is_banned) VALUES(${account},${hash},TRUE,FALSE)`
      const ids=await tx.$queryRaw`SELECT LAST_INSERT_ID() AS id`
      const id=Number(ids[0].id)
      await tx.$executeRaw`INSERT INTO user_profiles(user_id,display_name,gender,birthdate,bio,profile_initialized) VALUES(${id},'整合驗證','male','1996-05-20','後端端到端整合驗證',TRUE)`
      return id
    })
    users.push({id,account})
  }
  for(const user of users){const login=await call('/api/auth/login',null,'POST',{account:user.account,password});user.token=login.accessToken;assert.equal(login.user.id,user.id)}
  const [a,b,c,d]=users
  await call('/api/safety/state',null,'GET',undefined,401)
  assert((await call('/api/text/discovery',a.token)).some(u=>u.id===b.id))
  const invitation=await call('/api/text/invites',a.token,'POST',{recipientUserId:b.id,text:'一起聊聊今天發生的事情'},201)
  const inbox=await call('/api/text/invites?box=inbox',b.token)
  assert(inbox.some(i=>i.id===String(invitation.id)))
  await call(`/api/text/invites/${invitation.id}`,c.token,'DELETE',undefined,404)
  await call(`/api/text/invites/${invitation.id}/review`,b.token,'POST',{decision:'approved'})
  const chat=await call(`/api/chat/users/${b.id}/messages`,a.token,'POST',{text:'文字邀請後的聊天驗證'},201)
  assert((await call(`/api/chat/users/${a.id}/messages`,b.token)).some(m=>m.id===chat.id&&!m.mine))
  await call(`/api/text/profiles/${b.id}/resonance`,a.token,'PUT',{enabled:true})
  await call(`/api/text/profiles/${b.id}/resonance`,a.token,'PUT',{enabled:true})
  assert((await call('/api/text/resonances',a.token)).find(r=>r.userId===b.id)?.count===1)
  await call(`/api/safety/blocks/${a.id}`,b.token,'PUT')
  assert((await call('/api/safety/state',b.token)).blockedUsers.some(u=>u.id===String(a.id)))
  await call(`/api/chat/users/${b.id}/messages`,a.token,'POST',{text:'封鎖不能發送'},403)
  await call(`/api/profiles/${b.id}`,a.token,'GET',undefined,404)
  assert(!(await call('/api/text/discovery',a.token)).some(u=>u.id===b.id))
  await call(`/api/safety/blocks/${a.id}`,b.token,'DELETE')
  assert((await call(`/api/chat/users/${a.id}/messages`,b.token)).some(m=>m.id===chat.id))
  const wav=Buffer.alloc(44+16000*7*2)
  wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(16000,24);wav.writeUInt32LE(32000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(wav.length-44,40)
  const form=recipient=>{const body=new FormData();body.append('audio',new Blob([wav],{type:'audio/wav'}),'intro.wav');if(recipient)body.append('recipientUserId',String(recipient));return body}
  await call('/api/voice/profile',c.token,'PUT',form())
  assert.equal((await call(`/api/voice/profiles/${c.id}/audio`,d.token,'GET',undefined,200,true)).byteLength,wav.length)
  const voice=await call('/api/voice/invites',c.token,'POST',form(d.id),201)
  assert((await call('/api/voice/invites?box=inbox',d.token)).some(i=>i.id===voice.id))
  await call(`/api/voice/invites/${voice.id}/review`,d.token,'POST',{decision:'approved'})
  await call('/api/voice/invites',c.token,'POST',form(d.id),409)
  const voiceChat=await call(`/api/chat/users/${c.id}/messages`,d.token,'POST',{text:'語音審核後的聊天驗證'},201)
  assert((await call(`/api/chat/users/${d.id}/messages`,c.token)).some(m=>m.id===voiceChat.id&&!m.mine))
  await call('/api/safety/reports',d.token,'POST',{reportedUserId:c.id,reasonCode:'harassment',note:'整合驗證檢舉'},201)
  assert((await call('/api/safety/state',d.token)).reports.some(r=>r.userId===String(c.id)))
  await call(`/api/voice/profiles/${c.id}/audio`,d.token,'GET',undefined,404)
  await call(`/api/voice/invites/${voice.id}/audio`,c.token,'GET',undefined,404)
  await call(`/api/chat/users/${d.id}/messages`,c.token,'GET',undefined,403)
  console.log('PASS deployed HTTPS text + voice + chat + blocks + reports + resonance + ownership authorization')
} catch(error){console.error('FAIL',error.message.slice(0,1000));process.exitCode=1}
finally{
  if(users.length){const placeholders=users.map(()=>'?').join(',');await db.$executeRawUnsafe(`DELETE FROM users WHERE user_id IN (${placeholders}) AND user_account LIKE ?`,...users.map(u=>u.id),`${prefix}%@test.invalid`)}
  await db.$disconnect()
}
