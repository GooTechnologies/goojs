define [
	'goo/loaders/handlers/ConfigHandler'
	'goo/animation/clip/AnimationClip'
	'goo/loaders/JsonUtils'
	'goo/animation/clip/JointChannel'
	'goo/animation/clip/TransformChannel'
	'goo/animation/clip/InterpolatedFloatChannel'

	'goo/util/PromiseUtil'
], (
	ConfigHandler
	AnimationClip
	JsonUtils
	JointChannel
	TransformChannel
	InterpolatedFloatChannel
	
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
				
					if channelConfig.Type in ['Joint', 'Transform']
						rots = JsonUtils.parseRotationSamples(channelConfig, compressedAnimRange, useCompression)
						trans = JsonUtils.parseTranslationSamples(channelConfig, times.length, useCompression)
						scales = JsonUtils.parseScaleSamples(channelConfig, times.length, useCompression)
					
					if channelConfig.Type == 'Joint'
						channel = new JointChannel(
							channelConfig.JointName
							channelConfig.JointIndex
							times
							rots
							trans
							scales
							blendType
						)
					else if channelConfig.Type == 'Transform'
						channel = new TransformChannel(
							channelConfig.Name
							times
							rots
							trans
							scales
							blendType
						)
					else if channelConfig.Type == 'FloatLERP'
						channel = new InterPolatedFloatChannel(
							channelConfig.Name
							times
							JsonUtils.parseFloatLERPValues(channelConfig, useCompression)
							blendType
						)
					else #TODO: Trigger channel
						console.warn("Unhandled channel type: " + channelConfig.Type)
						continue
					
					clip.addChannel(channel)
			
			return clip
						
		update: (ref, config) ->
			clip = @_create(config)
			pu.createDummyPromise(clip)
			