var sendJson = require('send-data/json')

var redis = require('../redis')

module.exports = {
  createTarget,
  getAllTargets,
  getTargetById,
  updateTargetById,
  makeingDecision
}

function createTarget (...params) {
  const [req, res, opts, onError] = params

  if (opts.body.id) {
    redis.HSET('targets', opts.body.id, JSON.stringify(opts.body), function (err, result) {
      if (err) onError(err)

      if (result) {
        sendJson(req, res, { message: 'Target created successfully' })
      } else {
        sendJson(req, res, { message: 'Target created before' })
      }
    })
  } else {
    sendJson(req, res, { message: 'ID is requierd ' })
  }
}

function getAllTargets (...params) {
  const [req, res, , onError] = params

  redis.HGETALL('targets', function (err, result) {
    if (err) onError(err)

    if (result) {
      var targets = []
      for (const key in result) {
        targets.push(JSON.parse(result[key]))
      }
      sendJson(req, res, { message: 'Targets retrieved successfully', response: targets })
    } else {
      sendJson(req, res, { message: 'Targets not found' })
    }
  })
}

function getTargetById (...params) {
  const [req, res, opts, onError] = params

  redis.HGET('targets', opts.params.id, function (err, result) {
    if (err) onError(err)
    if (result) {
      sendJson(req, res, { message: 'Target retrieved successfully', response: JSON.parse(result) })
    } else {
      sendJson(req, res, { message: 'Target not found' })
    }
  })
}

function updateTargetById (...params) {
  const [req, res, opts, onError] = params

  const updates = Object.keys(opts.body)
  const allowUpdate = ['url', 'value', 'maxAcceptsPerDay', 'accept']

  const isVaildUpdate = updates.every((update) => allowUpdate.includes(update))

  if (!isVaildUpdate) {
    return onError(Error('Invaild Update'))
  }

  redis.HGET('targets', opts.params.id, function (err, result) {
    if (err) onError(err)
    if (result) {
      const doc = JSON.parse(result)

      const newDoc = { ...doc, ...opts.body }
      redis.HSET('targets', opts.params.id, JSON.stringify(newDoc), function (err, result) {
        if (err) onError(err)
        if (!result) {
          sendJson(req, res, { message: 'Target updated successfully' })
        } else {
          sendJson(req, res, { message: 'Update failed' })
        }
      })
    } else {
      sendJson(req, res, { message: 'Target not found' })
    }
  })
}
function makeingDecision (req, res, opt) {
  console.log('makeingDecision')
}
