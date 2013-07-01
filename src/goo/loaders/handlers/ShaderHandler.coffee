define [
	'goo/loaders/handlers/ConfigHandler'

	'goo/renderer/Material'
	'goo/renderer/shaders/ShaderLib'
	'goo/renderer/shaders/ShaderBuilder'
	
	'goo/util/rsvp'
	
	'goo/util/ObjectUtil'
], (
	ConfigHandler,
	Material,
	ShaderLib,
	ShaderBuilder,
	RSVP,
	_
) ->

	class ShaderHandler extends ConfigHandler
		@_register('shader')
		
		_create: (ref) ->
			@_objects ?= {}
			@_objects[ref] = Material.createShader(ShaderLib.simple, ref)

		update: (ref, config) ->
			console.log "Updating shader #{ref}"
			# Currently not possible to update a shader, so update = create

			if config?.attributes and config?.uniforms
				shaderDefinition =
					attributes: config.attributes,
					uniforms: config.uniforms
	
				for key, uniform of shaderDefinition.uniforms
	
					if typeof uniform == 'string'
						funcRegexp = /^function\s?\(([^\)]+)\)\s*\{(.*)}$/
						test = uniform.match(funcRegexp);
						if test?.length == 3
							args = test[1].replace(' ','').split(',')
							body = test[2]
							### jshint -W054 ###
							shaderDefinition.uniforms[key] = new Function(args, body)
	
				if config.processors
					shaderDefinition.processors = [];
					for processor in config.processors
						shaderDefinition.processors.push ShaderBuilder[processor].processor

				if config.defines
					shaderDefinition.defines = config.defines
			else
				shaderDefinition = this._getDefaultShaderDefinition()
			
			promises = [
				@getConfig(config.vshaderRef)
				@getConfig(config.fshaderRef)
			]
			
			RSVP.all(promises).then (shaders)=>
				[vshader, fshader] = shaders
				if not vshader
					console.warn 'Vertex shader', config.vshaderRef, 'in shader', ref, 'not found'
					return
				if not fshader
					console.warn 'Fragment shader', config.fshaderRef, 'in shader', ref, 'not found'
					return

				# We create a new shader here since AFAIK it's not possible to
				# update an existing shader.
				# This leaks resources since the old shader isn't deleted.
				# TODO: Add Shader.release function to release allocated GL resources
				# or a function to re-initialize a shader.
				_.extend shaderDefinition,
					attributes: config.attributes ? {}
					uniforms: config.uniforms ? {}
					vshader: vshader
					fshader: fshader
				
				object = Material.createShader(shaderDefinition, ref)
