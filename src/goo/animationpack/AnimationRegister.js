define([
	'goo/scripts/Scripts',
	'goo/animationpack/Joint',
	'goo/animationpack/Skeleton',
	'goo/animationpack/SkeletonPose',
	'goo/animationpack/blendtree/BinaryLERPSource',
	'goo/animationpack/blendtree/ClipSource',
	'goo/animationpack/blendtree/FrozenClipSource',
	'goo/animationpack/blendtree/ManagedTransformSource',
	'goo/animationpack/clip/AbstractAnimationChannel',
	'goo/animationpack/clip/AnimationClip',
	'goo/animationpack/clip/AnimationClipInstance',
	'goo/animationpack/clip/InterpolatedFloatChannel',
	'goo/animationpack/clip/JointChannel',
	'goo/animationpack/clip/JointData',
	'goo/animationpack/clip/TransformChannel',
	'goo/animationpack/clip/TransformData',
	'goo/animationpack/clip/TriggerChannel',
	'goo/animationpack/clip/TriggerData',
	'goo/animationpack/layer/AnimationLayer',
	'goo/animationpack/layer/LayerLERPBlender',
	'goo/animationpack/state/AbstractState',
	'goo/animationpack/state/AbstractTransitionState',
	'goo/animationpack/state/FadeTransitionState',
	'goo/animationpack/state/FrozenTransitionState',
	'goo/animationpack/state/SteadyState',
	'goo/animationpack/state/SyncFadeTransitionState'
], function (Scripts) {
	'use strict';

	var defines = [
		'goo/scripts/Scripts',
		'goo/animationpack/Joint',
		'goo/animationpack/Skeleton',
		'goo/animationpack/SkeletonPose',
		'goo/animationpack/blendtree/BinaryLERPSource',
		'goo/animationpack/blendtree/ClipSource',
		'goo/animationpack/blendtree/FrozenClipSource',
		'goo/animationpack/blendtree/ManagedTransformSource',
		'goo/animationpack/clip/AbstractAnimationChannel',
		'goo/animationpack/clip/AnimationClip',
		'goo/animationpack/clip/AnimationClipInstance',
		'goo/animationpack/clip/InterpolatedFloatChannel',
		'goo/animationpack/clip/JointChannel',
		'goo/animationpack/clip/JointData',
		'goo/animationpack/clip/TransformChannel',
		'goo/animationpack/clip/TransformData',
		'goo/animationpack/clip/TriggerChannel',
		'goo/animationpack/clip/TriggerData',
		'goo/animationpack/layer/AnimationLayer',
		'goo/animationpack/layer/LayerLERPBlender',
		'goo/animationpack/state/AbstractState',
		'goo/animationpack/state/AbstractTransitionState',
		'goo/animationpack/state/FadeTransitionState',
		'goo/animationpack/state/FrozenTransitionState',
		'goo/animationpack/state/SteadyState',
		'goo/animationpack/state/SyncFadeTransitionState'
	];

	for (var i = 1; i < defines.length; i++) {
		var name = defines[i].slice(defines[i].lastIndexOf('/') + 1);
		Scripts.addClass(name, arguments[i]);
	}
});