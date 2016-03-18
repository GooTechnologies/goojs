import BinaryLerpSource from './blendtree/BinaryLerpSource';
import ClipSource from './blendtree/ClipSource';
import FrozenClipSource from './blendtree/FrozenClipSource';
import ManagedTransformSource from './blendtree/ManagedTransformSource';
import AbstractAnimationChannel from './clip/AbstractAnimationChannel';
import AnimationClip from './clip/AnimationClip';
import AnimationClipInstance from './clip/AnimationClipInstance';
import InterpolatedFloatChannel from './clip/InterpolatedFloatChannel';
import JointChannel from './clip/JointChannel';
import JointData from './clip/JointData';
import TransformChannel from './clip/TransformChannel';
import TransformData from './clip/TransformData';
import TriggerChannel from './clip/TriggerChannel';
import TriggerData from './clip/TriggerData';
import AnimationComponent from './components/AnimationComponent';
import AnimationClipHandler from './handlers/AnimationClipHandler';
import AnimationComponentHandler from './handlers/AnimationComponentHandler';
import AnimationHandlers from './handlers/AnimationHandlers';
import AnimationLayersHandler from './handlers/AnimationLayersHandler';
import AnimationStateHandler from './handlers/AnimationStateHandler';
import SkeletonHandler from './handlers/SkeletonHandler';
import Joint from './Joint';
import AnimationLayer from './layer/AnimationLayer';
import LayerLerpBlender from './layer/LayerLerpBlender';
import Skeleton from './Skeleton';
import SkeletonPose from './SkeletonPose';
import AbstractState from './state/AbstractState';
import AbstractTransitionState from './state/AbstractTransitionState';
import FadeTransitionState from './state/FadeTransitionState';
import FrozenTransitionState from './state/FrozenTransitionState';
import SteadyState from './state/SteadyState';
import SyncFadeTransitionState from './state/SyncFadeTransitionState';
import AnimationSystem from './systems/AnimationSystem';
import ObjectUtils from '../util/ObjectUtils';

module.exports = {
	BinaryLerpSource,
	ClipSource,
	FrozenClipSource,
	ManagedTransformSource,
	AbstractAnimationChannel,
	AnimationClip,
	AnimationClipInstance,
	InterpolatedFloatChannel,
	JointChannel,
	JointData,
	TransformChannel,
	TransformData,
	TriggerChannel,
	TriggerData,
	AnimationComponent,
	AnimationClipHandler,
	AnimationComponentHandler,
	AnimationHandlers,
	AnimationLayersHandler,
	AnimationStateHandler,
	SkeletonHandler,
	Joint,
	AnimationLayer,
	LayerLerpBlender,
	Skeleton,
	SkeletonPose,
	AbstractState,
	AbstractTransitionState,
	FadeTransitionState,
	FrozenTransitionState,
	SteadyState,
	SyncFadeTransitionState,
	AnimationSystem,
};

ObjectUtils.extend(window.goo, module.exports);