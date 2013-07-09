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
				for jointConfig in skeletonConfig.Joints
					joint = new Joint(jointConfig.Name)
					joint._index = Math.round(jointConfig.Index)
					joint._parentIndex = Math.round(jointConfig.ParentIndex)
					
					
					if jointConfig.InverseBindPose.Matrix
						parseTransform = JsonUtils.parseTransformMatrix
	
					else if jointConfig.InverseBindPose.Rotation.length == 4
						parseTransform = JsonUtils.parseTransformQuat
						
					else if jointObj.InverseBindPose.Rotation.length == 3
						parseTransform = JsonUtils.parseTransformEuler
					else 
						parseTransform = JsonUtils.parseTransform
	
					joint._inverseBindPose.copy(parseTransform(jointConfig.InverseBindPose))
					
					if not jointConfig.InverseBindPose.Matrix 
						joint._inverseBindPose.update()
					
					joint
			)
			new Skeleton(skeletonConfig.name, joints)
			
		update: (ref, config)->
			skeleton = @_create(config)
			return pu.createDummyPromise(skeleton)

		remove: (ref)->
			# Do nothing, we didn't save anything
