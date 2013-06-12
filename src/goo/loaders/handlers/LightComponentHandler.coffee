define [
	'goo/loaders/handlers/ComponentHandler'
	
	'goo/entities/components/LightComponent'
	'goo/renderer/light/PointLight'

	'goo/math/Vector'
	
	'goo/util/rsvp'
	'goo/util/PromiseUtil'
	'goo/util/ObjectUtil'
], (
	ComponentHandler,
	LightComponent,
	PointLight,
	Vector,
	RSVP,
	pu,
	_
) ->

	class LightComponentHandler extends ComponentHandler
		@_register('light')
		
		_prepare: (config) ->
			_.defaults config,
				direction: [0,0,0]
				color: [1,1,1,1]
				attenuate: true
				shadowCaster: false

			if config.shadowCaster
				_.defaults config.shadowSettings,
					type: 'Blur'

		_create: (entity, config) ->
			component = new LightComponent(new PointLight())
			entity.setComponent(component)
			return component
			

		update: (entity, config) ->
			component = super(entity, config) # Creates component if needed

			light = component.light
			
			for key, value of config when light.hasOwnProperty(key)
				if light[key] instanceof Vector
					light[key].set value
				else
					light[key] = _.clone(value)
			
			return pu.createDummyPromise(component)
			