define([
	'goo/debugpack/components/MarkerComponent',
	'goo/debugpack/systems/MarkerSystem'
],

	function (
	MarkerComponent,
	MarkerSystem
	) {
	'use strict';

	/**
	 * The debugger utility class adds a way to "select" entities and run a filtered serializer on them. It can also create a REPL and export the selected entity to global scope to aid in debugging with the browser's web console.
	 * @param {boolean} [exportPicked] True if the debugger should create and update window.picked that points to the currently picked entity
	 * @param {boolean} [maximumDeph] True if the debugger should come with it's own REPL
	 */
	function Debugger(exportPicked) {
		this.goo = null;
		this.exportPicked = exportPicked || false;
		this.picked = null;
		this.oldPicked = null;
	}

	/**
	 * Sets event listeners on the REPL
	 * @private
	 */
	Debugger.prototype._setUpREPL = function() {
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
				var entity = this.picked;
				var goo = this.goo;
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

				displayInfo(this.picked);
			} else if(event.keyCode === 38) {
				replinElemHandle.value = lastCommStr;
			}
		}.bind(this), false);
	};

	/**
	 * Sets up the picking system
	 * @private
	 */
	Debugger.prototype._setUpPicking = function() {
		// picking entities
		document.addEventListener('mouseup', function(event) {
			//event.preventDefault();
			event.stopPropagation();

			var mouseDownX = event.pageX;
			var mouseDownY = event.pageY;

			this.goo.pick(mouseDownX, mouseDownY, function(id) {
				var entity = this.goo.world.entityManager.getEntityByIndex(id);
				if(entity) {
					this.oldPicked = this.picked;
					this.picked = entity;

					if(this.picked === this.oldPicked) { this.picked = null; }

					if(this.exportPicked) { window.picked = this.picked; }
					displayInfo(this.picked);
					updateMarker(this.picked, this.oldPicked);
				}
			}.bind(this));
		}.bind(this), false);
	};

	/**
	 * Inject the debugger into the engine and create the debug panel
	 *
	 * @param {GooRunner} goo A GooRunner reference
	 * @returns {Debugger} Self to allow chaining
	 */
	Debugger.prototype.inject = function(goo) {
		this.goo = goo;

		createPanel();

		// adding marker system if there is none
		if(!this.goo.world.getSystem('MarkerSystem')) {
			this.goo.world.setSystem(new MarkerSystem(this.goo));
		}

		this._setUpPicking();

		// setting up onchange for debug parameter filters
		document.getElementById('debugparams').addEventListener('keyup', function() {
			displayInfo(this.picked);
		}.bind(this));

		this._setUpREPL();

		return this;
	};

	/**
	 * Builds and appends the GUI for the debugger
	 * @memberOf Debugger#
	 * @private
	 * @param {boolean} ownREPL True if the debugger should supply its own REPL
	 */
	function createPanel() {
		var div = document.createElement('div');
		div.id = 'debugdiv';
		// serializer
		var innerHTML =
			'<span style="font-size: x-small;font-family: sans-serif">Filter</span><br />' +
			'<textarea cols="30" id="debugparams">name, Compo, tran, data</textarea><br />' +
			'<span style="font-size: x-small;font-family: sans-serif">Result</span><br />' +
			'<textarea readonly rows="10" cols="30" id="debugtex">Click on an entity</textarea><br />';
		// repl
		innerHTML += '<hr />' +
			'<span style="font-size: x-small;font-family: sans-serif">REPL</span><br />' +
			'<textarea readonly rows="10" cols="30" id="replouttex">...</textarea><br />' +
			'<textarea cols="30" id="replintex">entity.</textarea>';
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
	 * @memberOf Debugger#
	 * @private
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

	// JSON.stringy handles typed arrays as objects ("0":0,"1":0,"2":0,"3":0 ... )
	function stringifyTypedArray(typedArray) {
		if(typedArray.length === 0) { return '[]'; }

		var ret = '[' + typedArray[0];
		for (var i = 1; i < typedArray.length; i++) {
			ret += ' ' + typedArray[i];
		}
		ret += ']';
		return ret;
	}

	/**
	 * Walks on the property tree of an object and return a string containing properties matched by a list of interests
	 * @memberOf Debugger#
	 * @private
	 * @param {Object} obj Root object to start the walk from
	 * @param {Array<RegExp>} interests A list of Regexps to filter the properties the walker is visiting
	 * @returns {string}
	 */
	function filterProperties(obj, interests, ident, recursionDeph) {
		if(interests.length === 0) {
			return 'No interests specified;\n\n' +
				'Some popular interests: is, tran, Compo\n\n' +
				'Every entry separated by a comma is a regex';
		}

		if(recursionDeph < 0) { return ident + 'REACHED MAXIMUM DEPH\n'; }

		// null
		if(obj === null) { return ident + 'null\n'; }

		// 'primitive' types and arrays or primitive types
		var typeOfObj = typeof obj;
		if(typeOfObj === 'undefined' ||
			typeOfObj === 'number' ||
			typeOfObj === 'boolean' ||
			typeOfObj === 'string' ||
			(obj instanceof Array && (typeof obj[0] === 'string' || typeof obj[0] === 'number' || typeof obj[0] === 'boolean'))) {
			return ident + JSON.stringify(obj) + '\n';
		}

		// typed arrays
		if(Object.prototype.toString.call(obj).indexOf('Array]') !== -1) {
			return ident + stringifyTypedArray(obj) + '\n';
		}
		// generic objects
		else {
			var retArr = [];
			// go through all the properties of a function
			for (var prop in obj) {
				if(obj.hasOwnProperty(prop)) {

					// skip if function
					if(typeof obj[prop] === 'function') { continue; }

					// explore further if it matches with at least one interest
					for (var i in interests) {
						if(interests[i].test(prop)) {
							var filterStr = filterProperties(obj[prop], interests, ident + ' ', recursionDeph - 1);
							retArr.push(ident + prop + '\n' + filterStr);
							break;
						}
					}
				}
			}
			return retArr.join('');
		}
	}

	/**
	 * Takes away the marker component of the previously picked entity and sets a marker component on the current picked entity
	 * @memberOf Debugger#
	 * @private
	 * @param picked
	 * @param oldPicked
	 */
	function updateMarker(picked, oldPicked) {
		if(picked !== oldPicked) {
			if(oldPicked !== null && oldPicked.hasComponent('MarkerComponent')) {
				oldPicked.clearComponent('MarkerComponent');
			}
			if(picked !== null) {
				picked.setComponent(new MarkerComponent(picked));
			}
		}
		else {
			if(picked.hasComponent('MarkerComponent')) {
				picked.clearComponent('MarkerComponent');
			} else {
				picked.setComponent(new MarkerComponent(picked));
			}
		}
	}

	/**
	 * Builds the interest list and performs the walk on the supplied entity
	 * @memberOf Debugger#
	 * @private
	 * @param {Entity} entity
	 */
	function displayInfo(entity) {
		var filterList = getFilterList(document.getElementById('debugparams').value);

		if(entity) { console.log('==> ', entity); }

		var entityStr = filterProperties(entity, filterList, '', 20);

		var elem = document.getElementById('debugtex');
		elem.value = entityStr;
	}

	return Debugger;
});
