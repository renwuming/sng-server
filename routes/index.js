const router = require('koa-router')()
const Games = require('../models/game')


async function getGame(ctx, next) {
  const { id } = ctx.params
  try {
    let game = await Games.findOne({
      _id: id,
    })
    ctx.state.game = game.toObject()
    await next()
  } catch (e) {
    let error = e.toString()
    console.log(error)
    if (!ctx.state.game) {
      error = 'ID不存在！'
    }
    ctx.body = {
      code: 500,
      error,
    }
  }
}

router.post('/game', async (ctx, next) => {
  const { name, blindTime, levelList } = ctx.request.body
  const sumTime = blindTime * levelList.length
  const game = await Games.create({
    name,
    blindTime,
    levelList,
    sumTime,
  })

  ctx.body = {
    id: game._id,
  }
})

router.post('/game/:id/start', getGame, async (ctx, next) => {
  const { game } = ctx.state
  game.startAt = +new Date()
  await Games.findOneAndUpdate({
    _id: game._id
  }, game)

  ctx.body = {}
})

router.get('/game/:id', getGame, async (ctx, next) => {
  const { game } = ctx.state
  let { blindTime, startAt, levelList } = game
  const current = +new Date()
  game.start = !!startAt
  if (!startAt) {
    startAt = current
  }
  const lastSeconds = Math.floor((current - startAt) / 1000)
  const lastMin = Math.floor(lastSeconds / 60)
  const currentLevel = Math.floor(lastMin / blindTime)
  if (currentLevel >= levelList.length) game.end = true // 比赛已结束
  game.lastTime = game.start ? blindTime * 60 - (lastSeconds % (blindTime * 60)) : blindTime * 60
  game.currentLevel = currentLevel >= 0 ? currentLevel : levelList.length - 1
  ctx.body = ctx.state.game

})


module.exports = router
