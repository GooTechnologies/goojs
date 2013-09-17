define([],
/** @lends */
function() {
	"use strict";

	/**
	 * @class
	 * @property {ArrayBuffer} data Data to wrap
	 */
	function TestAngleAction(settings) {
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

	TestAngleAction.prototype = {
		onUpdate: function(fsm) {
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
		}
	};

	return TestAngleAction;
});