var _actions = {};

var Actions = function () {};

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
	ArrowsAction: require('./ArrowsAction'),
	DomEventAction: require('./DomEventAction'),
	MouseUpAction: require('./MouseUpAction'),
	MouseDownAction: require('./MouseDownAction'),
	MouseMoveAction: require('./MouseMoveAction'),
	MousePressedAction: require('./MousePressedAction'),
	KeyUpAction: require('./KeyUpAction'),
	KeyDownAction: require('./KeyDownAction'),
	KeyPressedAction: require('./KeyPressedAction'),
	PickAction: require('./PickAction'),
	PickAndExitAction: require('./PickAndExitAction'),
	ClickAction: require('./ClickAction'),
	HoverEnterAction: require('./HoverEnterAction'),
	HoverExitAction: require('./HoverExitAction'),
	WasdAction: require('./WasdAction'),
	MoveAction: require('./MoveAction'),
	RotateAction: require('./RotateAction'),
	ScaleAction: require('./ScaleAction'),
	LookAtAction: require('./LookAtAction'),
	TweenMoveAction: require('./TweenMoveAction'),
	TweenRotationAction: require('./TweenRotationAction'),
	TweenScaleAction: require('./TweenScaleAction'),
	TweenLookAtAction: require('./TweenLookAtAction'),
	ShakeAction: require('./ShakeAction'),
	PauseAnimationAction: require('./PauseAnimationAction'),
	ResumeAnimationAction: require('./ResumeAnimationAction'),
	SetAnimationAction: require('./SetAnimationAction'),
	SetTimeScale: require('./SetTimeScale'),
	WaitAction: require('./WaitAction'),
	TransitionAction: require('./TransitionAction'),
	NextFrameAction: require('./NextFrameAction'),
	RandomTransitionAction: require('./RandomTransitionAction'),
	EmitAction: require('./EmitAction'),
	TransitionOnMessageAction: require('./TransitionOnMessageAction'),
	EvalAction: require('./EvalAction'),
	HideAction: require('./HideAction'),
	ShowAction: require('./ShowAction'),
	RemoveAction: require('./RemoveAction'),
	AddLightAction: require('./AddLightAction'),
	RemoveLightAction: require('./RemoveLightAction'),
	SetLightPropertiesAction: require('./SetLightPropertiesAction'),
	TweenLightColorAction: require('./TweenLightColorAction'),
	SetClearColorAction: require('./SetClearColorAction'),
	SwitchCameraAction: require('./SwitchCameraAction'),
	InFrustumAction: require('./InFrustumAction'),
	DollyZoomAction: require('./DollyZoomAction'),
	InBoxAction: require('./InBoxAction'),
	CompareDistanceAction: require('./CompareDistanceAction'),
	CollidesAction: require('./CollidesAction'),
	TagAction: require('./TagAction'),
	SmokeAction: require('./SmokeAction'),
	FireAction: require('./FireAction'),
	RemoveParticlesAction: require('./RemoveParticlesAction'),
	TogglePostFxAction: require('./TogglePostFxAction'),
	ToggleFullscreenAction: require('./ToggleFullscreenAction'),
	PlaySoundAction: require('./PlaySoundAction'),
	PauseSoundAction: require('./PauseSoundAction'),
	StopSoundAction: require('./StopSoundAction'),
	SoundFadeInAction: require('./SoundFadeInAction'),
	SoundFadeOutAction: require('./SoundFadeOutAction'),
	SetRenderTargetAction: require('./SetRenderTargetAction'),
	TweenTextureOffsetAction: require('./TweenTextureOffsetAction'),
	SetMaterialColorAction: require('./SetMaterialColorAction'),
	LogMessageAction: require('./LogMessageAction'),
	TweenOpacityAction: require('./TweenOpacityAction'),
	HtmlAction: require('./HtmlAction'),
	CopyJointTransformAction: require('./CopyJointTransformAction'),
	TriggerEnterAction: require('./TriggerEnterAction'),
	TriggerLeaveAction: require('./TriggerLeaveAction'),
	ApplyImpulseAction: require('./ApplyImpulseAction'),
	ApplyForceAction: require('./ApplyForceAction'),
	ApplyTorqueAction: require('./ApplyTorqueAction'),
	SetRigidBodyPositionAction: require('./SetRigidBodyPositionAction'),
	SetRigidBodyVelocityAction: require('./SetRigidBodyVelocityAction'),
	SetRigidBodyAngularVelocityAction: require('./SetRigidBodyAngularVelocityAction'),
	CompareCounterAction: require('./CompareCounterAction'),
	CompareCountersAction: require('./CompareCountersAction'),
	SetCounterAction: require('./SetCounterAction'),
	IncrementCounterAction: require('./IncrementCounterAction'),
	MuteAction: require('./MuteAction'),
	UnmuteAction: require('./UnmuteAction'),
	ToggleMuteAction: require('./ToggleMuteAction'),
	StartTimelineAction: require('./StartTimelineAction'),
	PauseTimelineAction: require('./PauseTimelineAction'),
	StopTimelineAction: require('./StopTimelineAction'),
	SetTimelineTimeAction: require('./SetTimelineTimeAction'),
	SetHtmlTextAction: require('./SetHtmlTextAction'),
	SpriteAnimationAction: require('./SpriteAnimationAction'),
	PauseParticleSystemAction: require('./PauseParticleSystemAction'),
	StopParticleSystemAction: require('./StopParticleSystemAction'),
	StartParticleSystemAction: require('./StartParticleSystemAction')
};

for(var actionName in allActions){
	var action = allActions[actionName];
	Actions.register(action.external.key, action);
}

module.exports = Actions;