define([
	'goo/math/Matrix3x3',
	'goo/math/Vector3'
],
/** @lends */
function (
	Matrix3x3,
	Vector3
) {
	'use strict';

	function OffsetModifier() {
		this.name = 'OffsetModifier';

		this.offset = new Vector3(0, 0, 0);
	}

	OffsetModifier.prototype.gui = [
		{
			key: 'offset',
			name: 'Offset',
			type: 'vec3'
		}
	];

	OffsetModifier.prototype.updateVertex = function(data) {
		data.position.addVector(this.offset);
	};

	return OffsetModifier;
});