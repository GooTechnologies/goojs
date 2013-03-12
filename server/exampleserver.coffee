connect = require('connect')
path = require('path')

start = ->
	root = path.resolve(__dirname, '..')
	port = 8000
	app = connect()
	
	
	app.use connect.logger('dev')
	app.use connect.static root
	
	console.log "Starting server on port #{port}"
	app.listen port

exports.start = start