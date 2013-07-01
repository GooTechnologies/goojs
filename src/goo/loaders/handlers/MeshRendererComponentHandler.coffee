define [
	'goo/loaders/handlers/ComponentHandler'
	
	'goo/entities/components/MeshRendererComponent'

	'goo/util/rsvp'
	'goo/util/PromiseUtil'
	
	'goo/util/ObjectUtil'
	
	'goo/loaders/handlers/ShaderHandler'
	'goo/loaders/handlers/MaterialHandler'

], (
	ComponentHandler
	MeshRendererComponent,
	RSVP,
	pu,
	_
) ->

	class MeshRendererComponentHandler extends ComponentHandler
		@_register('meshRenderer')
		
			
		_prepare: (config) ->
			_.defaults config,
				materialRefs: []
				cullMode: 'Dynamic'
				castShadows: false
				receiveShadows: false

		_create: (entity, config) ->
			component = new MeshRendererComponent()
			entity.setComponent(component)
			return component

		update: (entity, config) ->
			component = super(entity, config) # Creates component if needed

			materialRefs = config.materialRefs
			if not materialRefs or materialRefs.length == 0
				console.log "No material refs"
				promise = pu.createDummyPromise([])
			else
				promises = []
				for materialRef in materialRefs
					do (materialRef)=>
						promises.push @_getMaterial(materialRef)
				promise = RSVP.all(promises)
				
			promise.then (materials)=>
				component.materials = materials

				for key, value of config when key != 'materials' and component.hasOwnProperty(key)
					component[key] = _.clone(value)
				
				#console.log "MRCH done #{JSON.stringify(config)} #{entity.ref}"
				return component
			.then null, (err)-> console.error "Error handling materials #{err}"	
				

			# TODO: Handle selection
# 			if entityConfig.selected
# 				newMaterials.push @constructor._selectedMaterial

		
		_getMaterial: (ref)->
			console.log "GetMaterial #{ref}"
			@getConfig(ref).then (config)=>
				@updateObject(ref, config, @options)
				
