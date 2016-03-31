var Ajax = require('../../src/goo/util/Ajax');

var TestResponses = {
	'good-url': {
		readyState: 4,
		status: 200,
		responseText: 'Successful response.',
		responseHeader: {
			'Content-Type': 'application/text'
		}
	}
};

function createMockXhr(mockResponses) {
	function MockXHR() {

	}

	MockXHR.prototype.open = function (method, url) {
		this.url = url;
	};

	MockXHR.prototype.send = function () {
		if (!mockResponses[this.url]) {
			this.readyState = 4;
			this.status = 404;
			this.statusText = 'Couldn\'t find a fake response: ' + this.url;
			this.onreadystatechange();
			return;
		}

		var response = mockResponses[this.url];

		for (var key in response) {
			this[key] = response[key];
		}

		this.onreadystatechange();
	};

	MockXHR.prototype.getResponseHeader = function (header) {
		return this.responseHeader[header] ? this.responseHeader[header] : null;
	};

	MockXHR.prototype.addEventListener = function (eventName, callback) {
		this.onreadystatechange = callback;
	};

	MockXHR.prototype.removeEventListener = function (eventName, callback) {
		// does nothing!
	};

	return MockXHR;
}

describe('Ajax', function () {
	beforeEach(function () {
		spyOn(window, 'XMLHttpRequest').and.callFake(function () {
			var mockXHR = createMockXhr(TestResponses);
			return mockXHR.prototype;
		});
	});

	it('resolves with the request as argument when the request is successful', function (done) {
		var ajaxSettings = {
			url: 'good-url',
			method: 'GET',
			async: true
		};

		var a = new Ajax().get(ajaxSettings).then(function (data) {
			expect(data.responseText).toEqual('Successful response.');
			done();
		});

		spyOn(a, 'resolve').and.callThrough();
	});


	it('resolves with the request as argument when the request is unsuccessful', function (done) {
		var ajaxSettings = {
			url: 'nonexistent-url',
			method: 'GET',
			async: true
		};

		var a = new Ajax().get(ajaxSettings).then(null, function (reason) {
			expect(reason).toEqual('Couldn\'t find a fake response: ' + ajaxSettings.url);
			done();
		});

		spyOn(a, 'reject').and.callThrough();
	});
});
