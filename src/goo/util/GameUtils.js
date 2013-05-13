define(
/** @lends */
function () {
	"use strict";

	/**
	 * @class Shims for standard gaming features
	 * @description Only used to define the class. Should never be instantiated.
	 */
	function GameUtils () {
	}

	/** Supported features. All true by default.
	 * @type {Object}
	 * @property {boolean} fullscreen
	 * @property {boolean} pointerLock
	 */
	GameUtils.supported = {
		fullscreen: true,
		pointerLock: true
	};

	/**
	 * Attempts to toggle fullscreen.
	 */
	GameUtils.toggleFullScreen = function () {
		if (!document.fullscreenElement) {
			if (document.documentElement.requestFullScreen) {
				document.documentElement.requestFullScreen();
			}
		} else {
			if (document.cancelFullScreen) {
				document.cancelFullScreen();
			}
		}
	};

	/**
	 * Attempts to lock the mouse pointer in the window.
	 */
	GameUtils.togglePointerLock = function () {
		if (!document.pointerLockElement) {
			if (document.documentElement.requestPointerLock) {
				document.documentElement.requestPointerLock();
			}
		} else {
			if (document.exitPointerLock) {
				document.exitPointerLock();
			}
		}
	};

	/**
	 * Attempts to initialize all shims (animation, fullscreen, pointer lock).
	 * @param {Element} [global=window] The global element (for compatibility checks and patching)
	 */
	GameUtils.initAllShims = function (global) {
		this.initAnimationShims();
		this.initFullscreenShims(global);
		this.initPointerLockShims(global);
	};

	/**
	 * Attempts to initialize the animation shim, ie. defines requestAnimationFrame and cancelAnimationFrame
	 */
	GameUtils.initAnimationShims = function () {
		var lastTime = 0;
		var vendors = ['ms', 'moz', 'webkit', 'o'];

		for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
		}

		if (window.requestAnimationFrame === undefined) {
			window.requestAnimationFrame = function (callback) {
				var currTime = Date.now(), timeToCall = Math.max(0, 16 - (currTime - lastTime));
				var id = window.setTimeout(function () {
					callback(currTime + timeToCall);
				}, timeToCall);
				lastTime = currTime + timeToCall;
				return id;
			};
		}

		if (window.cancelAnimationFrame === undefined) {
			window.cancelAnimationFrame = function (id) {
				clearTimeout(id);
			};
		}
	};

	/**
	 * Attempts to initialize the fullscreen shim, ie. defines requestFullscreen and cancelFullscreen
	 * @param {Element} [global=window] The global element (for compatibility checks and patching)
	 */
	GameUtils.initFullscreenShims = function (global) {
		global = global || window;
		var elementPrototype = (global.HTMLElement || global.Element).prototype;

		if (!document.hasOwnProperty("fullscreenEnabled")) {
			var getter = (function () {
				if ("webkitIsFullScreen" in document) {
					return function () {
						return document.webkitFullscreenEnabled;
					};
				}
				if ("mozFullScreenEnabled" in document) {
					return function () {
						return document.mozFullScreenEnabled;
					};
				}

				GameUtils.supported.fullscreen = false;

				return function () {
					return false;
				};
			})();

			Object.defineProperty(document, "fullscreenEnabled", {
				enumerable: true,
				configurable: false,
				writeable: false,
				get: getter
			});
		}

		if (!document.hasOwnProperty("fullscreenElement")) {
			var getter = (function () {
				var name = ["webkitCurrentFullScreenElement", "webkitFullscreenElement", "mozFullScreenElement"];

				var getNameInDocument = function (i) {
					return function() {
						return document[name[i]];
					};
				};

				for (var i = 0; i < name.length; i++) {
					if (name[i] in document) {
						return getNameInDocument(i);
					}
				}
				return function () {
					return null;
				};
			})();

			Object.defineProperty(document, "fullscreenElement", {
				enumerable: true,
				configurable: false,
				writeable: false,
				get: getter
			});
		}

		function fullscreenchange () {
			var newEvent = document.createEvent("CustomEvent");
			newEvent.initCustomEvent("fullscreenchange", true, false, null);
			document.dispatchEvent(newEvent);
		}
		document.addEventListener("webkitfullscreenchange", fullscreenchange, false);
		document.addEventListener("mozfullscreenchange", fullscreenchange, false);

		function fullscreenerror () {
			var newEvent = document.createEvent("CustomEvent");
			newEvent.initCustomEvent("fullscreenerror", true, false, null);
			document.dispatchEvent(newEvent);
		}
		document.addEventListener("webkitfullscreenerror", fullscreenerror, false);
		document.addEventListener("mozfullscreenerror", fullscreenerror, false);

		if (!elementPrototype.requestFullScreen) {
			elementPrototype.requestFullScreen = (function () {
				if (elementPrototype.webkitRequestFullScreen) {
					return function () {
						this.webkitRequestFullScreen(global.Element.ALLOW_KEYBOARD_INPUT);
					};
				}

				if (elementPrototype.mozRequestFullScreen) {
					return function () {
						this.mozRequestFullScreen();
					};
				}

				return function () {
				};
			})();
		}

		if (!document.cancelFullScreen) {
			document.cancelFullScreen = (function () {
				return document.webkitCancelFullScreen || document.mozCancelFullScreen || function () {
				};
			})();
		}
	};

	/**
	 * Attempts to initialize the pointer lock shim, ie. define requestPointerLock and exitPointerLock
	 * @param {Element} [global=window] The global element (for compatibility checks and patching)
	 */
	GameUtils.initPointerLockShims = function (global) {
		global = global || window;
		var elementPrototype = (global.HTMLElement || global.Element).prototype;
		var mouseEventPrototype = global.MouseEvent.prototype;

		if (!("movementX" in mouseEventPrototype)) {
			Object.defineProperty(mouseEventPrototype, "movementX", {
				enumerable: true,
				configurable: false,
				writeable: false,
				get: function () {
					return this.webkitMovementX || this.mozMovementX || 0;
				}
			});
		}

		if (!("movementY" in mouseEventPrototype)) {
			Object.defineProperty(mouseEventPrototype, "movementY", {
				enumerable: true,
				configurable: false,
				writeable: false,
				get: function () {
					return this.webkitMovementY || this.mozMovementY || 0;
				}
			});
		}

		if (!navigator.pointer) {
			navigator.pointer = navigator.webkitPointer || navigator.mozPointer;
		}

		function pointerlockchange () {
			var newEvent = document.createEvent("CustomEvent");
			newEvent.initCustomEvent("pointerlockchange", true, false, null);
			document.dispatchEvent(newEvent);
		}
		document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
		document.addEventListener("webkitpointerlocklost", pointerlockchange, false);
		document.addEventListener("mozpointerlockchange", pointerlockchange, false);
		document.addEventListener("mozpointerlocklost", pointerlockchange, false);

		function pointerlockerror () {
			var newEvent = document.createEvent("CustomEvent");
			newEvent.initCustomEvent("pointerlockerror", true, false, null);
			document.dispatchEvent(newEvent);
		}
		document.addEventListener("webkitpointerlockerror", pointerlockerror, false);
		document.addEventListener("mozpointerlockerror", pointerlockerror, false);

		if (!document.hasOwnProperty("pointerLockElement")) {
			var getter = (function () {
				if ("webkitPointerLockElement" in document) {
					return function () {
						return document.webkitPointerLockElement;
					};
				}
				if ("mozPointerLockElement" in document) {
					return function () {
						return document.mozPointerLockElement;
					};
				}
				return function () {
					return null;
				};
			})();

			Object.defineProperty(document, "pointerLockElement", {
				enumerable: true,
				configurable: false,
				writeable: false,
				get: getter
			});
		}

		if (!elementPrototype.requestPointerLock) {
			elementPrototype.requestPointerLock = (function () {
				if (elementPrototype.webkitRequestPointerLock) {
					return function () {
						this.webkitRequestPointerLock();
					};
				}

				if (elementPrototype.mozRequestPointerLock) {
					return function () {
						this.mozRequestPointerLock();
					};
				}

				if (navigator.pointer) {
					return function () {
						var elem = this;
						navigator.pointer.lock(elem, pointerlockchange, pointerlockerror);
					};
				}

				GameUtils.supported.pointerLock = false;

				return function () {
				};
			})();
		}

		if (!document.exitPointerLock) {
			document.exitPointerLock = (function () {
				return document.webkitExitPointerLock || document.mozExitPointerLock || function () {
					if (navigator.pointer) {
						navigator.pointer.unlock();
					}
				};
			})();
		}
	};

	return GameUtils;
});