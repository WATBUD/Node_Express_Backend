import express from 'express'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import {expressjwt} from 'express-jwt'
import {expect} from 'chai'
import {iniSessionGuard} from '../src/middlewares/ini-session.js'
import safetyRoutes from '../src/http/safety-routes.js'
import safetyHandler from '../src/http/safety-handler.js'
import SafetyService from '../src/services/safety-service.js'

describe('Social HTTP authorization',()=>{
  const secret='unit-test-only-secret-not-a-real-credential'
  const users=new Map([[1,{user_id:1,auth_token_version:0}],[2,{user_id:2,auth_token_version:1}],[3,{user_id:3,is_banned:true}]])
  const token=(id,version=0)=>jwt.sign({user_id:id,auth_token_version:version},secret)
  const app=express()
  app.use(express.json(),expressjwt({secret,algorithms:['HS256'],requestProperty:'user'}),iniSessionGuard({getUserById:async id=>users.get(id)}))
  const calls=[]
  const repository={compatible:async()=>true,state:async viewer=>({viewer,blockedUsers:[],reports:[]}),block:async(viewer,peer)=>{calls.push([viewer,peer]);return{blocked:true}},unblock:async(viewer,peer)=>{calls.push([viewer,peer]);return{blocked:false}}}
  app.use('/api/safety',safetyRoutes(safetyHandler(new SafetyService(repository))))
  app.use((e,req,res,next)=>res.status(e.status||500).json({success:false}))
  it('rejects unauthenticated, deleted, banned and revoked sessions',async()=>{
    expect((await request(app).get('/api/safety/state')).status).to.equal(401)
    for(const id of [2,3,4]) expect((await request(app).get('/api/safety/state').auth(token(id),{type:'bearer'})).status).to.equal(401)
    expect((await request(app).get('/api/safety/state').auth(token(2,1),{type:'bearer'})).status).to.equal(200)
  })
  it('reads only the authenticated user state and ignores spoofed ownership',async()=>{
    const result=await request(app).get('/api/safety/state?userId=2').auth(token(1),{type:'bearer'})
    expect(result.body.data.viewer).to.equal(1)
    await request(app).put('/api/safety/blocks/2').auth(token(1),{type:'bearer'}).send({blockerUserId:2})
    expect(calls.at(-1)).to.deep.equal([1,2])
    await request(app).delete('/api/safety/blocks/2').auth(token(1),{type:'bearer'})
    expect(calls.at(-1)).to.deep.equal([1,2])
  })
  it('rejects invalid targets and self-blocks',async()=>{
    for(const target of ['1','0','nope']) expect((await request(app).put(`/api/safety/blocks/${target}`).auth(token(1),{type:'bearer'})).status).to.equal(400)
  })
})
