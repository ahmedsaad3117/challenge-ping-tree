var { URL } = require('url')
var http = require('http')
var cuid = require('cuid')
var Corsify = require('corsify')
var sendJson = require('send-data/json')
var ReqLogger = require('req-logger')
var healthPoint = require('healthpoint')
var HttpHashRouter = require('http-hash-router')

var redis = require('./redis')
var version = require('../package.json').version
var controllers = require('./controllers/targetController')

var router = HttpHashRouter()
var logger = ReqLogger({ version: version })
var health = healthPoint({ version: version }, redis.healthCheck)
var cors = Corsify({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, accept, content-type'
})

router.set('/favicon.ico', empty)

module.exports = function createServer () {
  return http.createServer(cors(handler))
}

router.set('/api/targets', {
  POST: (...params) => controllers.createTarget(...params),
  GET: (...params) => controllers.getAllTargets(...params)
})

router.set('/api/target/:id', {
  GET: (...params) => controllers.getTargetById(...params),
  POST: (...params) => controllers.updateTargetById(...params)
})

router.set('/route', {
  POST: (...params) => controllers.makeingDecision(...params)
})

async function handler (req, res) {
  if (req.url === '/health') return health(req, res)
  req.id = cuid()
  logger(req, res, { requestId: req.id }, function (info) {
    info.authEmail = (req.auth || {}).email
    console.log(info)
  })
  var body = await getBody(req)
  const protocol = req.connection.encrypted ? 'https' : 'http'

  router(req, res, {
    query: getQuery(protocol, req.headers.host, req.url),
    body: body
  }, onError.bind(null, req, res))
}

function onError (req, res, err) {
  if (!err) return

  res.statusCode = err.statusCode || 500
  logError(req, res, err)

  sendJson(req, res, {
    error: err.message || http.STATUS_CODES[res.statusCode]
  })
}

function logError (req, res, err) {
  if (process.env.NODE_ENV === 'test') return

  var logType = res.statusCode >= 500 ? 'error' : 'warn'

  console[logType]({
    err: err,
    requestId: req.id,
    statusCode: res.statusCode
  }, err.message)
}

function empty (req, res) {
  res.writeHead(204)
  res.end()
}

function getQuery (protocol, host, url) {
  const fullUrl = `${protocol}://${host}${url}`

  const myUrl = new URL(fullUrl)
  return myUrl.searchParams
}

async function getBody (req) {
  const buffers = []

  for await (const chunk of req) {
    buffers.push(chunk)
  }

  var data = Buffer.concat(buffers).toString()
  data = data ? JSON.parse(data) : {}
  return data
}
