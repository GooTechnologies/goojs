define(['goo/fsmpack/statemachine/actions/Action'],
/** @lends */
function(Action) {
	'use strict';

	function TestSpeedAction(settings) {
		this.type = 'TestSpeedAction';
		this.everyFrame = settings.everyFrame || true;

		settings = settings || {};

		this.entity = settings.entity || null;
		this.rangeMin = settings.rangeMin || 0;
		this.rangeMax = settings.rangeMax || Math.PI;
		this.eventInRange = settings.eventInRange || 'inRange';
		this.eventOutRange = settings.eventOutRange || 'outRange';
	}

	TestSpeedAction.prototype = Object.create(Action.prototype);

	TestSpeedAction.external = [{
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
		}];

	TestSpeedAction.prototype.onUpdate = function(fsm) {
		if (this.entity !== null && this.entity.body) {
			var speed = this.entity.body.GetLinearVelocity().Length();
			// var speed = this.entity.body.GetVelocity();

			if (speed >= this.rangeMin && speed <= this.rangeMax) {
				fsm.handle(this.eventInRange);
			} else {
				fsm.handle(this.eventOutRange);
			}
		}
	};

	return TestSpeedAction;
});