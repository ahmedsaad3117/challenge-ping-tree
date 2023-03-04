process.env.NODE_ENV = 'test'

var test = require('ava')
var servertest = require('servertest')

var server = require('../lib/server')

test.serial.cb('healthcheck', function (t) {
  var url = '/health'
  servertest(server(), url, { encoding: 'json' }, function (err, res) {
    t.falsy(err, 'no error')

    t.is(res.statusCode, 200, 'correct statusCode')
    t.is(res.body.status, 'OK', 'status is ok')
    t.end()
  })
})

test.serial.cb('get all targets endpoint - targets not found', function (t) {
  var url = '/api/targets'
  var options = { encoding: 'json', method: 'GET' }

  var expected = {
    message: 'Targets not found'
  }

  servertest(server(), url, options, onResponse)

  function onResponse (err, res) {
    t.falsy(err, 'no error')

    t.is(res.statusCode, 200, 'correct statusCode')
    t.deepEqual(res.body, expected, 'values should match')
    t.end()
  }
})

test.serial.cb('create target endpoint - first target', function (t) {
  var url = '/api/targets'
  var options = { encoding: 'json', method: 'POST' }
  var newTarget = {
    id: 1,
    url: 'http://example.com',
    value: '0.50',
    maxAcceptsPerDay: '10',
    accept: {
      geoState: {
        $in: [
          'ca',
          'ny'
        ]
      },
      hour: {
        $in: [
          '13',
          '14',
          '15'
        ]
      }
    }
  }

  var expected = {
    message: 'Target created successfully'
  }

  servertest(server(), url, options, onResponse)
    .end(JSON.stringify(newTarget))

  function onResponse (err, res) {
    t.falsy(err, 'no error')

    t.is(res.statusCode, 200, 'correct statusCode')
    t.deepEqual(res.body, expected, 'values should match')
    t.end()
  }
})

test.serial.cb('create target endpoint - target created before', function (t) {
  var url = '/api/targets'
  var options = { encoding: 'json', method: 'POST' }
  var newTarget = {
    id: 1,
    url: 'http://example.com',
    value: '0.50',
    maxAcceptsPerDay: '10',
    accept: {
      geoState: {
        $in: [
          'ca',
          'ny'
        ]
      },
      hour: {
        $in: [
          '13',
          '14',
          '15'
        ]
      }
    }
  }

  var expected = {
    message: 'Target created before'
  }

  servertest(server(), url, options, onResponse)
    .end(JSON.stringify(newTarget))

  function onResponse (err, res) {
    t.falsy(err, 'no error')

    t.is(res.statusCode, 200, 'correct statusCode')
    t.deepEqual(res.body, expected, 'values should match')
    t.end()
  }
})

test.serial.cb('create target endpoint - missing id', function (t) {
  var url = '/api/targets'
  var options = { encoding: 'json', method: 'POST' }
  var newTarget = {
    url: 'http://example.com',
    value: '0.50',
    maxAcceptsPerDay: '10',
    accept: {
      geoState: {
        $in: [
          'ca',
          'ny'
        ]
      },
      hour: {
        $in: [
          '13',
          '14',
          '15'
        ]
      }
    }
  }

  var expected = {
    message: 'ID is requierd '
  }

  servertest(server(), url, options, onResponse)
    .end(JSON.stringify(newTarget))

  function onResponse (err, res) {
    t.falsy(err, 'no error')

    t.is(res.statusCode, 200, 'correct statusCode')
    t.deepEqual(res.body, expected, 'values should match')
    t.end()
  }
})

test.serial.cb('get all targets endpoint', function (t) {
  var url = '/api/targets'
  var options = { encoding: 'json', method: 'GET' }

  var expected = {
    message: 'Targets retrieved successfully',
    response: [
      {
        id: 1,
        url: 'http://example.com',
        value: '0.50',
        maxAcceptsPerDay: '10',
        accept: {
          geoState: {
            $in: [
              'ca',
              'ny'
            ]
          },
          hour: {
            $in: [
              '13',
              '14',
              '15'
            ]
          }
        }
      }
    ]
  }

  servertest(server(), url, options, onResponse)

  function onResponse (err, res) {
    t.falsy(err, 'no error')

    t.is(res.statusCode, 200, 'correct statusCode')
    t.deepEqual(res.body, expected, 'values should match')
    t.end()
  }
})

