import express from 'express'
import { rateLimit } from 'express-rate-limit'
const sendError = (res, e) => res.status(e.statusCode || 500).json({success:false,error:{code:e.code || 'INTERNAL_ERROR',message:e.code || 'INTERNAL_ERROR'}})
export default service => {
  const router = express.Router()
  router.get('/invites', async (req,res) => { try {res.json({success:true,data:await service.list(req.user.user_id,req.query.box)})} catch(e){sendError(res,e)} })
  router.post('/invites', rateLimit({windowMs:60000,limit:20,keyGenerator:req=>String(req.user.user_id)}), async (req,res) => { try {res.status(201).json({success:true,data:await service.send(req.user.user_id,req.body)})} catch(e){sendError(res,e)} })
  router.delete('/invites/:id', async (req,res) => { try {res.json({success:true,data:await service.cancel(req.user.user_id,req.params.id)})} catch(e){sendError(res,e)} })
  router.post('/invites/:id/review', async (req,res) => { try {res.json({success:true,data:await service.review(req.user.user_id,req.params.id,req.body.decision)})} catch(e){sendError(res,e)} })
  return router
}
