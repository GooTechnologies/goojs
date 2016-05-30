var s4 = function () {
	return Math.floor((1 + Math.random()) * 0x10000)
		.toString(16)
		.substring(1);
};

function buildKeyInverse(assoc) {
	var inverseAssoc = [];

	var keys = Object.keys(assoc);
	for (var i = 0; i < keys.length; i++) {
		inverseAssoc[assoc[keys[i]]] = keys[i];
	}
	return inverseAssoc;
}

class FsmUtils {

	static setParameters(settings, externalParameters) {
		for (var i = 0; i < externalParameters.length; i++) {
			var externalParameter = externalParameters[i];
			var key = externalParameter.key;

			if (typeof settings[key] !== 'undefined') {
				this[key] = settings[key];
			} else {
				this[key] = externalParameter['default'];
			}
		}
	};

	static setTransitions(settings, externalTransitions) {
		for (var i = 0; i < externalTransitions.length; i++) {
			var externalTransition = externalTransitions[i];
			var key = externalTransition.key;

			(<any>this).transitions = (<any>this).transitions || {};
			(<any>this).transitions[key] = settings.transitions[key];
		}
	};

	static getKey(str) {
		if (FsmUtils.keys[str]) {
			return FsmUtils.keys[str];
		} else {
			return str.charCodeAt(0);
		}
	};

	static keys = {
		'Backspace': 8,
		'Tab': 9,
		'Enter': 13,
		'Shift': 16,
		'Ctrl': 17,
		'Alt': 18,
		'Pause': 19,
		'Capslock': 20,
		'Esc': 27,
		'Space':32,
		'Pageup': 33,
		'Pagedown': 34,
		'End': 35,
		'Home': 36,
		'Leftarrow': 37,
		'Uparrow': 38,
		'Rightarrow': 39,
		'Downarrow': 40,
		'Insert': 45,
		'Delete': 46,
		'0': 48,
		'1': 49,
		'2': 50,
		'3': 51,
		'4': 52,
		'5': 53,
		'6': 54,
		'7': 55,
		'8': 56,
		'9': 57,
		'a': 65,
		'b': 66,
		'c': 67,
		'd': 68,
		'e': 69,
		'f': 70,
		'g': 71,
		'h': 72,
		'i': 73,
		'j': 74,
		'k': 75,
		'l': 76,
		'm': 77,
		'n': 78,
		'o': 79,
		'p': 80,
		'q': 81,
		'r': 82,
		's': 83,
		't': 84,
		'u': 85,
		'v': 86,
		'w': 87,
		'x': 88,
		'y': 89,
		'z': 90,
		'A': 65,
		'B': 66,
		'C': 67,
		'D': 68,
		'E': 69,
		'F': 70,
		'G': 71,
		'H': 72,
		'I': 73,
		'J': 74,
		'K': 75,
		'L': 76,
		'M': 77,
		'N': 78,
		'O': 79,
		'P': 80,
		'Q': 81,
		'R': 82,
		'S': 83,
		'T': 84,
		'U': 85,
		'V': 86,
		'W': 87,
		'X': 88,
		'Y': 89,
		'Z': 90,
		'0numpad': 96,
		'1numpad': 97,
		'2numpad': 98,
		'3numpad': 99,
		'4numpad': 100,
		'5numpad': 101,
		'6numpad': 102,
		'7numpad': 103,
		'8numpad': 104,
		'9numpad': 105,
		'Multiply': 106,
		'Plus': 107,
		'Minus': 109,
		'Dot': 110,
		'Slash1': 111,
		'F1': 112,
		'F2': 113,
		'F3': 114,
		'F4': 115,
		'F5': 116,
		'F6': 117,
		'F7': 118,
		'F8': 119,
		'F9': 120,
		'F10': 121,
		'F11': 122,
		'F12': 123,
		'Equals': 187,
		'Comma': 188,
		'Slash': 191,
		'Backslash': 220
	};

	static keyInverse = buildKeyInverse(FsmUtils.keys);

	static keyForCode = function (code) {
		if (FsmUtils.keyInverse[code]) {
			return FsmUtils.keyInverse[code];
		}
		return 'FsmUtils.keyForCode: key not found for code ' + code;
	};

	// Random unique id
	static guid = function () {
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
			s4() + '-' + s4() + s4() + s4();
	};

	static getValue = function (par, fsm) {
		if (typeof par === 'number') {
			return par;
		} else {
			return fsm.getVariable(par);
		}
	};
}

export = FsmUtils;