define [
	'goo/loaders/handlers/ConfigHandler'
	'goo/animation/clip/AnimationClip'
	'goo/loaders/JsonUtils'
	'goo/animation/clip/JointChannel'
	'goo/animation/clip/TransformChannel'
	'goo/animation/clip/InterpolatedFloatChannel'
	'goo/animation/clip/TriggerChannel'

	'goo/util/PromiseUtil'
], (
	ConfigHandler
	AnimationClip
	JsonUtils
	JointChannel
	TransformChannel
	InterpolatedFloatChannel
	TriggerChannel
	
	pu
) ->
	class AnimationClipHandler extends ConfigHandler
		@_register('clip')
		
		_create: (clipConfig) ->
			console.debug "Creating animation clip"
			clip = new AnimationClip(clipConfig.name)
			
			useCompression = clipConfig.useCompression || false
			if useCompression
				compressedAnimRange = clipConfig.compressedRange || (1 << 15) - 1; # int
			
			if clipConfig.channels and clipConfig.channels.length
				for channelConfig in clipConfig.channels
					times = JsonUtils.parseChannelTimes(channelConfig, useCompression)
					blendType = channelConfig.blendType
				
					if channelConfig.type in ['Joint', 'Transform']
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
						
		update: (ref, config) ->
			clip = @_create(config)
			pu.createDummyPromise(clip)
			