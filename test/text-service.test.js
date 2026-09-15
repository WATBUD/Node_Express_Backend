import { expect } from 'chai'
import TextService from '../src/services/text-service.js'
describe('TextService', () => {
  it('rejects short messages, self invites and invalid recipients before writing', async () => {
    const service = new TextService({send:()=>{throw new Error('must not write')}})
    for (const input of [{recipientUserId:2,text:'hi'},{recipientUserId:1,text:'hello'},{recipientUserId:'bad',text:'hello'}]) {
      try {await service.send(1,input);throw new Error('expected rejection')} catch(e){expect(e.statusCode).to.equal(400)}
    }
  })
  it('propagates duplicates and cross-group rejection instead of pretending success', async () => {
    for (const error of ['USER_NOT_FOUND','TEXT_ALREADY_SENT']) {
      const service = new TextService({send:async()=>({error})})
      try {await service.send(1,{recipientUserId:2,text:'Hello there'});throw new Error('expected rejection')} catch(e){expect(e.code).to.equal(error)}
    }
  })
  it('uses authenticated recipient for review and sender for cancellation', async () => {
    const calls=[]
    const service=new TextService({review:async(...args)=>{calls.push(args);return 1},cancel:async(...args)=>{calls.push(args);return 1}})
    await service.review(2,10,'approved')
    await service.cancel(1,11)
    expect(calls).to.deep.equal([[10,2,'approved'],[11,1]])
  })
  it('does not approve or cancel someone else’s invite', async () => {
    const service=new TextService({review:async()=>0,cancel:async()=>0})
    for(const task of [()=>service.review(3,10,'approved'),()=>service.cancel(3,10)]) {
      try {await task();throw new Error('expected rejection')} catch(e){expect(e.statusCode).to.equal(404)}
    }
  })
})
