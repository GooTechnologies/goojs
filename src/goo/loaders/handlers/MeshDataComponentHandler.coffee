define [
	'goo/loaders/handlers/ComponentHandler'

	'goo/entities/components/MeshDataComponent'
	'goo/renderer/bounds/BoundingBox'

	'goo/util/rsvp'
	'goo/util/PromiseUtil'
	'goo/util/ObjectUtil'
	
], (
ComponentHandler,
MeshDataComponent,
BoundingBox,
RSVP,
pu,
_) ->

		
		




	class MeshDataComponentHandler extends ComponentHandler
		@_register('meshData')
		
		_prepare: (config) ->
			_.defaults config,
				# TODO: make default for mesh or support missing mesh
				meshRef: null
				
		_create: (entity, config) ->
			# Created in update

		update: (entity, config) ->
			super(entity, config) # Creates component if needed
			meshRef = config.meshRef

			if not meshRef
				console.error "No meshRef in meshDataComponent for #{entity.ref}"
				
			@getConfig(meshRef).then (config)=>
				@updateObject(meshRef, config).then (meshData)=>
					component = new MeshDataComponent(meshData)

					if meshData.boundingBox
						min = meshData.boundingBox.min;
						max = meshData.boundingBox.max;
						size = [max[0]-min[0], max[1]-min[1], max[2]-min[2]];
						center = [(max[0]+min[0])*0.5, (max[1]+min[1])*0.5, (max[2]+min[2])*0.5];

						bounding = new BoundingBox();
						bounding.xExtent = size[0];
						bounding.yExtent = size[1];
						bounding.zExtent = size[2];
						bounding.center.seta(center);
						component.modelBound = bounding;
						component.autoCompute = false;

					entity.setComponent(component)
					return component
			

				
