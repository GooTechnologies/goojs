define([
	'goo/entities/components/Component'],
/** @lends */
function(
	Component
	) {
	'use strict';

	function ProximityComponent(tag) {
		this.type = 'ProximityComponent';

		Object.defineProperty(this, 'tag', {
			value: tag || 'red',
			writable: false
		});
	}

	ProximityComponent.prototype = Object.create(Component.prototype);

	return ProximityComponent;
});