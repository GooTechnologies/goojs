define([
	'goo/entities/Entity',
	'goo/entities/managers/EntityManager',
	'goo/entities/components/TransformComponent',
	'goo/math/Ray',
	'goo/entities/systems/PickingSystem',
	'goo/picking/PrimitivePickLogic',
	'goo/renderer/Renderer',
	'goo/debug/components/MarkerComponent',
	'goo/debug/systems/MarkerSystem'
],
	/** @lends */
	function (
	Entity,
	EntityManager,
	TransformComponent,
	Ray,
	PickingSystem,
	PrimitivePickLogic,
	Renderer,
	MarkerComponent,
	MarkerSystem
	) {
	"use strict";

	// REVIEW: The @class documentation doesn't give me any information.
	// I already know that this class is related to debugging as it's called Debugger.
	// I also know that it has some utility and I can see that it's a class.
	// There's a small description in the story, why not paste that into the documentation?

	// REVIEW: What's the ownREPL argument for? Why not remove it and always have a REPL?
	// (Boolean arguments is a code smell, but exportPicked is convenient so I'm not complaining about that one.)

	/**
	 * @class The debugger utility class
	 * @param {boolean} [ownREPL] True if the debugger should come with it's own REPL
	 * @param {boolean} [exportPicked] True if the debugger should create and update window.picked that points to the currently picked entity
	 */
	function Debugger(ownREPL, exportPicked) {
		this.goo = null;
		this.ownREPL = ownREPL || false;
		this.exportPicked = exportPicked || false;
	}

	/**
	 * Inject the debugger into the engine and create the debug panel
	 *
	 * @param {GooRunner} goo A GooRunner reference
	 * @returns {Debugger} Self to allow chaining
	 */
	Debugger.prototype.inject = function(goo) {
		// REVIEW: This function is long and contains functionality for different concerns (picking, UI etc). Split it up!
		this.goo = goo;

		createPanel(this.ownREPL);

		// adding marker system if there is none
		if(!this.goo.world.getSystem('MarkerSystem')) {
			this.goo.world.setSystem(new MarkerSystem(this.goo));
		}

		// adding picking system
		var picking = new PickingSystem({
			pickLogic: new PrimitivePickLogic()
		});
		this.goo.world.setSystem(picking);

		// current and old picked entity
		var picked = null;
		var oldPicked = null;

		var that = this;
		picking.onPick = function(pickedList) {
			if (pickedList && pickedList.length) {
				oldPicked = picked;
				picked = pickedList[0].entity;

				if(that.exportPicked) {
					window.picked = picked;
				}

				displayInfo(picked);
				updateMarker(picked, oldPicked);
			}
		};

		// picking entities
		document.addEventListener('mouseup', function(event) {
			//event.preventDefault();
			event.stopPropagation();

			var mouseDownX = event.pageX;
			var mouseDownY = event.pageY;

			var ray = new Ray();
			Renderer.mainCamera.getPickRay(mouseDownX, mouseDownY, that.goo.renderer.viewportWidth, that.goo.renderer.viewportHeight, ray);

			// Ask all appropriate world entities if they've been picked
			picking.pickRay = ray;

			// REVIEW: Calling a private method is not allowed. Should _process be public instead?
			// It's a mess since there's both a _process and a process function in the PickingSystem
			// but with different arguments. I think they should swap names with each other.
			picking._process();
		}, false);

		// setting up onchange for debug parameter filters
		document.getElementById('debugparams').addEventListener('keyup', function() {
			displayInfo(picked);
		});

		if(this.ownREPL) {
			var lastCommStr = '';

			// repl keypresses
			document.getElementById('replintex').addEventListener('keyup', function(event) {
				/* jshint evil: true */
				//event.preventDefault();
				event.stopPropagation();
				var replinElemHandle = document.getElementById('replintex');
				var reploutElemHandle = document.getElementById('replouttex');
				if(event.keyCode === 13 && !event.shiftKey) {
					var commStr = replinElemHandle.value.substr(0, replinElemHandle.value.length - 1);
					lastCommStr = commStr;

					// setup variables for eval scope
					//noinspection UnnecessaryLocalVariableJS
					var entity = picked;
					var goo = that.goo;
					// manually suppressing "unused variable"
					void(entity);
					void(goo);

					var resultStr = '';
					try {
						resultStr += eval(commStr);
					} catch(err) {
						resultStr += err;
					}
					replinElemHandle.value = 'entity.';
					reploutElemHandle.value += '\n-------\n' + resultStr;

					displayInfo(picked);
				} else if(event.keyCode === 38) {
					replinElemHandle.value = lastCommStr;
				}
			}, false);
		}

		return this;
	};

	/**
	 * Builds and appends the GUI for the debugger
	 * @param {boolean} ownREPL True if the debugger should supply its own debugger
	 */
	function createPanel(ownREPL) {
		var div = document.createElement('div');
		div.id = 'debugdiv';
		var innerHTML =
			'<span style="font-size: x-small;font-family: sans-serif">Filter</span><br />' +
			'<textarea cols="30" id="debugparams">name, Compo, tran, data</textarea><br />' +
			'<span style="font-size: x-small;font-family: sans-serif">Result</span><br />' +
			'<textarea readonly rows="10" cols="30" id="debugtex">Click on an entity</textarea><br />';
		if(ownREPL) {
			innerHTML += '<hr />' +
			'<span style="font-size: x-small;font-family: sans-serif">REPL</span><br />' +
			'<textarea readonly rows="10" cols="30" id="replouttex">...</textarea><br />' +
			'<textarea cols="30" id="replintex">entity.</textarea>';
		}
		div.innerHTML = innerHTML;
		div.style.position = 'absolute';
		div.style.zIndex = '2001';
		div.style.backgroundColor = '#DDDDDD';
		div.style.left = '10px';
		div.style.top = '100px';
		div.style.webkitTouchCallout = 'none';
		div.style.webkitUserSelect = 'none';
		div.style.khtmlUserSelect = 'none';
		div.style.mozUserSelect = 'none';
		div.style.msUserSelect = 'none';
		div.style.userSelect = 'none';

		div.style.padding = '3px';
		div.style.borderRadius = '6px';

		document.body.appendChild(div);
	}

	/**
	 * Transforms a string into an array of regexps
	 * @param {String} str
	 * @returns {Array}
	 */
	function getFilterList(str) {
		return str.split(',').map(function(entry) {
				return entry.replace(/(^[\s]+|[\s]+$)/g, '');
			}).filter(function(entry) {
				return entry.length > 0;
			}).map(function(entry) {
				return new RegExp(entry);
			});
	}

	/**
	 * Walks on the property tree of an object and return a string containing properties matched by a list of interests
	 * @param {Object} obj Root object to start the walk from
	 * @param {RegExp[]} interests A list of Regexps to filter the properties the walker is visiting
	 * @returns {string}
	 */
	function filterProperties(obj, interests) {
		// REVIEW: The variables i and ret are declared twice in this function.
		// Strange that JSHint doesn't complain about that. WebStorm does anyway.
		if(interests.length === 0) {
			return 'No interests specified;\n\nSome popular interests: is, tran, Compo\n\nEvery entry separated by a comma is a regex';
		}

		// REVIEW: Try replacing all of this with a call to JSON.stringify.
		if(obj === null) {
			return 'null';
		} else if(typeof obj === 'undefined') {
			return obj + '\n';
		} else if(typeof obj === 'number') {
			// REVIEW: Is this a mistake? Adding quotes around a number.
			return '"' + obj + '"\n';
		} else if(typeof obj === 'boolean') {
			return obj + '\n';
		} else if(typeof obj === 'string') {
			return '"' + obj + '"\n';
		} else if(obj instanceof Array && (typeof obj[0] === 'string' || typeof obj[0] === 'number')) {
			return '[' + obj.join(' ') + ']\n';
		}
		else if(Object.prototype.toString.call(obj).indexOf('Array]') !== -1) {
			var ret = '[' + obj[0];
			for (var i = 1; i < obj.length; i++) {
				ret += ' ' + obj[i];
			}
			ret += ']\n';
			return ret;
		} else {
			var ret = '';
			// go through all the properties of a function
			for (var prop in obj) {
				// REVIEW: Add a hasOwnProperty check here!

				// skip if it's a function
				// REVIEW: Instead of this comment, and to avoid another level of indentation, just do:
				// if(typeof obj[prop] === 'function') {
				//   continue;
				// }
				// That makes it very clear what happens (the `continue` keyword corresponds to the word skip).
				if(typeof obj[prop] !== 'function') {
					// explore further if it matches with at least one interest
					for (var i in interests) {
						if(interests[i].test(prop)) {
							ret += prop;
							// REVIEW: Underscore in variable name. Unconventional in JS.
							var filter_Str = filterProperties(obj[prop], interests);

							// REVIEW: To avoid this if statement, just collect all the attribute names in an array
							// and join them using the join function,
							// e.g.
							// attributes = ['entity', 'transformComponent', 'transform']; // all names
							// return attributes.join('.');
							// The speed difference of this compared to the += operator can be huge too!
							if(filter_Str.length === 0) {
								ret += filter_Str;
								ret += '\n';
							} else {
								ret += '.';
								ret += filter_Str;
							}
							break;
						}
					}
				}
			}
			return ret;
		}
	}

	/**
	 * Takes away the marker component of the previously picked entity and sets a marker component on the current picked entity
	 * @param picked
	 * @param oldPicked
	 */
	function updateMarker(picked, oldPicked) {
		if(picked !== oldPicked) {
			// REVIEW: Long lines! Keep one statement per line!
			if(oldPicked !== null) { if(oldPicked.hasComponent('MarkerComponent')) { oldPicked.clearComponent('MarkerComponent'); } }
			if(picked !== null) { picked.setComponent(new MarkerComponent(picked)); }
		}
		else {
			if(picked.hasComponent('MarkerComponent')) {
				// REVIEW: This makes it look like the selection was cleared,
				// but actually picked isn't set to null or anything, so the GUI is lying.
				// Either don't support deselection at all or implement it so that picked is actually cleared
				// (the function calling this one should do that).
				picked.clearComponent('MarkerComponent');
			} else {
				picked.setComponent(new MarkerComponent(picked));
			}
		}
	}

	/**
	 * Builds the interest list and performs the walk on the supplied entity
	 * @param {Entity} entity
	 */
	function displayInfo(entity) {
		var filterList = getFilterList(document.getElementById('debugparams').value);

		console.log('==> ', entity);

		var elem = document.getElementById('debugtex');

		var entityStr;
		try {
			entityStr = filterProperties(entity, filterList, '');
		} catch(err) {
			// REVIEW: Dangerous error handling. Don't just assume that the error is what you think it is,
			// as that can hide other errors and give a completely wrong error message to the user.
			entityStr = 'Too many results; narrow your search';
		}
		elem.value = entityStr;
	}

	return Debugger;
});
