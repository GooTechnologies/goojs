
	var _actions = {};

	var Actions = {};

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
		var actions = [];
		var keys = Object.keys(_actions);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			if (key === 'Eval' || key === 'HTMLPick' || key === 'Remove') {
				continue;
			}
			actions.push(_actions[key]);
		}
		return actions;
	};

	function registerAll(args) {
		var actionsStartIndex = 0;
		for (var i = actionsStartIndex; i < args.length; i++) {
			var arg = args[i];
			Actions.register(arg.external.key, arg);
		}
	}

	registerAll({
		AddLightAction: require('./AddLightAction'),
		AddPositionAction: require('./AddPositionAction'),
		AddVariableAction: require('./AddVariableAction'),
		ApplyForceAction: require('./ApplyForceAction'),
		ApplyImpulseAction: require('./ApplyImpulseAction'),
		ApplyTorqueAction: require('./ApplyTorqueAction'),
		ArrowsAction: require('./ArrowsAction'),
		ClickAction: require('./ClickAction'),
		CollidesAction: require('./CollidesAction'),
		CompareCounterAction: require('./CompareCounterAction'),
		CompareCountersAction: require('./CompareCountersAction'),
		CompareDistanceAction: require('./CompareDistanceAction'),
		CopyJointTransformAction: require('./CopyJointTransformAction'),
		CopyVariableAction: require('./CopyVariableAction'),
		DollyZoomAction: require('./DollyZoomAction'),
		EmitAction: require('./EmitAction'),
		EvalAction: require('./EvalAction'),
		FireAction: require('./FireAction'),
		GetPositionAction: require('./GetPositionAction'),
		HideAction: require('./HideAction'),
		HoverEnterAction: require('./HoverEnterAction'),
		HoverExitAction: require('./HoverExitAction'),
		HtmlAction: require('./HtmlAction'),
		InBoxAction: require('./InBoxAction'),
		InFrustumAction: require('./InFrustumAction'),
		IncrementCounterAction: require('./IncrementCounterAction'),
		KeyDownAction: require('./KeyDownAction'),
		KeyPressedAction: require('./KeyPressedAction'),
		KeyUpAction: require('./KeyUpAction'),
		LogMessageAction: require('./LogMessageAction'),
		LookAtAction: require('./LookAtAction'),
		MouseDownAction: require('./MouseDownAction'),
		MouseMoveAction: require('./MouseMoveAction'),
		MousePressedAction: require('./MousePressedAction'),
		MouseUpAction: require('./MouseUpAction'),
		MoveAction: require('./MoveAction'),
		MultiplyVariableAction: require('./MultiplyVariableAction'),
		MuteAction: require('./MuteAction'),
		NextFrameAction: require('./NextFrameAction'),
		NumberCompareAction: require('./NumberCompareAction'),
		PauseAnimationAction: require('./PauseAnimationAction'),
		PauseSoundAction: require('./PauseSoundAction'),
		PauseTimelineAction: require('./PauseTimelineAction'),
		PickAction: require('./PickAction'),
		PickAndExitAction: require('./PickAndExitAction'),
		PlaySoundAction: require('./PlaySoundAction'),
		RandomTransitionAction: require('./RandomTransitionAction'),
		RemoveAction: require('./RemoveAction'),
		RemoveLightAction: require('./RemoveLightAction'),
		RemoveParticlesAction: require('./RemoveParticlesAction'),
		ResumeAnimationAction: require('./ResumeAnimationAction'),
		RotateAction: require('./RotateAction'),
		ScaleAction: require('./ScaleAction'),
		ScriptAction: require('./ScriptAction'),
		SetAnimationAction: require('./SetAnimationAction'),
		SetClearColorAction: require('./SetClearColorAction'),
		SetCounterAction: require('./SetCounterAction'),
		SetHtmlTextAction: require('./SetHtmlTextAction'),
		SetLightPropertiesAction: require('./SetLightPropertiesAction'),
		SetLightRangeAction: require('./SetLightRangeAction'),
		SetMaterialColorAction: require('./SetMaterialColorAction'),
		SetPositionAction: require('./SetPositionAction'),
		SetRenderTargetAction: require('./SetRenderTargetAction'),
		SetRigidBodyAngularVelocityAction: require('./SetRigidBodyAngularVelocityAction'),
		SetRigidBodyPositionAction: require('./SetRigidBodyPositionAction'),
		SetRigidBodyVelocityAction: require('./SetRigidBodyVelocityAction'),
		SetRotationAction: require('./SetRotationAction'),
		SetTimelineTimeAction: require('./SetTimelineTimeAction'),
		SetVariableAction: require('./SetVariableAction'),
		ShakeAction: require('./ShakeAction'),
		ShowAction: require('./ShowAction'),
		SmokeAction: require('./SmokeAction'),
		SoundFadeInAction: require('./SoundFadeInAction'),
		SoundFadeOutAction: require('./SoundFadeOutAction'),
		StartTimelineAction: require('./StartTimelineAction'),
		StopSoundAction: require('./StopSoundAction'),
		StopTimelineAction: require('./StopTimelineAction'),
		SwitchCameraAction: require('./SwitchCameraAction'),
		TagAction: require('./TagAction'),
		ToggleFullscreenAction: require('./ToggleFullscreenAction'),
		ToggleMuteAction: require('./ToggleMuteAction'),
		TogglePostFxAction: require('./TogglePostFxAction'),
		TransitionAction: require('./TransitionAction'),
		TransitionOnMessageAction: require('./TransitionOnMessageAction'),
		TriggerEnterAction: require('./TriggerEnterAction'),
		TriggerLeaveAction: require('./TriggerLeaveAction'),
		TweenLightColorAction: require('./TweenLightColorAction'),
		TweenLookAtAction: require('./TweenLookAtAction'),
		TweenMoveAction: require('./TweenMoveAction'),
		TweenOpacityAction: require('./TweenOpacityAction'),
		TweenRotationAction: require('./TweenRotationAction'),
		TweenScaleAction: require('./TweenScaleAction'),
		TweenTextureOffsetAction: require('./TweenTextureOffsetAction'),
		UnmuteAction: require('./UnmuteAction'),
		WaitAction: require('./WaitAction'),
		WasdAction: require('./WasdAction')
	});

module.exports = Actions;
