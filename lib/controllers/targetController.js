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

function makeingDecision (...params) {
  const [req, res, opts, onError] = params

  redis.HGETALL('targets', function (err, result) {
    if (err) onError(err)

    if (result) {
      var targets = []
      for (const key in result) {
        targets.push(JSON.parse(result[key]))
      }
      const requestHour = new Date(new Date(opts.body.timestamp).toUTCString()).getUTCHours()
      var targetResult = {}
      const docs = targets.filter(target => {
        const hours = target.accept.hour.$in
        return target.accept.geoState.$in.includes(opts.body.geoState) && requestHour >= parseInt(hours[0]) && requestHour <= (parseInt(hours[hours.length - 1]) + 1)
      })

      if (docs.length > 0) {
        docs.sort((a, b) => {
          if (parseInt(a) < parseInt(b)) return -1
          if (parseInt(a) > parseInt(b)) return 1
          return 0
        })
        for (const doc in docs) {
          const rec = docs[doc]
          redis.GET(`requests:${rec.id}`, function (err, reqRec) {
            if (err) onError(err)
            reqRec = JSON.parse(reqRec)
            const newDate = new Date(new Date().toUTCString()).getDate()
            const reqDate = new Date(new Date(opts.body.timestamp).toUTCString()).getDate()
            if (reqRec === null || (reqRec && reqRec.date < newDate && newDate === reqDate)) {
              const reqData = { date: newDate, count: 1 }
              redis.SET(`requests:${rec.id}`, JSON.stringify(reqData))
              targetResult = { url: rec.url, decision: rec.value }
              sendJson(req, res, targetResult)
            } else if (reqRec.count !== parseInt(rec.maxAcceptsPerDay) && newDate === reqDate) {
              reqRec.count = parseInt(reqRec.count) + 1
              redis.SET(`requests:${rec.id}`, JSON.stringify(reqRec))
              targetResult = { url: rec.url, decision: rec.value }
              sendJson(req, res, targetResult)
            } else {
              targetResult = { decision: 'reject' }
              sendJson(req, res, targetResult)
            }
          })
        }
      } else {
        sendJson(req, res, { decision: 'reject' })
      }
    } else {
      sendJson(req, res, { decision: 'reject' })
    }
  })
}
