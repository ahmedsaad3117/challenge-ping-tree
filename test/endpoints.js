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
