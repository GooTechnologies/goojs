define [
	'goo/loaders/handlers/ConfigHandler'
	
	'goo/renderer/TextureCreator'
	'goo/renderer/Texture'
	'goo/loaders/dds/DdsLoader'
	'goo/loaders/tga/TgaLoader'

	'goo/util/rsvp'
	'goo/util/PromiseUtil'
	'goo/renderer/Util'

	'goo/util/ObjectUtil'
], (
	ConfigHandler,
	TextureCreator,
	Texture,
	DdsLoader,
	TgaLoader,
	RSVP,
	pu,
	ru,
	_
) ->


	class TextureHandler extends ConfigHandler			
		@_register('texture')		

		@loaders:
			dds: DdsLoader
			tga: TgaLoader


		###
		Options:
			{bool} dontWaitForTextures if true, return promise that resolves once the texture object is created, don't wait 
			for the image to load. Defaults to false. 
		###
		constructor: (@world, @getConfig, @updateObject, @options)->
			@_objects = {}

		_create: (ref, config)->
			_.defaults config, 
				verticalFlip:true

			# Copy texture settings
			settings = 
				wrapS: config.wrapU
				wrapT: config.wrapV
				magFilter: config.magFilter
				minFilter: config.minFilter
				repeat: config.repeat
				offset: config.offset
				# not in converter:
				#anisotropy
				#format: 
				#type
				#flipY

			texture = @_objects[ref] = new Texture ru.clone(TextureCreator.DEFAULT_TEXTURE_2D.image), settings				
			texture.image.dataReady = false
			return texture


		update: (ref, config)->
			imgRef = config.url
			type = imgRef?.split('.').pop().toLowerCase()


			if type in ['mp4']
				# Video textures. Works, but sort of hacky.
				loadedPromise = new RSVP.Promise()
				tc = new TextureCreator()
				texture = tc.loadTextureVideo(config.url, true)
				return pu.createDummyPromise(texture)

			else
				texture = @_objects[ref]
				if not texture then texture = @_create(ref, config)

				#console.log "Loading texture #{ref} with url #{config.url}"
				if not config.url
					console.log "Texture #{ref} has no url"
					return pu.createDummyPromise(texture)


				if type of TextureHandler.loaders
					textureLoader = new TextureHandler.loaders[type]()
					texture.a = imgRef

					loadedPromise = @getConfig(imgRef).then (data)=>
						#console.log "Adding special texture #{imgRef}, data is #{typeof data}"
						textureLoader.load(data, texture, config.verticalFlip, 0, data.byteLength)
						return texture
					.then null, (e)->
						console.error "Error loading texture: ", e

				else if type in ['jpg', 'jpeg', 'png', 'gif']
					loadedPromise = @getConfig(imgRef).then (data)=>
						#console.log "Adding texture #{imgRef}, data is #{typeof data}"
						texture.setImage(data)
						return texture	
					.then null, (e)->
						console.error "Error loading texture: ", e
				else
					throw new Error("Unknown texture type #{type}")



			if @options?.dontWaitForTextures
				# We don't wait for images to load
				return pu.createDummyPromise(texture)
			else
				return loadedPromise

		remove: (ref)->
			console.log "Deleting texture #{ref}"
			delete @_objects[ref]

