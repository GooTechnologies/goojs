define([ 'goo/entities/Entity', 'goo/entities/managers/EntityManager' ], function(Entity, EntityManager) {
	function World() {
		initObserverWatch1();

		this._managers = {};
		this._systems = {};

		this._addedEntities = [];
		this._changedEntities = [];
		this._removedEntities = [];

		this._entityManager = new EntityManager();
		this.setManager(this._entityManager);

		this.tpf = 1.0;
	}

	World.prototype.setManager = function(manager) {
		this._managers[manager.type] = manager;
	};

	World.prototype.setSystem = function(system) {
		this._systems[system.type] = system;
	};

	World.prototype.createEntity = function() {
		return new Entity(this);
	};

	World.prototype.getEntities = function() {
		return this._entityManager.getEntities();
	};

	World.prototype.addEntity = function(entity) {
		this._addedEntities.push(entity);
	};

	World.prototype.removeEntity = function(entity) {
		this._removedEntities.push(entity);
	};

	World.prototype.changedEntity = function(entity) {
		this._changedEntities.push(entity);
	};

	World.prototype.process = function() {
		this._check(this._addedEntities, function(observer, entity) {
			if (observer.added) {
				observer.added(entity);
			}
		});
		this._check(this._changedEntities, function(observer, entity) {
			if (observer.changed) {
				observer.changed(entity);
			}
		});
		this._check(this._removedEntities, function(observer, entity) {
			if (observer.removed) {
				observer.removed(entity);
			}
		});

		for (systemIndex in this._systems) {
			var system = this._systems[systemIndex];
			if (!system.passive) {
				system._process();
			}
		}
	};

	World.prototype._check = function(entities, callback) {
		for (index in entities) {
			var entity = entities[index];
			for (managerIndex in this._managers) {
				var manager = this._managers[managerIndex];
				callback(manager, entity);
			}
			for (systemIndex in this._systems) {
				var system = this._systems[systemIndex];
				callback(system, entity);
			}
		}
		entities.length = 0;
	};

	function initObserverWatch1() {
		var $watchjs$ = {
			isFunction : function(functionToCheck) {
				var getType = {};
				return functionToCheck && getType.toString.call(functionToCheck) == '[object Function]';
			},

			isInt : function(x) {
				var y = parseInt(x);
				if (isNaN(y)) {
					return false;
				}
				return x == y && x.toString() == y.toString();
			},
			isArray : function(obj) {
				return Object.prototype.toString.call(obj) === '[object Array]';
			},
			defineGetAndSet : function(obj, propName, getter, setter) {
				try {
					Object.defineProperty(obj, propName, {
						get : getter,
						set : setter,
						enumerable : true,
						configurable : true
					});
				} catch (error) {
					try {
						Object.prototype.__defineGetter__.call(obj, propName, getter);
						Object.prototype.__defineSetter__.call(obj, propName, setter);
					} catch (error2) {
						throw "watchJS error: browser not supported :/";
					}
				}
			},
			defineProp : function(obj, propName, value) {
				try {
					Object.defineProperty(obj, propName, {
						enumerable : false,
						configurable : true,
						writable : false,
						value : value
					});
				} catch (error) {
					obj[propName] = value;
				}
			}
		};

		$watchjs$.defineProp(Object.prototype, "watch", function() {

			if (arguments.length == 1) {
				this.watchAll.apply(this, arguments);
			} else if ($watchjs$.isArray(arguments[0])) {
				this.watchMany.apply(this, arguments);
			} else {
				this.watchOne.apply(this, arguments);
			}

		});

		$watchjs$.defineProp(Object.prototype, "watchAll", function(watcher) {

			var obj = this;

			if (obj instanceof String || (!(obj instanceof Object) && !$watchjs$.isArray(obj))) {
				return;
			}

			var props = [];

			if ($watchjs$.isArray(obj)) {
				for ( var prop = 0; prop < obj.length; prop++) { // for each
					// item if
					// obj is an
					// array
					props.push(prop); // put in the props
				}
			} else {
				for ( var prop2 in obj) { // for each attribute if obj is an
					// object
					props.push(prop2); // put in the props
				}
			}

			obj.watchMany(props, watcher); // watch all itens of the props
		});

		$watchjs$.defineProp(Object.prototype, "watchMany", function(props, watcher) {
			var obj = this;

			if ($watchjs$.isArray(obj)) {
				for ( var prop in props) { // watch each iten of "props" if is
					// an array
					obj.watchOne(props[prop], watcher);
				}
			} else {
				for ( var prop2 in props) { // watch each attribute of "props"
					// if is an object
					obj.watchOne(props[prop2], watcher);
				}
			}
		});

		$watchjs$.defineProp(Object.prototype, "watchOne", function(prop, watcher) {
			var obj = this;

			var val = obj[prop];

			if (obj[prop] === undefined || $watchjs$.isFunction(obj[prop])) {
				return;
			}

			if (obj[prop] != null) {
				obj[prop].watchAll(watcher); // recursively watch all
				// attributes of this
			}

			obj.watchFunctions(prop);

			if (!obj.watchers) {
				$watchjs$.defineProp(obj, "watchers", {});
			}

			if (!obj.watchers[prop]) {
				obj.watchers[prop] = [];
			}

			obj.watchers[prop].push(watcher); // add the new watcher in the
			// watchers array

			var getter = function() {
				return val;
			};

			var setter = function(newval) {
				var oldval = val;
				val = newval;

				if (obj[prop]) {
					obj[prop].watchAll(watcher);
				}

				obj.watchFunctions(prop);

				if (JSON.stringify(oldval) != JSON.stringify(newval) && arguments.callee.caller != watcher) {
					obj.callWatchers(prop, obj, oldval, newval);
				}
			};

			$watchjs$.defineGetAndSet(obj, prop, getter, setter);

		});

		$watchjs$.defineProp(Object.prototype, "callWatchers", function(prop, obj, oldval, newval) {
			var obj = this;

			for ( var wr in obj.watchers[prop]) {
				if ($watchjs$.isInt(wr)) {
					obj.watchers[prop][wr](oldval, newval, obj, prop);
				}
			}
		});

		$watchjs$.defineProp(Object.prototype, "watchFunctions", function(prop) {
			var obj = this;

			if ((!obj[prop]) || (obj[prop] instanceof String) || (!$watchjs$.isArray(obj[prop]))) {
				return;
			}

			var originalpop = obj[prop].pop;
			$watchjs$.defineProp(obj[prop], "pop", function() {
				var response = originalpop.apply(this, arguments);

				obj.watchOne(obj[prop]);
				obj.callWatchers(prop);

				return response;
			});

			var originalpush = obj[prop].push;
			$watchjs$.defineProp(obj[prop], "push", function() {
				var response = originalpush.apply(this, arguments);

				obj.watchOne(obj[prop]);
				obj.callWatchers(prop);

				return response;
			});

			var originalreverse = obj[prop].reverse;
			$watchjs$.defineProp(obj[prop], "reverse", function() {
				var response = originalreverse.apply(this, arguments);

				obj.watchOne(obj[prop]);
				obj.callWatchers(prop);

				return response;
			});

			var originalshift = obj[prop].shift;
			$watchjs$.defineProp(obj[prop], "shift", function() {
				var response = originalshift.apply(this, arguments);

				obj.watchOne(obj[prop]);
				obj.callWatchers(prop);

				return response;
			});

			var originalsort = obj[prop].sort;
			$watchjs$.defineProp(obj[prop], "sort", function() {
				var response = originalsort.apply(this, arguments);

				obj.watchOne(obj[prop]);
				obj.callWatchers(prop);

				return response;
			});

			var originalslice = obj[prop].slice;
			$watchjs$.defineProp(obj[prop], "slice", function() {
				var response = originalslice.apply(this, arguments);

				obj.watchOne(obj[prop]);

				return response;
			});

			var originalunshift = obj[prop].unshift;
			$watchjs$.defineProp(obj[prop], "unshift", function() {
				var response = originalunshift.apply(this, arguments);

				obj.watchOne(obj[prop]);
				obj.callWatchers(prop);

				return response;
			});

		});
	}

	function initObserverWatch2() {
		if (!Object.prototype.watch) {
			Object.defineProperty(Object.prototype, "watch", {
				enumerable : false,
				configurable : true,
				writable : false,
				value : function(prop, handler) {
					var oldval = this[prop], newval = oldval, getter = function() {
						return newval;
					}, setter = function(val) {
						oldval = newval;
						return newval = handler.call(this, prop, oldval, val);
					};

					if (delete this[prop]) { // can't watch constants
						Object.defineProperty(this, prop, {
							get : getter,
							set : setter,
							enumerable : true,
							configurable : true
						});
					}
				}
			});
		}

		if (!Object.prototype.unwatch) {
			Object.defineProperty(Object.prototype, "unwatch", {
				enumerable : false,
				configurable : true,
				writable : false,
				value : function(prop) {
					var val = this[prop];
					delete this[prop]; // remove accessors
					this[prop] = val;
				}
			});
		}
	}

	return World;
});