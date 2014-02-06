require([
	"goo/fsmpack/FSMComponentHandler",
	"goo/fsmpack/MachineHandler",
	"goo/fsmpack/statemachine/FSMComponent",
	"goo/fsmpack/statemachine/FSMSystem",
	"goo/fsmpack/statemachine/FSMUtil",
	"goo/fsmpack/statemachine/Machine",
	"goo/fsmpack/statemachine/State",
	"goo/fsmpack/statemachine/actions/Action",
	"goo/fsmpack/statemachine/actions/Actions",
	"goo/fsmpack/statemachine/actions/AddLightAction",
	"goo/fsmpack/statemachine/actions/AddPositionAction",
	"goo/fsmpack/statemachine/actions/AddVariableAction",
	"goo/fsmpack/statemachine/actions/ArrowsAction",
	"goo/fsmpack/statemachine/actions/CollidesAction",
	"goo/fsmpack/statemachine/actions/CompareDistanceAction",
	"goo/fsmpack/statemachine/actions/DollyZoomAction",
	"goo/fsmpack/statemachine/actions/EmitAction",
	"goo/fsmpack/statemachine/actions/EvalAction",
	"goo/fsmpack/statemachine/actions/FireAction",
	"goo/fsmpack/statemachine/actions/GetPositionAction",
	"goo/fsmpack/statemachine/actions/GuiButtonAction",
	"goo/fsmpack/statemachine/actions/HideAction",
	"goo/fsmpack/statemachine/actions/InBoxAction",
	"goo/fsmpack/statemachine/actions/InFrustumAction",
	"goo/fsmpack/statemachine/actions/KeyDownAction",
	"goo/fsmpack/statemachine/actions/KeyPressedAction",
	"goo/fsmpack/statemachine/actions/KeyUpAction",
	"goo/fsmpack/statemachine/actions/LogMessageAction",
	"goo/fsmpack/statemachine/actions/LookAtAction",
	"goo/fsmpack/statemachine/actions/MouseDownAction",
	"goo/fsmpack/statemachine/actions/MouseMoveAction",
	"goo/fsmpack/statemachine/actions/MouseUpAction",
	"goo/fsmpack/statemachine/actions/MoveAction",
	"goo/fsmpack/statemachine/actions/MultiplyVariableAction",
	"goo/fsmpack/statemachine/actions/NumberCompareAction",
	"goo/fsmpack/statemachine/actions/PauseAnimationAction",
	"goo/fsmpack/statemachine/actions/PickAction",
	"goo/fsmpack/statemachine/actions/RandomTransitionAction",
	"goo/fsmpack/statemachine/actions/RemoveAction",
	"goo/fsmpack/statemachine/actions/RemoveLightAction",
	"goo/fsmpack/statemachine/actions/RemoveParticlesAction",
	"goo/fsmpack/statemachine/actions/ResumeAnimationAction",
	"goo/fsmpack/statemachine/actions/ResumeFSMAction",
	"goo/fsmpack/statemachine/actions/RotateAction",
	"goo/fsmpack/statemachine/actions/ScaleAction",
	"goo/fsmpack/statemachine/actions/SetAnimationAction",
	"goo/fsmpack/statemachine/actions/SetClearColorAction",
	"goo/fsmpack/statemachine/actions/SetCssPropertyAction",
	"goo/fsmpack/statemachine/actions/SetLightRangeAction",
	"goo/fsmpack/statemachine/actions/SetPositionAction",
	"goo/fsmpack/statemachine/actions/SetRenderTargetAction",
	"goo/fsmpack/statemachine/actions/SetRotationAction",
	"goo/fsmpack/statemachine/actions/SetVariableAction",
	"goo/fsmpack/statemachine/actions/ShakeAction",
	"goo/fsmpack/statemachine/actions/ShowAction",
	"goo/fsmpack/statemachine/actions/SmokeAction",
	"goo/fsmpack/statemachine/actions/SnowAction",
	"goo/fsmpack/statemachine/actions/SoundFadeInAction",
	"goo/fsmpack/statemachine/actions/SoundFadeOutAction",
	"goo/fsmpack/statemachine/actions/SuspendFSMAction",
	"goo/fsmpack/statemachine/actions/SwitchCameraAction",
	"goo/fsmpack/statemachine/actions/TagAction",
	"goo/fsmpack/statemachine/actions/TestAngleAction",
	"goo/fsmpack/statemachine/actions/TestSpeedAction",
	"goo/fsmpack/statemachine/actions/TransitionAction",
	"goo/fsmpack/statemachine/actions/TransitionOnMessageAction",
	"goo/fsmpack/statemachine/actions/TweenAction",
	"goo/fsmpack/statemachine/actions/TweenLightColorAction",
	"goo/fsmpack/statemachine/actions/TweenLookAtAction",
	"goo/fsmpack/statemachine/actions/TweenMoveAction",
	"goo/fsmpack/statemachine/actions/TweenRotationAction",
	"goo/fsmpack/statemachine/actions/TweenScaleAction",
	"goo/fsmpack/statemachine/actions/TweenTextureOffsetAction",
	"goo/fsmpack/statemachine/actions/WASDAction",
	"goo/fsmpack/statemachine/actions/WaitAction",
], function (
	FSMComponentHandler,
	MachineHandler,
	FSMComponent,
	FSMSystem,
	FSMUtil,
	Machine,
	State,
	Action,
	Actions,
	AddLightAction,
	AddPositionAction,
	AddVariableAction,
	ArrowsAction,
	CollidesAction,
	CompareDistanceAction,
	DollyZoomAction,
	EmitAction,
	EvalAction,
	FireAction,
	GetPositionAction,
	GuiButtonAction,
	HideAction,
	InBoxAction,
	InFrustumAction,
	KeyDownAction,
	KeyPressedAction,
	KeyUpAction,
	LogMessageAction,
	LookAtAction,
	MouseDownAction,
	MouseMoveAction,
	MouseUpAction,
	MoveAction,
	MultiplyVariableAction,
	NumberCompareAction,
	PauseAnimationAction,
	PickAction,
	RandomTransitionAction,
	RemoveAction,
	RemoveLightAction,
	RemoveParticlesAction,
	ResumeAnimationAction,
	ResumeFSMAction,
	RotateAction,
	ScaleAction,
	SetAnimationAction,
	SetClearColorAction,
	SetCssPropertyAction,
	SetLightRangeAction,
	SetPositionAction,
	SetRenderTargetAction,
	SetRotationAction,
	SetVariableAction,
	ShakeAction,
	ShowAction,
	SmokeAction,
	SnowAction,
	SoundFadeInAction,
	SoundFadeOutAction,
	SuspendFSMAction,
	SwitchCameraAction,
	TagAction,
	TestAngleAction,
	TestSpeedAction,
	TransitionAction,
	TransitionOnMessageAction,
	TweenAction,
	TweenLightColorAction,
	TweenLookAtAction,
	TweenMoveAction,
	TweenRotationAction,
	TweenScaleAction,
	TweenTextureOffsetAction,
	WASDAction,
	WaitAction
) {
	goo.FSMComponentHandler = FSMComponentHandler;
	goo.MachineHandler = MachineHandler;
	goo.FSMComponent = FSMComponent;
	goo.FSMSystem = FSMSystem;
	goo.FSMUtil = FSMUtil;
	goo.Machine = Machine;
	goo.State = State;
	goo.Action = Action;
	goo.Actions = Actions;
	goo.AddLightAction = AddLightAction;
	goo.AddPositionAction = AddPositionAction;
	goo.AddVariableAction = AddVariableAction;
	goo.ArrowsAction = ArrowsAction;
	goo.CollidesAction = CollidesAction;
	goo.CompareDistanceAction = CompareDistanceAction;
	goo.DollyZoomAction = DollyZoomAction;
	goo.EmitAction = EmitAction;
	goo.EvalAction = EvalAction;
	goo.FireAction = FireAction;
	goo.GetPositionAction = GetPositionAction;
	goo.GuiButtonAction = GuiButtonAction;
	goo.HideAction = HideAction;
	goo.InBoxAction = InBoxAction;
	goo.InFrustumAction = InFrustumAction;
	goo.KeyDownAction = KeyDownAction;
	goo.KeyPressedAction = KeyPressedAction;
	goo.KeyUpAction = KeyUpAction;
	goo.LogMessageAction = LogMessageAction;
	goo.LookAtAction = LookAtAction;
	goo.MouseDownAction = MouseDownAction;
	goo.MouseMoveAction = MouseMoveAction;
	goo.MouseUpAction = MouseUpAction;
	goo.MoveAction = MoveAction;
	goo.MultiplyVariableAction = MultiplyVariableAction;
	goo.NumberCompareAction = NumberCompareAction;
	goo.PauseAnimationAction = PauseAnimationAction;
	goo.PickAction = PickAction;
	goo.RandomTransitionAction = RandomTransitionAction;
	goo.RemoveAction = RemoveAction;
	goo.RemoveLightAction = RemoveLightAction;
	goo.RemoveParticlesAction = RemoveParticlesAction;
	goo.ResumeAnimationAction = ResumeAnimationAction;
	goo.ResumeFSMAction = ResumeFSMAction;
	goo.RotateAction = RotateAction;
	goo.ScaleAction = ScaleAction;
	goo.SetAnimationAction = SetAnimationAction;
	goo.SetClearColorAction = SetClearColorAction;
	goo.SetCssPropertyAction = SetCssPropertyAction;
	goo.SetLightRangeAction = SetLightRangeAction;
	goo.SetPositionAction = SetPositionAction;
	goo.SetRenderTargetAction = SetRenderTargetAction;
	goo.SetRotationAction = SetRotationAction;
	goo.SetVariableAction = SetVariableAction;
	goo.ShakeAction = ShakeAction;
	goo.ShowAction = ShowAction;
	goo.SmokeAction = SmokeAction;
	goo.SnowAction = SnowAction;
	goo.SoundFadeInAction = SoundFadeInAction;
	goo.SoundFadeOutAction = SoundFadeOutAction;
	goo.SuspendFSMAction = SuspendFSMAction;
	goo.SwitchCameraAction = SwitchCameraAction;
	goo.TagAction = TagAction;
	goo.TestAngleAction = TestAngleAction;
	goo.TestSpeedAction = TestSpeedAction;
	goo.TransitionAction = TransitionAction;
	goo.TransitionOnMessageAction = TransitionOnMessageAction;
	goo.TweenAction = TweenAction;
	goo.TweenLightColorAction = TweenLightColorAction;
	goo.TweenLookAtAction = TweenLookAtAction;
	goo.TweenMoveAction = TweenMoveAction;
	goo.TweenRotationAction = TweenRotationAction;
	goo.TweenScaleAction = TweenScaleAction;
	goo.TweenTextureOffsetAction = TweenTextureOffsetAction;
	goo.WASDAction = WASDAction;
	goo.WaitAction = WaitAction;
});