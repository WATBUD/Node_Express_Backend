export const iniSessionGuard = users => async (req,res,next) => {
  if(!req.user) return next() // Public authentication routes are explicitly exempt from JWT.
  const id=Number(req.user.user_id)
  if(!Number.isInteger(id)||id<=0) return res.status(401).json({success:false,error:{code:'UNAUTHORIZED',message:'UNAUTHORIZED'}})
  try {
    const user=await users.getUserById(id)
    if(!user||user.is_banned||Number(user.auth_token_version||0)!==Number(req.user.auth_token_version||0))
      return res.status(401).json({success:false,error:{code:'UNAUTHORIZED',message:'UNAUTHORIZED'}})
    return next()
  } catch(error){
    return res.status(503).json({success:false,error:{code:'INTERNAL_ERROR',message:'INTERNAL_ERROR'}})
  }
}
