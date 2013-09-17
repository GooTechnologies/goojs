define([],
/** @lends */
function() {
	"use strict";

	/**
	 * @class
	 * @property {ArrayBuffer} data Data to wrap
	 */
	function TestSpeedAction(settings) {
		this.type = 'TestSpeedAction';

		settings = settings || {};

		this.entity = settings.entity || null;
		this.rangeMin = settings.rangeMin || 0;
		this.rangeMax = settings.rangeMax || Math.PI;
		this.eventInRange = settings.eventInRange || 'inRange';
		this.eventOutRange = settings.eventOutRange || 'outRange';

		this.external = [
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
	}

	TestSpeedAction.prototype = {
		onUpdate: function(fsm) {
			if (this.entity !== null && this.entity.body) {
				var speed = this.entity.body.GetLinearVelocity().Length();
				// var speed = this.entity.body.GetVelocity();

				// console.log(speed);

				if (speed >= this.rangeMin && speed <= this.rangeMax) {
					fsm.handle(this.eventInRange);
				} else {
					fsm.handle(this.eventOutRange);
				}
			}
		}
	};

	return TestSpeedAction;
});