import ArrowsAction from './ArrowsAction';
import MouseUpAction from './MouseUpAction';
import MouseDownAction from './MouseDownAction';
import MouseMoveAction from './MouseMoveAction';
import MousePressedAction from './MousePressedAction';
import KeyUpAction from './KeyUpAction';
import KeyDownAction from './KeyDownAction';
import KeyPressedAction from './KeyPressedAction';
import PickAction from './PickAction';
import PickAndExitAction from './PickAndExitAction';
import ClickAction from './ClickAction';
import HoverEnterAction from './HoverEnterAction';
import HoverExitAction from './HoverExitAction';
import WasdAction from './WasdAction';
import MoveAction from './MoveAction';
import RotateAction from './RotateAction';
import ScaleAction from './ScaleAction';
import LookAtAction from './LookAtAction';
import TweenMoveAction from './TweenMoveAction';
import TweenRotationAction from './TweenRotationAction';
import TweenScaleAction from './TweenScaleAction';
import TweenLookAtAction from './TweenLookAtAction';
import ShakeAction from './ShakeAction';
import PauseAnimationAction from './PauseAnimationAction';
import ResumeAnimationAction from './ResumeAnimationAction';
import SetAnimationAction from './SetAnimationAction';
import SetTimeScale from './SetTimeScale';
import WaitAction from './WaitAction';
import TransitionAction from './TransitionAction';
import NextFrameAction from './NextFrameAction';
import RandomTransitionAction from './RandomTransitionAction';
import EmitAction from './EmitAction';
import TransitionOnMessageAction from './TransitionOnMessageAction';
import EvalAction from './EvalAction';
import HideAction from './HideAction';
import ShowAction from './ShowAction';
import RemoveAction from './RemoveAction';
import AddLightAction from './AddLightAction';
import RemoveLightAction from './RemoveLightAction';
import SetLightPropertiesAction from './SetLightPropertiesAction';
import TweenLightColorAction from './TweenLightColorAction';
import SetClearColorAction from './SetClearColorAction';
import SwitchCameraAction from './SwitchCameraAction';
import InFrustumAction from './InFrustumAction';
import DollyZoomAction from './DollyZoomAction';
import InBoxAction from './InBoxAction';
import CompareDistanceAction from './CompareDistanceAction';
import CollidesAction from './CollidesAction';
import TagAction from './TagAction';
import SmokeAction from './SmokeAction';
import FireAction from './FireAction';
import RemoveParticlesAction from './RemoveParticlesAction';
import TogglePostFxAction from './TogglePostFxAction';
import ToggleFullscreenAction from './ToggleFullscreenAction';
import PlaySoundAction from './PlaySoundAction';
import PauseSoundAction from './PauseSoundAction';
import StopSoundAction from './StopSoundAction';
import SoundFadeInAction from './SoundFadeInAction';
import SoundFadeOutAction from './SoundFadeOutAction';
import SetRenderTargetAction from './SetRenderTargetAction';
import TweenTextureOffsetAction from './TweenTextureOffsetAction';
import SetMaterialColorAction from './SetMaterialColorAction';
import LogMessageAction from './LogMessageAction';
import TweenOpacityAction from './TweenOpacityAction';
import HtmlAction from './HtmlAction';
import CopyJointTransformAction from './CopyJointTransformAction';
import TriggerEnterAction from './TriggerEnterAction';
import TriggerLeaveAction from './TriggerLeaveAction';
import ApplyImpulseAction from './ApplyImpulseAction';
import ApplyForceAction from './ApplyForceAction';
import ApplyTorqueAction from './ApplyTorqueAction';
import SetRigidBodyPositionAction from './SetRigidBodyPositionAction';
import SetRigidBodyVelocityAction from './SetRigidBodyVelocityAction';
import SetRigidBodyAngularVelocityAction from './SetRigidBodyAngularVelocityAction';
import CompareCounterAction from './CompareCounterAction';
import CompareCountersAction from './CompareCountersAction';
import SetCounterAction from './SetCounterAction';
import IncrementCounterAction from './IncrementCounterAction';
import MuteAction from './MuteAction';
import UnmuteAction from './UnmuteAction';
import ToggleMuteAction from './ToggleMuteAction';
import StartTimelineAction from './StartTimelineAction';
import PauseTimelineAction from './PauseTimelineAction';
import StopTimelineAction from './StopTimelineAction';
import SetTimelineTimeAction from './SetTimelineTimeAction';
import SetHtmlTextAction from './SetHtmlTextAction';

	var _actions = {};

	var Actions = function(){};

	var IGNORED_ACTIONS = [
		'Eval',
		'HTMLPick',
		'Remove',
		'Collides',
		'Tag'
	];

	Actions.register = function (name, actionClass) {
		_actions[name] = actionClass;
	};

	Actions.actionForType = function (name) {
		return _actions[name];
	};

	Actions.allActions = function () {
		var actions = {};
		var keys = Object.keys(_actions);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			if (IGNORED_ACTIONS.indexOf(key) === -1) {
				actions[key] = _actions[key];
			}
		}
		return actions;
	};

	Actions.allActionsArray = function () {
		var array = [];
		var actions = Actions.allActions();
		var keys = Object.keys(actions);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			array.push(actions[key]);
		}
		return array;
	};

	var allActions = {
		ArrowsAction: ArrowsAction,
		MouseUpAction: MouseUpAction,
		MouseDownAction: MouseDownAction,
		MouseMoveAction: MouseMoveAction,
		MousePressedAction: MousePressedAction,
		KeyUpAction: KeyUpAction,
		KeyDownAction: KeyDownAction,
		KeyPressedAction: KeyPressedAction,
		PickAction: PickAction,
		PickAndExitAction: PickAndExitAction,
		ClickAction: ClickAction,
		HoverEnterAction: HoverEnterAction,
		HoverExitAction: HoverExitAction,
		WasdAction: WasdAction,
		MoveAction: MoveAction,
		RotateAction: RotateAction,
		ScaleAction: ScaleAction,
		LookAtAction: LookAtAction,
		TweenMoveAction: TweenMoveAction,
		TweenRotationAction: TweenRotationAction,
		TweenScaleAction: TweenScaleAction,
		TweenLookAtAction: TweenLookAtAction,
		ShakeAction: ShakeAction,
		PauseAnimationAction: PauseAnimationAction,
		ResumeAnimationAction: ResumeAnimationAction,
		SetAnimationAction: SetAnimationAction,
		SetTimeScale: SetTimeScale,
		WaitAction: WaitAction,
		TransitionAction: TransitionAction,
		NextFrameAction: NextFrameAction,
		RandomTransitionAction: RandomTransitionAction,
		EmitAction: EmitAction,
		TransitionOnMessageAction: TransitionOnMessageAction,
		EvalAction: EvalAction,
		HideAction: HideAction,
		ShowAction: ShowAction,
		RemoveAction: RemoveAction,
		AddLightAction: AddLightAction,
		RemoveLightAction: RemoveLightAction,
		SetLightPropertiesAction: SetLightPropertiesAction,
		TweenLightColorAction: TweenLightColorAction,
		SetClearColorAction: SetClearColorAction,
		SwitchCameraAction: SwitchCameraAction,
		InFrustumAction: InFrustumAction,
		DollyZoomAction: DollyZoomAction,
		InBoxAction: InBoxAction,
		CompareDistanceAction: CompareDistanceAction,
		CollidesAction: CollidesAction,
		TagAction: TagAction,
		SmokeAction: SmokeAction,
		FireAction: FireAction,
		RemoveParticlesAction: RemoveParticlesAction,
		TogglePostFxAction: TogglePostFxAction,
		ToggleFullscreenAction: ToggleFullscreenAction,
		PlaySoundAction: PlaySoundAction,
		PauseSoundAction: PauseSoundAction,
		StopSoundAction: StopSoundAction,
		SoundFadeInAction: SoundFadeInAction,
		SoundFadeOutAction: SoundFadeOutAction,
		SetRenderTargetAction: SetRenderTargetAction,
		TweenTextureOffsetAction: TweenTextureOffsetAction,
		SetMaterialColorAction: SetMaterialColorAction,
		LogMessageAction: LogMessageAction,
		TweenOpacityAction: TweenOpacityAction,
		HtmlAction: HtmlAction,
		CopyJointTransformAction: CopyJointTransformAction,
		TriggerEnterAction: TriggerEnterAction,
		TriggerLeaveAction: TriggerLeaveAction,
		ApplyImpulseAction: ApplyImpulseAction,
		ApplyForceAction: ApplyForceAction,
		ApplyTorqueAction: ApplyTorqueAction,
		SetRigidBodyPositionAction: SetRigidBodyPositionAction,
		SetRigidBodyVelocityAction: SetRigidBodyVelocityAction,
		SetRigidBodyAngularVelocityAction: SetRigidBodyAngularVelocityAction,
		CompareCounterAction: CompareCounterAction,
		CompareCountersAction: CompareCountersAction,
		SetCounterAction: SetCounterAction,
		IncrementCounterAction: IncrementCounterAction,
		MuteAction: MuteAction,
		UnmuteAction: UnmuteAction,
		ToggleMuteAction: ToggleMuteAction,
		StartTimelineAction: StartTimelineAction,
		PauseTimelineAction: PauseTimelineAction,
		StopTimelineAction: StopTimelineAction,
		SetTimelineTimeAction: SetTimelineTimeAction,
		SetHtmlTextAction: SetHtmlTextAction,
	};

	for(var actionName in allActions){
		var action = allActions[actionName];
		Actions.register(action.external.key, action);
	}

export default Actions;
