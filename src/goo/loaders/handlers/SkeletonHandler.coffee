define [
	'goo/loaders/handlers/ConfigHandler'

	'goo/animation/Joint'
	'goo/animation/Skeleton'
	'goo/animation/SkeletonPose'
	'goo/loaders/JsonUtils'
	
	'goo/util/PromiseUtil'
], (
ConfigHandler,
Joint, 
Skeleton, 
SkeletonPose,
JsonUtils,

pu,
_) ->

	class SkeletonHandler extends ConfigHandler
		@_register('skeleton')
		
		_create: (skeletonConfig)->
			console.debug "Creating skeleton"
			joints = (
				for jointConfig in skeletonConfig.joints
					joint = new Joint(jointConfig.name)
					joint._index = Math.round(jointConfig.index)
					joint._parentIndex = Math.round(jointConfig.parentIndex)
					
					
					if jointConfig.inverseBindPose.matrix
						parseTransform = JsonUtils.parseTransformMatrix
	
					else if jointConfig.inverseBindPose.rotation.length == 4
						parseTransform = JsonUtils.parseTransformQuat
						
					else if jointConfig.inverseBindPose.rotation.length == 3
						parseTransform = JsonUtils.parseTransformEuler
					else 
						parseTransform = JsonUtils.parseTransform
	
					joint._inverseBindPose.copy(parseTransform(jointConfig.inverseBindPose))
					
					if not jointConfig.inverseBindPose.matrix 
						joint._inverseBindPose.update()
					
					joint
			)
			skeleton = new Skeleton(skeletonConfig.name, joints)
			pose = new SkeletonPose(skeleton)
			pose.setToBindPose()
			return pose

		update: (ref, config)->
			skeleton = @_create(config)
			return pu.createDummyPromise(skeleton)

		remove: (ref)->
			# Do nothing, we didn't save anything
