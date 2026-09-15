import assert from 'node:assert/strict'
import VoiceService from '../src/services/voice-service.js'
const wav=seconds=>{
  const bytes=Buffer.alloc(44+16000*seconds*2)
  bytes.write('RIFF');bytes.writeUInt32LE(bytes.length-8,4);bytes.write('WAVEfmt ',8);bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(1,22);bytes.writeUInt32LE(16000,24);bytes.writeUInt32LE(32000,28);bytes.writeUInt16LE(2,32);bytes.writeUInt16LE(16,34);bytes.write('data',36);bytes.writeUInt32LE(bytes.length-44,40)
  return {buffer:bytes,size:bytes.length,mimetype:'audio/wav'}
}
describe('Voice service validation',()=>{
  const service=new VoiceService({findUser:async()=>true,create:async()=>({id:1}),upsertProfileVoice:async data=>({durationMs:data.durationMs})})
  it('requires at least six seconds',async()=>{await assert.rejects(()=>service.send(1,2,wav(5)),e=>e.code==='VOICE_TOO_SHORT')})
  it('accepts both six and sixty second boundaries',async()=>{for(const seconds of [6,60])assert.equal((await service.saveProfileVoice(1,wav(seconds))).durationMs,seconds*1000)})
  it('rejects recordings over sixty seconds',async()=>{await assert.rejects(()=>service.send(1,2,wav(61)),e=>e.code==='VOICE_TOO_LONG')})
  it('rejects invalid recipients and unsupported MIME types',async()=>{
    await assert.rejects(()=>service.send(1,1,wav(6)),e=>e.code==='INVALID_VOICE_RECIPIENT')
    await assert.rejects(()=>service.send(1,2,{...wav(6),mimetype:'text/plain'}),e=>e.code==='INVALID_VOICE_FILE')
  })
})
