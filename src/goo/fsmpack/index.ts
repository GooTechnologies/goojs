import Action = require('./statemachine/actions/Action');
import Actions = require('./statemachine/actions/Actions');
import AddLightAction = require('./statemachine/actions/AddLightAction');
import AddPositionAction = require('./statemachine/actions/AddPositionAction');
import AddVariableAction = require('./statemachine/actions/AddVariableAction');
import ApplyImpulseAction = require('./statemachine/actions/ApplyImpulseAction');
import ArrowsAction = require('./statemachine/actions/ArrowsAction');
import CollidesAction = require('./statemachine/actions/CollidesAction');
import ClickAction = require('./statemachine/actions/ClickAction');
import CompareCounterAction = require('./statemachine/actions/CompareCounterAction');
import CompareCountersAction = require('./statemachine/actions/CompareCountersAction');
import CompareDistanceAction = require('./statemachine/actions/CompareDistanceAction');
import CopyJointTransformAction = require('./statemachine/actions/CopyJointTransformAction');
import DollyZoomAction = require('./statemachine/actions/DollyZoomAction');
import DomEventAction = require('./statemachine/actions/DomEventAction');
import EmitAction = require('./statemachine/actions/EmitAction');
import EvalAction = require('./statemachine/actions/EvalAction');
import FireAction = require('./statemachine/actions/FireAction');
import SetLightPropertiesAction = require('./statemachine/actions/SetLightPropertiesAction');
import SetTimeScaleAction = require('./statemachine/actions/SetTimeScaleAction');
import GetPositionAction = require('./statemachine/actions/GetPositionAction');
import HideAction = require('./statemachine/actions/HideAction');
import HtmlAction = require('./statemachine/actions/HtmlAction');
import SetAnimationOffsetAction = require('./statemachine/actions/SetAnimationOffsetAction');
import NextFrameAction = require('./statemachine/actions/NextFrameAction');
import HoverEnterAction = require('./statemachine/actions/HoverEnterAction');
import HoverExitAction = require('./statemachine/actions/HoverExitAction');
import InBoxAction = require('./statemachine/actions/InBoxAction');
import IncrementCounterAction = require('./statemachine/actions/IncrementCounterAction');
import InFrustumAction = require('./statemachine/actions/InFrustumAction');
import KeyDownAction = require('./statemachine/actions/KeyDownAction');
import KeyPressedAction = require('./statemachine/actions/KeyPressedAction');
import KeyUpAction = require('./statemachine/actions/KeyUpAction');
import LogMessageAction = require('./statemachine/actions/LogMessageAction');
import LookAtAction = require('./statemachine/actions/LookAtAction');
import MouseDownAction = require('./statemachine/actions/MouseDownAction');
import MousePressedAction = require('./statemachine/actions/MousePressedAction');
import MouseMoveAction = require('./statemachine/actions/MouseMoveAction');
import MouseUpAction = require('./statemachine/actions/MouseUpAction');
import MoveAction = require('./statemachine/actions/MoveAction');
import MultiplyVariableAction = require('./statemachine/actions/MultiplyVariableAction');
import NumberCompareAction = require('./statemachine/actions/NumberCompareAction');
import PauseAnimationAction = require('./statemachine/actions/PauseAnimationAction');
import PickAction = require('./statemachine/actions/PickAction');
import PickAndExitAction = require('./statemachine/actions/PickAndExitAction');
import RandomTransitionAction = require('./statemachine/actions/RandomTransitionAction');
import RemoveAction = require('./statemachine/actions/RemoveAction');
import RemoveLightAction = require('./statemachine/actions/RemoveLightAction');
import RemoveParticlesAction = require('./statemachine/actions/RemoveParticlesAction');
import ResumeAnimationAction = require('./statemachine/actions/ResumeAnimationAction');
import RotateAction = require('./statemachine/actions/RotateAction');
import ScaleAction = require('./statemachine/actions/ScaleAction');
import SetAnimationAction = require('./statemachine/actions/SetAnimationAction');
import SetClearColorAction = require('./statemachine/actions/SetClearColorAction');
import SetCounterAction = require('./statemachine/actions/SetCounterAction');
import SetLightRangeAction = require('./statemachine/actions/SetLightRangeAction');
import SetPositionAction = require('./statemachine/actions/SetPositionAction');
import SetRenderTargetAction = require('./statemachine/actions/SetRenderTargetAction');
import SetRotationAction = require('./statemachine/actions/SetRotationAction');
import SetVariableAction = require('./statemachine/actions/SetVariableAction');
import ShakeAction = require('./statemachine/actions/ShakeAction');
import ShowAction = require('./statemachine/actions/ShowAction');
import SmokeAction = require('./statemachine/actions/SmokeAction');
import SoundFadeInAction = require('./statemachine/actions/SoundFadeInAction');
import SoundFadeOutAction = require('./statemachine/actions/SoundFadeOutAction');
import SwitchCameraAction = require('./statemachine/actions/SwitchCameraAction');
import TagAction = require('./statemachine/actions/TagAction');
import TransitionAction = require('./statemachine/actions/TransitionAction');
import TransitionOnMessageAction = require('./statemachine/actions/TransitionOnMessageAction');
import TriggerEnterAction = require('./statemachine/actions/TriggerEnterAction');
import TriggerLeaveAction = require('./statemachine/actions/TriggerLeaveAction');
import TweenLightColorAction = require('./statemachine/actions/TweenLightColorAction');
import TweenLookAtAction = require('./statemachine/actions/TweenLookAtAction');
import TweenMoveAction = require('./statemachine/actions/TweenMoveAction');
import TweenOpacityAction = require('./statemachine/actions/TweenOpacityAction');
import TweenRotationAction = require('./statemachine/actions/TweenRotationAction');
import TweenScaleAction = require('./statemachine/actions/TweenScaleAction');
import TweenTextureOffsetAction = require('./statemachine/actions/TweenTextureOffsetAction');
import WaitAction = require('./statemachine/actions/WaitAction');
import WasdAction = require('./statemachine/actions/WasdAction');
import TogglePostFxAction = require('./statemachine/actions/TogglePostFxAction');
import ToggleFullscreenAction = require('./statemachine/actions/ToggleFullscreenAction');
import PlaySoundAction = require('./statemachine/actions/PlaySoundAction');
import PauseSoundAction = require('./statemachine/actions/PauseSoundAction');
import TweenMaterialColorAction = require('./statemachine/actions/TweenMaterialColorAction');
import ApplyForceAction = require('./statemachine/actions/ApplyForceAction');
import SetRigidBodyRotationAction = require('./statemachine/actions/SetRigidBodyRotationAction');
import MuteAction = require('./statemachine/actions/MuteAction');
import StopSoundAction = require('./statemachine/actions/StopSoundAction');
import ToggleMuteAction = require('./statemachine/actions/ToggleMuteAction');
import SetRigidBodyVelocityAction = require('./statemachine/actions/SetRigidBodyVelocityAction');
import SetRigidBodyAngularVelocityAction = require('./statemachine/actions/SetRigidBodyAngularVelocityAction');
import SetRigidBodyPositionAction = require('./statemachine/actions/SetRigidBodyPositionAction');
import ApplyTorqueAction = require('./statemachine/actions/ApplyTorqueAction');
import UnmuteAction = require('./statemachine/actions/UnmuteAction');
import StartTimelineAction = require('./statemachine/actions/StartTimelineAction');
import PauseTimelineAction = require('./statemachine/actions/PauseTimelineAction');
import SetMaterialColorAction = require('./statemachine/actions/SetMaterialColorAction');
import SetHtmlTextAction = require('./statemachine/actions/SetHtmlTextAction');
import SpriteAnimationAction = require('./statemachine/actions/SpriteAnimationAction');
import StopTimelineAction = require('./statemachine/actions/StopTimelineAction');
import StartParticleSystemAction = require('./statemachine/actions/StartParticleSystemAction');
import SetTimelineTimeAction = require('./statemachine/actions/SetTimelineTimeAction');
import StopParticleSystemAction = require('./statemachine/actions/StopParticleSystemAction');
import PauseParticleSystemAction = require('./statemachine/actions/PauseParticleSystemAction');

