define([
	'goo/loaders/handlers/ConfigHandler',
	'goo/animation/Joint',
	'goo/animation/Skeleton',
	'goo/animation/SkeletonPose',
	'goo/loaders/JsonUtils',
	'goo/util/PromiseUtil'
], function(
		ConfigHandler,
		Joint,
		Skeleton,
		SkeletonPose,
		JsonUtils,
		pu,
		_
) {
	function SkeletonHandler() {
		ConfigHandler.apply(this, arguments);
	}

	SkeletonHandler.prototype = Object.create(ConfigHandler.prototype);
	ConfigHandler._registerClass('skeleton', SkeletonHandler);

	SkeletonHandler.prototype._create = function(skeletonConfig) {
		console.debug("Creating skeleton");

		var joints = [];
		for (var i = 0; i < skeletonConfig.joints.length; i++) {
			var jointConfig = skeletonConfig.joints[i];
			var joint = new Joint(jointConfig.name);
			joint._index = Math.round(jointConfig.index);
			joint._parentIndex = Math.round(jointConfig.parentIndex);
			var parseTransform;
			if (jointConfig.inverseBindPose.matrix) {
				parseTransform = JsonUtils.parseTransformMatrix;
			} else if (jointConfig.inverseBindPose.rotation.length === 4) {
				parseTransform = JsonUtils.parseTransformQuat;
			} else if (jointConfig.inverseBindPose.rotation.length === 3) {
				parseTransform = JsonUtils.parseTransformEuler;
			} else {
				parseTransform = JsonUtils.parseTransform;
			}
			joint._inverseBindPose.copy(parseTransform(jointConfig.inverseBindPose));
			if (!jointConfig.inverseBindPose.matrix) {
				joint._inverseBindPose.update();
			}
			joints.push(joint);
		}

		var skeleton = new Skeleton(skeletonConfig.name, joints);
		var pose = new SkeletonPose(skeleton);
		pose.setToBindPose();
		return pose;
	};

	SkeletonHandler.prototype.update = function(ref, config) {
		var skeleton = this._create(config);
		return pu.createDummyPromise(skeleton);
	};

	SkeletonHandler.prototype.remove = function(ref) {};

	return SkeletonHandler;
});
