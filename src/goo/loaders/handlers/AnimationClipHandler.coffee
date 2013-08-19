define [
	'goo/loaders/handlers/ConfigHandler'
	'goo/animation/clip/AnimationClip'
	'goo/loaders/JsonUtils'
	'goo/animation/clip/JointChannel'
	'goo/animation/clip/TransformChannel'
	'goo/animation/clip/InterpolatedFloatChannel'
	'goo/animation/clip/TriggerChannel'

	'goo/util/PromiseUtil'
	'goo/util/ArrayUtil'
], (
	ConfigHandler
	AnimationClip
	JsonUtils
	JointChannel
	TransformChannel
	InterpolatedFloatChannel
	TriggerChannel
	
	PromiseUtil
	ArrayUtil
) ->
	class AnimationClipHandler extends ConfigHandler
		@_register('clip')
		

						
		update: (ref, config) ->
			if config.binaryData
				@getConfig(config.binaryData).then (bindata)=>
					if not bindata then throw new Error("Binary clip data was empty")
					@_createAnimationClip(config, bindata)
			else
				clip = @_createAnimationClip(config)
				PromiseUtil.createDummyPromise(clip)


		_createAnimationClip: (clipConfig, bindata) ->
			console.debug "Creating animation clip"
			clip = new AnimationClip(clipConfig.name)
			
			useCompression = clipConfig.useCompression || false
			if useCompression
				compressedAnimRange = clipConfig.compressedRange || (1 << 15) - 1; # int
			
			if clipConfig.channels and clipConfig.channels.length
				for channelConfig in clipConfig.channels
					if bindata
						times = ArrayUtil.getTypedArray(bindata, channelConfig.times)
					else
						times = new Float32Array JsonUtils.parseChannelTimes(channelConfig, useCompression)
					blendType = channelConfig.blendType
				
					if channelConfig.type in ['Joint', 'Transform']
						if bindata
							rots = ArrayUtil.getTypedArray(bindata, channelConfig.rotationSamples)
							trans = ArrayUtil.getTypedArray(bindata, channelConfig.translationSamples)
							scales = ArrayUtil.getTypedArray(bindata, channelConfig.scaleSamples)

						else
							rots = JsonUtils.parseRotationSamples(channelConfig, compressedAnimRange, useCompression)
							trans = JsonUtils.parseTranslationSamples(channelConfig, times.length, useCompression)
							scales = JsonUtils.parseScaleSamples(channelConfig, times.length, useCompression)
					
					if channelConfig.type == 'Joint'
						channel = new JointChannel(
							channelConfig.jointName
							channelConfig.jointIndex
							times
							rots
							trans
							scales
							blendType
						)
					else if channelConfig.type == 'Transform'
						channel = new TransformChannel(
							channelConfig.name
							times
							rots
							trans
							scales
							blendType
						)
					else if channelConfig.type == 'FloatLERP'
						channel = new InterpolatedFloatChannel(
							channelConfig.name
							times
							JsonUtils.parseFloatLERPValues(channelConfig, useCompression)
							blendType
						)
					else if channelConfig.type == 'Trigger'
						channel = new TriggerChannel(
							channelConfig.name
							times
							channelConfig.keys
						)
						if channelConfig.guarantee
							channel.guarantee = true
					else #TODO: Trigger channel
						console.warn("Unhandled channel type: " + channelConfig.type)
						continue
					
					clip.addChannel(channel)
			
			return clip			