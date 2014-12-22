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

	function DisplaceModifier() {
		this.name = 'DisplaceModifier';
		this.type = 'Vertex';

		this.scale = new Vector3(1, 1, 1);
		// texture
		// mesh
	}

	DisplaceModifier.prototype.gui = [
		{
			key: 'scale',
			name: 'Scale',
			type: 'vec3'
		}
	];

	DisplaceModifier.prototype.updateVertex = function(data) {
		data.position.mulVector(this.scale);
		data.normal.mulDirect(1/this.scale.x, 1/this.scale.y, 1/this.scale.z);
	};

	return DisplaceModifier;
});