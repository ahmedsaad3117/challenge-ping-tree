var redis = require('../redis')

module.exports = {
  setRequestsRemaining
}

function setRequestsRemaining (...params) {
  const [targetId, formattedDate, remainingCounter, onError, cb] = params
  redis.SET(`targetReq:${targetId}:${formattedDate}`, remainingCounter, function (err, result) {
    if (err) onError(err)
    cb()
  })
}