test.serial.cb('get target by id endpoint - first target', function (t) {
  var url = '/api/target/1'
  var options = { encoding: 'json', method: 'GET' }

  var expected = {
    message: 'Target retrieved successfully',
    response:
      {
        id: 1,
        url: 'http://example.com',
        value: '0.50',
        maxAcceptsPerDay: '10',
        accept: {
          geoState: {
            $in: [
              'ca',
              'ny'
            ]
          },
          hour: {
            $in: [
              '13',
              '14',
              '15'
            ]
          }
        }
      }
  }

  servertest(server(), url, options, onResponse)

  function onResponse (err, res) {
    t.falsy(err, 'no error')

    t.is(res.statusCode, 200, 'correct statusCode')
    t.deepEqual(res.body, expected, 'values should match')
    t.end()
  }
})

test.serial.cb('get target by id endpoint - target not found', function (t) {
  var url = '/api/target/4'
  var options = { encoding: 'json', method: 'GET' }

  var expected = {
    message: 'Target not found'
  }

  servertest(server(), url, options, onResponse)

  function onResponse (err, res) {
    t.falsy(err, 'no error')

    t.is(res.statusCode, 200, 'correct statusCode')
    t.deepEqual(res.body, expected, 'values should match')
    t.end()
  }
})

test.serial.cb('update target by id endpoint - first target - success', function (t) {
  var url = '/api/target/1'
  var options = { encoding: 'json', method: 'POST' }
  var updatedTarget = {
    url: 'http://example.com',
    value: '0.50',
    maxAcceptsPerDay: '17',
    accept: {
      geoState: {
        $in: [
          'ca',
          'ny'
        ]
      },
      hour: {
        $in: [
          '11',
          '14',
          '15'
        ]
      }
    }
  }

  var expected = {
    message: 'Target updated successfully'
  }

  servertest(server(), url, options, onResponse)
    .end(JSON.stringify(updatedTarget))

  function onResponse (err, res) {
    t.falsy(err, 'no error')

    t.is(res.statusCode, 200, 'correct statusCode')
    t.deepEqual(res.body, expected, 'values should match')
    t.end()
  }
})

test.serial.cb('update target by id endpoint - first target - not success', function (t) {
  var url = '/api/target/1'
  var options = { encoding: 'json', method: 'POST' }
  var updatedTarget = {
    url: 'http://example.com',
    value: '0.50',
    notExistsField: '17'
  }

  var expected = {
    error: 'Invaild Update'
  }

  servertest(server(), url, options, onResponse)
    .end(JSON.stringify(updatedTarget))

  function onResponse (err, res) {
    t.falsy(err, 'no error')

    t.is(res.statusCode, 500, 'correct statusCode')
    t.deepEqual(res.body, expected, 'values should match')
    t.end()
  }
})

test.serial.cb('makeing decision endpoint - first decision - accept ', function (t) {
  var url = '/route'
  var options = { encoding: 'json', method: 'POST' }

  var expected = {
    url: 'http://example.com',
    decision: '0.50'

  }
  var visitor = {
    geoState: 'ca',
    publisher: 'abc',
    timestamp: '2018-07-19T15:28:59.513Z'
  }

  servertest(server(), url, options, onResponse)
    .end(JSON.stringify(visitor))

  function onResponse (err, res) {
    t.falsy(err, 'no error')

    t.is(res.statusCode, 200, 'correct statusCode')
    t.deepEqual(res.body, expected, 'values should match')
    t.end()
  }
})

test.serial.cb('makeing decision endpoint - second decision - request more than allows', function (t) {
  var url = '/route'
  var options = { encoding: 'json', method: 'POST' }

  var expected = {
    decision: 'reject'
  }
  var visitor = {
    geoState: 'ca',
    publisher: 'abc',
    timestamp: '2018-07-19T15:28:59.513Z'
  }

  var count = 0
  var interval = setInterval(function () {
    servertest(server(), url, options, onResponse)
      .end(JSON.stringify(visitor))

    count++
    if (count === 16) {
      clearInterval(interval)
    }
  }, 10)

  function onResponse (err, res) {
    t.falsy(err, 'no error')

    t.is(res.statusCode, 200, 'correct statusCode')
    t.deepEqual(res.body, expected, 'values should match')
    if (count === 10) {
      t.end()
    }
  }
})
