define [
	'goo/loaders/handlers/ComponentHandler'
	
	'goo/entities/components/CameraComponent'
	'goo/renderer/Camera'
	
	'goo/util/rsvp'
	'goo/util/PromiseUtil'
	'goo/lib/underscore'
], (
ComponentHandler,
CameraComponent,
Camera,
RSVP,
pu)->

	
	
	class CameraComponentHandler extends ComponentHandler
		@_register('camera')
		
		_prepare: (config)->
			_.defaults config, 
				fov: 45
				near: 1
				# REVIEW 1000?
				# MB: Copied from EntityBinding. Ask Vilcans.
				far: 10000
		
		_create: (entity, config)->
			camera = new Camera(45, 1, 1, 1000)
			component = new CameraComponent(camera)
			entity.setComponent(component)
			return component

			
		update: (entity, config)->
			component = super(entity, config) # Creates component if needed
			
			component.camera.setFrustumPerspective(
				config.fov,
				undefined,	# don't change aspect ratio
				config.near,
				config.far)

			return pu.dummyPromise(component)


		remove: (entity)->
			# This removes the camera entity,
			# but there is still a visible view that isn't updated.
			# Perhaps change the engine so it draws just black if
			# there is no camera?
			if entity?.cameraComponent?.camera
				@world.removeEntity entity.cameraComponent.camera
			super(entity)
		
