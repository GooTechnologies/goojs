define(['goo/fsmpack/statemachine/actions/Action'], function (Action) {
	'use strict';

	function TestAngleAction(settings) {
		settings = settings || {};
		this.everyFrame = settings.everyFrame || true;

		this.entity = settings.entity || null;
		this.rangeMin = settings.rangeMin || 0;
		this.rangeMax = settings.rangeMax || Math.PI;
		this.eventInRange = settings.eventInRange || 'inRange';
		this.eventOutRange = settings.eventOutRange || 'outRange';
	}

	TestAngleAction.prototype = Object.create(Action.prototype);

	TestAngleAction.external = [
		{
			name: 'Entity',
			key: 'entity',
			type: 'entity'
		},
		{
			name:'RangeMin',
			key:'rangeMin',
			type:'spinner'
		},
		{
			name:'RangeMax',
			key:'rangeMax',
			type:'spinner'
		},
		{
			name:'Event In Range',
			key:'eventInRange',
			type:'event'
		},
		{
			name:'Event Out Of Range',
			key:'eventOutRange',
			type:'event'
		}
	];

	TestAngleAction.prototype.onUpdate = function(fsm) {
		if (this.entity !== null && this.entity.body) {
			var angle = this.entity.body.GetAngle() % (Math.PI*2);
			if (angle < 0) {
				angle = Math.PI*2 + angle;
			}

			if (angle >= this.rangeMin && angle <= this.rangeMax) {
				fsm.handle(this.eventInRange);
			} else {
				fsm.handle(this.eventOutRange);
			}
		}
	};

	return TestAngleAction;
});