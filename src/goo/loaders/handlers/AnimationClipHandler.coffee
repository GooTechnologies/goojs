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
	
	pu
) ->
	class AnimationClipHandler extends ConfigHandler
		@_register('clip')
		
		_create: (clipConfig) ->
			console.debug "Creating animation clip"
			clip = new AnimationClip(clipConfig.name)
			
			useCompression = clipConfig.useCompression || false
			if useCompression
				compsreesdAnimRange = clipConfig.compressedRange || (1 << 15) - 1; # int
			
			if clipConfig.channels and clipConfig.channels.length
				for channelConfig in clip.channels
					times = JsonUtils.parseChannelTimes(channelConfig, useCompression)
				
					if channelConfig.type in ['Joint', 'Transform']
						rots = JsonUtils.parseRotationSamples(channelConfig, compressedAnimRange, useCompression)
						trans = JsonUtils.parseTranslationSamples(channelConfig, times.length, useCompression)
						scales = JsonUtils.parseScaleSamples(channelConfig, times.length, useCompression)
					
					if channelConfig.type == 'Joint'
						channel = new JointChannel(
							channelConfig.jointName,
							channelConfig.jointIndex,
							times,
							rots,
							trans,
							scales
						)
					else if channelConfig.type == 'Transform'
						channel = new TransformChannel(
							channelConfig.name,
							times,
							rots,
							trans,
							scales
						)
					else if channelConfig.type == 'FloatLERP'
						channel = new InterPolatedFloatChannel(
							channelConfig.name
							times
							JsonUtils.parseFloatLERPValues(channelConfig, useCompression)
						)
					else #TODO: Trigger channel
						console.warn("Unhandled channel type: " + type)
						continue
					
				clip.addChannel(channel)
			
			return clip
						
		update: (config) ->
			clip = @_create(config)
			pu.createDummyPromise(clip)
			