var all = {
	MachineHandler: require('./MachineHandler'),
	ProximityComponent: require('./proximity/ProximityComponent'),
	ProximitySystem: require('./proximity/ProximitySystem'),
	Action,
	Actions,
	SetRigidBodyAngularVelocityAction,
	StartParticleSystemAction,
	StopParticleSystemAction,
	SetTimelineTimeAction,
	PlaySoundAction,
	SpriteAnimationAction,
	PauseParticleSystemAction,
	PauseTimelineAction,
	ToggleMuteAction,
	TweenMaterialColorAction,
	StopTimelineAction,
	SetHtmlTextAction,
	StartTimelineAction,
	MuteAction,
	ApplyForceAction,
	SetRigidBodyVelocityAction,
	UnmuteAction,
	SetMaterialColorAction,
	ApplyTorqueAction,
	PauseSoundAction,
	SetRigidBodyRotationAction,
	ToggleFullscreenAction,
	StopSoundAction,
	AddLightAction,
	AddPositionAction,
	SetRigidBodyPositionAction,
	TogglePostFxAction,
	SetLightPropertiesAction,
	AddVariableAction,
	ApplyImpulseAction,
	ArrowsAction,
	CollidesAction,
	ClickAction,
	CompareCounterAction,
	CompareCountersAction,
	CompareDistanceAction,
	CopyJointTransformAction,
	DollyZoomAction,
	DomEventAction,
	EmitAction,
	EvalAction,
	FireAction,
	SetTimeScaleAction,
	GetPositionAction,
	HideAction,
	NextFrameAction,
	HoverEnterAction,
	HtmlAction,
	InBoxAction,
	IncrementCounterAction,
	InFrustumAction,
	SetAnimationOffsetAction,
	KeyDownAction,
	KeyPressedAction,
	KeyUpAction,
	LogMessageAction,
	LookAtAction,
	MouseDownAction,
	HoverExitAction,
	MousePressedAction,
	MouseMoveAction,
	MouseUpAction,
	MoveAction,
	MultiplyVariableAction,
	NumberCompareAction,
	PauseAnimationAction,
	PickAction,
	PickAndExitAction,
	RandomTransitionAction,
	RemoveAction,
	RemoveLightAction,
	RemoveParticlesAction,
	ResumeAnimationAction,
	RotateAction,
	ScaleAction,
	SetAnimationAction,
	SetClearColorAction,
	SetCounterAction,
	SetLightRangeAction,
	SetPositionAction,
	SetRenderTargetAction,
	SetRotationAction,
	SetVariableAction,
	ShakeAction,
	ShowAction,
	SmokeAction,
	SoundFadeInAction,
	SoundFadeOutAction,
	SwitchCameraAction,
	TagAction,
	TransitionAction,
	TransitionOnMessageAction,
	TriggerEnterAction,
	TriggerLeaveAction,
	TweenLightColorAction,
	TweenLookAtAction,
	TweenMoveAction,
	TweenOpacityAction,
	TweenRotationAction,
	TweenScaleAction,
	TweenTextureOffsetAction,
	WaitAction,
	WasdAction,
	FSMUtil: require('./statemachine/FSMUtil'),
	FsmUtils: require('./statemachine/FsmUtils'),
	Machine: require('./statemachine/Machine'),
	State: require('./statemachine/State'),
	StateMachineComponent: require('./statemachine/StateMachineComponent'),
	StateMachineSystem: require('./statemachine/StateMachineSystem'),
	StateMachineComponentHandler: require('./StateMachineComponentHandler'),
	StateMachineHandlers: require('./StateMachineHandlers')
};

export = all;

if (typeof(window) !== 'undefined') {
	for (var key in all) {
		(<any>window).goo[key] = all[key];
	}
}