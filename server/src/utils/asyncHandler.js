// asyncHandler.js — try/catch se bachao
const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (err) {
        next(err)
    }
}

export {asyncHandler}