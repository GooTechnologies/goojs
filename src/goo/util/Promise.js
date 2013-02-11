define([

	], function(

	) {

	function Promise() {
		this._state = 'pending';
		this._resolved = [];
		this._rejected = [];
		this._always = [];
	}

	Promise.prototype.then = function(fulfilledHandler, errorHandler) {
		if(fulfilledHandler && fulfilledHandler !== null) { this._resolved.push(fulfilledHandler); }
		if(errorHandler && errorHandler !== null) { this._rejected.push(errorHandler); }

		return this;
	};

	Promise.prototype.done = function(callback) {
		if(this._state === 'pending')
		{
			this.then(callback);
		}
		else if(this._state === 'resolved')
		{
			callback(this._data);
		}

		return this;
	};
	Promise.prototype.fail = function(callback) {
		if(this._state === 'pending')
		{
			this.then(null, callback);
		}
		else if(this._state === 'rejected')
		{
			callback(this._data);
		}

		return this;
	};
	Promise.prototype.always = function(callback) {
		if(typeof callback !== 'undefined' && callback !== null)
		{
			if(this._state === 'pending')
			{
				this._always.push(callback);
			}
			else
			{
				callback(this._data);
			}
		}

		return this;
	};

	Promise.prototype._resolve = function(data) {
		if(this._state === 'pending')
		{
			this._state = 'resolved';
			this._data = data;
			this._resolved.every(function(fn) { fn(data); return true; });
			this._always.every(function(fn) { fn(data); return true; });
		}

		return this;
	};

	Promise.prototype._reject = function(data) {
		if(this._state === 'pending')
		{

			this._state = 'rejected';
			this._data = data;
			this._rejected.every(function(fn) { fn(data); return true; });
			this._always.every(function(fn) { fn(data); return true; });
		}

		return this;
	};

	Promise.when = function(promise /*, ..., promiseN */) {
		var	promises = Array.prototype.slice.call(arguments),
			length = promises.length,
			remaining = length,
			when = new Promise(),
			values = [];

		var updateFunction = function(i, values) {
			return function(value) {
				values[i] = value;
				if(--remaining <= 0)
				{
					when._resolve(values);
				}
			};
		};

		// add listeners to promises
		if(length > 0)
		{
			var rejectWhen = function(data) {
				when._reject(data);
			};
			
			for(var i in promises)
			{
				if(promises[i] && Object.prototype.toString.call(promises[i].constructor) === '[object Function]') // if exists and function
				{
					promises[i]
						.done(updateFunction(i, values))
						.fail(rejectWhen);
				}
				else // It's not a function, treat as if resolved
				{
					--remaining;
				}
			}
		}

		if(!remaining)
		{
			when._resolve(values);
		}

		return when;
	};

	return Promise;
});