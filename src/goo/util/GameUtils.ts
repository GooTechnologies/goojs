var visibilityChangeListeners = [];

/**
 * Shims for standard gaming features
 * Only used to define the class. Should never be instantiated.
 */
class GameUtils {
	constructor(){}

	/** Supported features. All true by default.
	 * @type {Object}
	 * @property {boolean} fullscreen
	 * @property {boolean} pointerLock
	 */
	static supported = {
		fullscreen: true,
		pointerLock: true
	};

	/**
	 * Attempts to request fullscreen.
	 */
	static requestFullScreen() {
		if (!document.fullscreenElement && (<any>document.documentElement).requestFullScreen) {
			(<any>document.documentElement).requestFullScreen();
		}
	};

	/**
	 * Attempts to exit fullscreen.
	 */
	static exitFullScreen() {
		if (document.fullscreenElement && (<any>document).cancelFullScreen) {
			(<any>document).cancelFullScreen();
		}
	};

	/**
	 * Attempts to toggle fullscreen.
	 */
	static toggleFullScreen() {
		if (!document.fullscreenElement) {
			if ((<any>document.documentElement).requestFullScreen) {
				(<any>document.documentElement).requestFullScreen();
			}
		} else {
			if ((<any>document).cancelFullScreen) {
				(<any>document).cancelFullScreen();
			}
		}
	};

	/**
	 * Attempts to lock the mouse pointer in the window.
	 */
	static requestPointerLock(optionalTarget) {
		var target = optionalTarget || document.documentElement;
		if (target.requestPointerLock) {
			target.requestPointerLock();
		}
	};

	/**
	 * Attempts to unlock the mouse pointer in the window.
	 */
	static exitPointerLock() {
		if (document.exitPointerLock) {
			document.exitPointerLock();
		}
	};

	/**
	 * Attempts to toggle the lock on the mouse pointer in the window.
	 */
	static togglePointerLock(optionalTarget) {
		if (!document.pointerLockElement) {
			GameUtils.requestPointerLock(optionalTarget);
		} else {
			GameUtils.exitPointerLock();
		}
	};

	/**
	 * Add a visibilitychange listener.
	 * @param {Function} callback function called with a boolean (true=hidden, false=visible)
	 */
	static addVisibilityChangeListener(callback) {
		if (typeof callback !== 'function') {
			return;
		}

		var vendors = ['', 'ms', 'moz', 'webkit'];

		var hidden, visibilityChange;
		for (var x = 0; x < vendors.length; ++x) {
			var hiddenAttribute = vendors[x] + (vendors[x].length === 0 ? 'hidden' : 'Hidden');
			var visibilityAttribute = vendors[x] + 'visibilitychange';

			if (typeof document[hiddenAttribute] !== 'undefined') {
				hidden = hiddenAttribute;
				visibilityChange = visibilityAttribute;
				break;
			}
		}

		if (typeof document.addEventListener !== 'undefined' &&
			typeof hidden !== 'undefined') {
			var eventListener = function () {
				if (document[hidden]) {
					callback(true);
				} else {
					callback(false);
				}
			};
			visibilityChangeListeners.push({
				eventName: visibilityChange,
				eventListener: eventListener
			});
			document.addEventListener(visibilityChange, eventListener);
		}
	};

	static clearVisibilityChangeListeners() {
		visibilityChangeListeners.forEach(function (listener) {
			document.removeEventListener(listener.eventName, listener.eventListener);
		});
		visibilityChangeListeners = [];
	};

	/**
	 * Attempts to initialize all shims (animation, fullscreen, pointer lock).
	 * @param {Element} [global=window] The global element (for compatibility checks and patching)
	 */
	static initAllShims(global) {
		GameUtils.initWebGLShims();
		GameUtils.initAnimationShims();
		GameUtils.initFullscreenShims(global);
		GameUtils.initPointerLockShims(global);
	};

	/**
	 * Handle missing WebGL features like IE 11 Uint8ClampedArray
	 */
	static initWebGLShims() {
		(<any>window).Uint8ClampedArray = (<any>window).Uint8ClampedArray || (<any>window).Uint8Array;
	};

