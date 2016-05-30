/**
 * Rc4 random generator with seeding
 */
class Rc4Random {
	getRandomNumber: any;
	init: any;
	constructor(seed: number) {
		var keySchedule = [];
		var keySchedule_i = 0;
		var keySchedule_j = 0;

		this.init = function (seed) {
			for (var i = 0; i < 256; i++) {
				keySchedule[i] = i;
			}

			var j = 0;
			for (var i = 0; i < 256; i++) {
				j = (j + keySchedule[i] + seed.charCodeAt(i % seed.length)) % 256;

				var t = keySchedule[i];
				keySchedule[i] = keySchedule[j];
				keySchedule[j] = t;
			}
		};
		this.init(seed);

		function getRandomByte() {
			keySchedule_i = (keySchedule_i + 1) % 256;
			keySchedule_j = (keySchedule_j + keySchedule[keySchedule_i]) % 256;

			var t = keySchedule[keySchedule_i];
			keySchedule[keySchedule_i] = keySchedule[keySchedule_j];
			keySchedule[keySchedule_j] = t;

			return keySchedule[(keySchedule[keySchedule_i] + keySchedule[keySchedule_j]) % 256];
		}

		this.getRandomNumber = function () {
			var number = 0;
			var multiplier = 1;
			for (var i = 0; i < 8; i++) {
				number += getRandomByte() * multiplier;
				multiplier *= 256;
			}
			return number / 18446744073709551616;
		};
	}
}

export = Rc4Random;