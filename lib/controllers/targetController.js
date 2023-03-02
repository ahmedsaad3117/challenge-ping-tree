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
      sendJson(req, res, {message: 'Targets retrieved successfully',response: targets })
    } else {
      sendJson(req, res, { message: 'Targets not found' })
    }
  })
}

function getTargetById (req, res, opt) {
  console.log('getTargetById')
}
function updateTargetById (req, res, opt) {
  console.log('updateTargetById')
}
function makeingDecision (req, res, opt) {
  console.log('makeingDecision')
}