	/**
	 * Attempts to initialize the animation shim, ie. defines requestAnimationFrame and cancelAnimationFrame
	 */
	static initAnimationShims() {
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
	static initFullscreenShims(global) {
		global = global || window;
		var elementPrototype = (global.HTMLElement || global.Element).prototype;

		if (!document.hasOwnProperty('fullscreenEnabled')) {
			var getter = (function () {
				if ('webkitIsFullScreen' in document) {
					return function () {
						return document.webkitFullscreenEnabled;
					};
				}
				if ('mozFullScreenEnabled' in document) {
					return function () {
						return (<any>document).mozFullScreenEnabled;
					};
				}

				GameUtils.supported.fullscreen = false;

				return function () {
					return false;
				};
			})();

			(<any>Object.defineProperty)(document, 'fullscreenEnabled', {
				enumerable: true,
				configurable: false,
				writeable: false,
				get: getter
			});
		}

		if (!document.hasOwnProperty('fullscreenElement')) {
			var getter = (function () {
				var name = ['webkitCurrentFullScreenElement', 'webkitFullscreenElement', 'mozFullScreenElement'];

				var getNameInDocument = function (i) {
					return function () {
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

			(<any>Object.defineProperty)(document, 'fullscreenElement', {
				enumerable: true,
				configurable: false,
				writeable: false,
				get: getter
			});
		}

		function fullscreenchange() {
			var newEvent = document.createEvent('CustomEvent');
			newEvent.initCustomEvent('fullscreenchange', true, false, null);
			document.dispatchEvent(newEvent);
		}
		document.addEventListener('webkitfullscreenchange', fullscreenchange, false);
		document.addEventListener('mozfullscreenchange', fullscreenchange, false);

		function fullscreenerror() {
			var newEvent = document.createEvent('CustomEvent');
			newEvent.initCustomEvent('fullscreenerror', true, false, null);
			document.dispatchEvent(newEvent);
		}
		document.addEventListener('webkitfullscreenerror', fullscreenerror, false);
		document.addEventListener('mozfullscreenerror', fullscreenerror, false);

		if (!elementPrototype.requestFullScreen) {
			elementPrototype.requestFullScreen = (function () {
				if (elementPrototype.msRequestFullscreen) {
					return function () {
						this.msRequestFullscreen();
					};
				}

				if (elementPrototype.webkitRequestFullscreen) {
					return function () {
						this.webkitRequestFullscreen(global.Element.ALLOW_KEYBOARD_INPUT);
					};
				}

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

				return function () {};
			})();
		}

		if (!(<any>document).cancelFullScreen) {
			(<any>document).cancelFullScreen = (function () {
				return document.webkitCancelFullScreen || (<any>document).mozCancelFullScreen || function () {
				};
			})();
		}
	};

	/**
	 * Attempts to initialize the pointer lock shim, ie. define requestPointerLock and exitPointerLock
	 * @param {Element} [global=window] The global element (for compatibility checks and patching)
	 */
	static initPointerLockShims(global) {
		global = global || window;
		var elementPrototype = (global.HTMLElement || global.Element).prototype;

		if (!global.MouseEvent) {
			return;
		}

		var mouseEventPrototype = global.MouseEvent.prototype;

		if (!('movementX' in mouseEventPrototype)) {
			(<any>Object.defineProperty)(mouseEventPrototype, 'movementX', {
				enumerable: true,
				configurable: false,
				writeable: false,
				get: function () {
					return this.webkitMovementX || this.mozMovementX || 0;
				}
			});
		}

		if (!('movementY' in mouseEventPrototype)) {
			(<any>Object.defineProperty)(mouseEventPrototype, 'movementY', {
				enumerable: true,
				configurable: false,
				writeable: false,
				get: function () {
					return this.webkitMovementY || this.mozMovementY || 0;
				}
			});
		}

		if (!(<any>navigator).pointer) {
			(<any>navigator).pointer = (<any>navigator).webkitPointer || (<any>navigator).mozPointer;
		}

		function pointerlockchange() {
			var newEvent = document.createEvent('CustomEvent');
			newEvent.initCustomEvent('pointerlockchange', true, false, null);
			document.dispatchEvent(newEvent);
		}
		document.addEventListener('webkitpointerlockchange', pointerlockchange, false);
		document.addEventListener('webkitpointerlocklost', pointerlockchange, false);
		document.addEventListener('mozpointerlockchange', pointerlockchange, false);
		document.addEventListener('mozpointerlocklost', pointerlockchange, false);

		function pointerlockerror() {
			var newEvent = document.createEvent('CustomEvent');
			newEvent.initCustomEvent('pointerlockerror', true, false, null);
			document.dispatchEvent(newEvent);
		}
		document.addEventListener('webkitpointerlockerror', pointerlockerror, false);
		document.addEventListener('mozpointerlockerror', pointerlockerror, false);

		if (!("pointerLockElement" in document)) {
			var getter = (function () {
				if ('webkitPointerLockElement' in document) {
					return function () {
						return (<any>document).webkitPointerLockElement;
					};
				}
				if ('mozPointerLockElement' in document) {
					return function () {
						return (<any>document).mozPointerLockElement;
					};
				}
				return function () {
					return null;
				};
			})();

			(<any>Object.defineProperty)(document, 'pointerLockElement', {
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

				if ((<any>navigator).pointer) {
					return function () {
						(<any>navigator).pointer.lock(this, pointerlockchange, pointerlockerror);
					};
				}

				GameUtils.supported.pointerLock = false;

				return function () {};
			})();
		}

		if (!(<any>document).exitPointerLock) {
			(<any>document).exitPointerLock = (function () {
				return (<any>document).webkitExitPointerLock || (<any>document).mozExitPointerLock || function () {
					if ((<any>navigator).pointer) {
						(<any>navigator).pointer.unlock();
					}
				};
			})();
		}
	};
}

export = GameUtils;