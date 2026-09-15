const sendError = (res, error) => res.status(error.statusCode || 500).json({
  success: false,
  error: { code: error.code || 'INTERNAL_ERROR', message: error.code || 'INTERNAL_ERROR' },
})

export default service => ({
  state: async (req,res) => {try {res.json({success:true,data:await service.state(req.user.user_id)})} catch(e){sendError(res,e)}},
  block: async (req,res) => {try {res.json({success:true,data:await service.block(req.user.user_id,req.params.userId)})} catch(e){sendError(res,e)}},
  unblock: async (req,res) => {try {res.json({success:true,data:await service.unblock(req.user.user_id,req.params.userId)})} catch(e){sendError(res,e)}},
  createReport: async (req, res) => {
    try {
      const data = await service.createReport(req.user.user_id, req.body)
      return res.status(201).json({ success: true, data })
    } catch (error) {
      return sendError(res, error)
    }
  },
})
