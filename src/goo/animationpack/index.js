module.exports = {
	Source: require('./blendtree/Source'),
	BinaryLerpSource: require('./blendtree/BinaryLerpSource'),
	ClipSource: require('./blendtree/ClipSource'),
	FrozenClipSource: require('./blendtree/FrozenClipSource'),
	ManagedTransformSource: require('./blendtree/ManagedTransformSource'),
	AbstractAnimationChannel: require('./clip/AbstractAnimationChannel'),
	AnimationClip: require('./clip/AnimationClip'),
	AnimationClipInstance: require('./clip/AnimationClipInstance'),
	InterpolatedFloatChannel: require('./clip/InterpolatedFloatChannel'),
	JointChannel: require('./clip/JointChannel'),
	JointData: require('./clip/JointData'),
	TransformChannel: require('./clip/TransformChannel'),
	TransformData: require('./clip/TransformData'),
	TriggerChannel: require('./clip/TriggerChannel'),
	TriggerData: require('./clip/TriggerData'),
	AnimationComponent: require('./components/AnimationComponent'),
	AnimationClipHandler: require('./handlers/AnimationClipHandler'),
	AnimationComponentHandler: require('./handlers/AnimationComponentHandler'),
	AnimationHandlers: require('./handlers/AnimationHandlers'),
	AnimationLayersHandler: require('./handlers/AnimationLayersHandler'),
	AnimationStateHandler: require('./handlers/AnimationStateHandler'),
	SkeletonHandler: require('./handlers/SkeletonHandler'),
	Joint: require('./Joint'),
	AnimationLayer: require('./layer/AnimationLayer'),
	LayerLerpBlender: require('./layer/LayerLerpBlender'),
	Skeleton: require('./Skeleton'),
	SkeletonPose: require('./SkeletonPose'),
	AbstractState: require('./state/AbstractState'),
	AbstractTransitionState: require('./state/AbstractTransitionState'),
	FadeTransitionState: require('./state/FadeTransitionState'),
	FrozenTransitionState: require('./state/FrozenTransitionState'),
	SteadyState: require('./state/SteadyState'),
	SyncFadeTransitionState: require('./state/SyncFadeTransitionState'),
	AnimationSystem: require('./systems/AnimationSystem')
};

if (typeof(window) !== 'undefined') {
	for (var key in module.exports) {
		window.goo[key] = module.exports[key];
	}
}