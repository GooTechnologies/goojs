define([
	'goo/math/Matrix3x3',
	'goo/math/MathUtils',
	'goo/util/Rc4Random',
	'goo/math/Vector3'
],
/** @lends */
function (
	Matrix3x3,
	MathUtils,
	Rc4Random,
	Vector3
) {
	'use strict';

	function PlaceModifier() {
		this.name = 'PlaceModifier';
		this.type = 'Object';

		this.vec = new Vector3(0, 0, 0);
		this.modifierType = 'None';
		this.size = 3;
		this.seededRandom = new Rc4Random('1337');
	}

	PlaceModifier.prototype.gui = [
		{
			key: 'modifierType',
			name: 'Type',
			type: 'dropdown',
			choices: ['None', 'Sphere', 'RandomSphere', 'Quad', 'RandomQuad', 'RandomCube']
		},
		{
			key: 'size',
			name: 'Size',
			type: 'float'
		}
	];

	PlaceModifier.prototype.setup = function () {
		this.seededRandom.init('1337');
	};

	PlaceModifier.prototype.updateObject = function(target, allTargets, normalizedVert, i) {
		var position = target.transform.translation;

		if (this.modifierType === 'Sphere') {
			var l = Math.floor(Math.sqrt(allTargets.size));
			var x = Math.PI * 2 * (i % l) / l;
			var y = Math.PI * 1 * (Math.floor(i / l)) / l;

			var rad = Math.sin(y) * this.size;

			position.x = Math.sin(x) * rad * 10;
			position.y = Math.cos(y) * this.size * 10;
			position.z = Math.cos(x) * rad * 10;
		} else if (this.modifierType === 'RandomSphere') {
			var x = this.seededRandom.getRandomNumber() * 2 - 1;
			var y = this.seededRandom.getRandomNumber() * 2 - 1;
			var z = this.seededRandom.getRandomNumber() * 2 - 1;
			this.vec.setDirect(x, y, z).normalize().scale(this.size * 10);
			position.setVector(this.vec);
		} else if (this.modifierType === 'Quad') {
			var l = Math.floor(Math.sqrt(allTargets.size));
			var x = i % l;
			var z = Math.floor(i / l);
			position.x = x * this.size - this.size * l / 2;
			position.z = z * this.size - this.size * l / 2;
			// position.setDirect(x, 0, z);
		} else if (this.modifierType === 'RandomQuad') {
			var x = this.seededRandom.getRandomNumber() * 2 - 1;
			var z = this.seededRandom.getRandomNumber() * 2 - 1;
			this.vec.setDirect(x, 0, z).scale(this.size * 10);
			position.setVector(this.vec);
		} else if (this.modifierType === 'RandomCube') {
			var x = this.seededRandom.getRandomNumber() * 2 - 1;
			var y = this.seededRandom.getRandomNumber() * 2 - 1;
			var z = this.seededRandom.getRandomNumber() * 2 - 1;
			this.vec.setDirect(x, y, z).scale(this.size * 10);
			position.setVector(this.vec);
		}
	};

	return PlaceModifier;
});