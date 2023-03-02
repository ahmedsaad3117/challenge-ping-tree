var sendJson = require('send-data/json')

var redis = require('../redis')

module.exports = {
  createTarget,
  getAllTargets,
  getTargetById,
  updateTargetById,
  makeingDecision
}

function createTarget (req, res, ...optsAndError) {
  const opts = optsAndError[0]
  const onError = optsAndError[1]
  if (opts.body.id) {
    redis.HSET('targets', opts.body.id, JSON.stringify(opts.body), function (err, result) {
      if (err) onError(err)

      if (result) {
        sendJson(req, res, { response: 'Target created successfully' })
      } else {
        sendJson(req, res, { response: 'Target created before' })
      }
    })
  } else {
    sendJson(req, res, { response: 'ID is requierd ' })
  }
}

function getAllTargets (req, res, ...optsAndError) {

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
