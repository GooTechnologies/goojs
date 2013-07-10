define [
	'goo/loaders/handlers/ConfigHandler'
	
	'goo/renderer/Material'
	'goo/renderer/Util'
	'goo/renderer/shaders/ShaderLib'
	
	'goo/util/rsvp'
	'goo/util/PromiseUtil'
	'goo/util/ObjectUtil'

], (
	ConfigHandler,
	Material,
	Util, 
	ShaderLib,
	RSVP,
	pu,
	_
) ->
	class MaterialHandler extends ConfigHandler			
		@_register('material')		
		
		constructor: (@world, @getConfig, @updateObject, @options)->
			@_objects = {}
		
		_prepare: (config)->
			config.blendState ?= {}
			_.defaults config.blendState,
					blending: 'NoBlending'
					blendEquation: 'AddEquation'
					blendSrc: 'SrcAlphaFactor'
					blendDst: 'OneMinusSrcAlphaFactor'
			config.cullState ?= {}
			_.defaults config.cullState,
				enabled : true
				cullFace : 'Back'
				frontFace : 'CCW'
			config.depthState ?= {}
			_.defaults config.depthState,
				enabled: true
				write: true

			config.renderQueue ?= -1
		
		_create: (ref)->
			@_objects ?= {}
			@_objects[ref] = new Material(ref)
		
		
		update: (ref, config)->
			@_prepare(config)
			if not @_objects?[ref] then @_create(ref)
			object = @_objects[ref]

			@_getShaderObject(config.shaderRef, config.wireframe).then (shader)=>
				#console.log "Got shader"
				
				if not shader
					console.warn 'Unknown shader', config.shaderRef, '- not updating material', ref
					return
	
				if config.wireframe
					object.wireframe = config.wireframe
				if config.wireframeColor
					object.wireframeColor = Util.clone config.wireframeColor
	
				object.blendState = Util.clone config.blendState
				object.cullState = Util.clone config.cullState
				object.depthState = Util.clone config.depthState
				if config.renderQueue == -1 then object.renderQueue = null
				else object.renderQueue = config.renderQueue
	

				object.shader = shader
				object.uniforms = {}
				for name, value of config.uniforms
					object.uniforms[name] = _.clone(value)
	

				#console.log "#{config.textureRefs?.length or 0} textures"
				promises = []

				for textureType, textureRef of config.texturesMapping
					do (textureType, textureRef)=>
						promises.push @getConfig(textureRef).then (textureConfig)=>
							@updateObject(textureRef, textureConfig, @options).then (texture)=>
								#console.log "Got texture: #{textureRef} #{texture}"
								type: textureType
								ref: textureRef 
								texture: texture
				
				if promises?.length 
					return RSVP.all(promises).then (textures)-> 
						for texture in textures
							object.setTexture(texture.type, texture.texture)

						return object
					.then null, (err)->
						console.error "Error loading textures: #{err}"
				else 
					return object
				
		
		remove: (ref)->
			delete @_objects[ref]

		_getShaderObject: (ref, wireframe)->
			if wireframe
				promise = new RSVP.Promise()
				shader = Material.createShader ShaderLib.simple
				promise.resolve(shader)
				return promise
			else if ref?
				@getConfig(ref).then (config)=>
					@updateObject(ref, config, @options)
			else
				defaultShader = Material.createShader(ShaderLib.texturedLit, 'DefaultShader')
				pu.createDummyPromise(defaultShader)



