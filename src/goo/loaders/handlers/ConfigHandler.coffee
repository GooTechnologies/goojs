define [], () ->

	class ConfigHandler
		constructor: (@world, @getConfig, @updateObject, @options)->
		
		@handlerClasses = {}
		@getHandler: (type)->
			@handlerClasses[type] #or console.warn("No config handler found for type #{type}")

		@_register: (type)->
			@_type = type
			ConfigHandler.handlerClasses[type] = @
	
		update: (ref, config)->
			# Override me!