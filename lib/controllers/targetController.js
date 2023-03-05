var sendJson = require('send-data/json')

var redis = require('../redis')
var { setRequestsRemaining } = require('../helper/redis.helper')

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

function makeingDecision (...params) {
  const [req, res, opts, onError] = params
  const { geoState, publisher, timestamp } = opts.body

  const isEnoughData = geoState && publisher && timestamp

  if (!isEnoughData) {
    sendJson(req, res, { decision: 'reject' })
  }

  redis.HGETALL('targets', function (err, result) {
    if (err) onError(err)
    if (result) {
      var targets = []
      const currentVisitorGeoState = opts.body.geoState
      const currentVisitorTimeStamp = new Date(opts.body.timestamp)
      const currentVisitorHour = new Date(opts.body.timestamp).getUTCHours()
      for (const key in result) {
        targets.push(JSON.parse(result[key]))
      }

      var allowedTargets = targets.filter((target) => {
        const targetGeoStateAllow = target.accept.geoState.$in
        const targetTimeAllow = target.accept.hour.$in

        return targetGeoStateAllow.includes(currentVisitorGeoState) && targetTimeAllow.includes(currentVisitorHour.toString())
      })

      allowedTargets = allowedTargets.sort((a, b) => parseFloat(b.value) - parseFloat(a.value)).sort((a, b) => parseInt(b.maxAcceptsPerDay) - parseInt(a.maxAcceptsPerDay))

      const decisionTarget = allowedTargets[0]

      const formattedDate = currentVisitorTimeStamp.toLocaleDateString()

      redis.GET(`targetReq:${decisionTarget.id}:${formattedDate}`, function (err, remainingCounter) {
        if (err) onError(err)

        remainingCounter = remainingCounter || decisionTarget.maxAcceptsPerDay

        if (remainingCounter < 0) {
          return sendJson(req, res, { decision: 'reject' })
        }

        setRequestsRemaining(decisionTarget.id, formattedDate, remainingCounter - 1, onError, function () {
          return sendJson(req, res, { url: decisionTarget.url, decision: decisionTarget.value })
        })
      })
    } else {
      return sendJson(req, res, { decision: 'reject' })
    }
  })
}
