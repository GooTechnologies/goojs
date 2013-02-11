define([
		'goo/loaders/MeshLoader',
		'goo/util/Promise',
		'goo/util/Ajax',
		'goo/renderer/MeshData'
	],
	function(
		MeshLoader,
		Promise,
		Ajax,
		MeshData
	) {
	'use strict';

	var TestResponses = {
		'mesh' :
		{
			"data": {
				"VertexCount": 8,
				"Indices": [
					0,
					1,
					3,
					2,
					3,
					1,
					4,
					7,
					5,
					6,
					5,
					7,
					0,
					4,
					1,
					5,
					1,
					4,
					1,
					5,
					2,
					6,
					2,
					5,
					2,
					6,
					3,
					7,
					3,
					6,
					4,
					0,
					7,
					3,
					7,
					0
				],
				"Vertices": [
					1.0,
					0.9999999403953552,
					-1.0,
					1.0,
					-1.0,
					-1.0,
					-1.0000001192092896,
					-0.9999998211860657,
					-1.0,
					-0.9999996423721313,
					1.0000003576278687,
					-1.0,
					1.0000004768371582,
					0.999999463558197,
					1.0,
					0.9999993443489075,
					-1.0000005960464478,
					1.0,
					-1.0000003576278687,
					-0.9999996423721313,
					1.0,
					-0.9999999403953552,
					1.0,
					1.0
				],
				"Normals": [
					0.5773491859436035,
					0.5773491859436035,
					-0.5773491859436035,
					0.5773491859436035,
					-0.5773491859436035,
					-0.5773491859436035,
					-0.5773491859436035,
					-0.5773491859436035,
					-0.5773491859436035,
					-0.5773491859436035,
					0.5773491859436035,
					-0.5773491859436035,
					0.5773491859436035,
					0.5773491859436035,
					0.5773491859436035,
					0.5773491859436035,
					-0.5773491859436035,
					0.5773491859436035,
					-0.5773491859436035,
					-0.5773491859436035,
					0.5773491859436035,
					-0.5773491859436035,
					0.5773491859436035,
					0.5773491859436035
				],
				"TextureCoords": [
					[0, 1,
					0,0,
					1,0,
					1,1,

					1,1,
					1,0,
					0,0,
					0,1]
				],
				"IndexModes": [
					"Triangles"
				],
				"IndexLengths": [
					36
				]
			},
			"name": "Cube",
			"compressed": false
		},
		'badMesh' :
		{
			"data": {
				"VertexCount": 8,
				"Indices": [
					0,
					1,
					3,
					2,
					3,
					1,
					4,
					7,
					5,
					6,
					5,
					7,
					0,
					4,
					1,
					5,
					1,
					4,
					1,
					5,
					2,
					6,
					2,
					5,
					2,
					6,
					3,
					7,
					3,
					6,
					4,
					0,
					7,
					3,
					7,
					0
				],
				"Vertices": [
					1.0,
					0.9999999403953552,
					-1.0,
					1.0,
					-1.0,
					-1.0,
					-1.0000001192092896,
					-0.9999998211860657,
					-1.0,
					-0.9999996423721313,
					1.0000003576278687,
					-1.0,
					1.0000004768371582,
					0.999999463558197,
					1.0,
					0.9999993443489075,
					-1.0000005960464478,
					1.0,
					-1.0000003576278687,
					-0.9999996423721313,
					1.0,
					-0.9999999403953552,
					1.0,
					1.0
				],
				"Normals": [
					0.5773491859436035,
					0.5773491859436035,
					-0.5773491859436035,
					0.5773491859436035,
					-0.5773491859436035,
					-0.5773491859436035,
					-0.5773491859436035,
					-0.5773491859436035,
					-0.5773491859436035,
					-0.5773491859436035,
					0.5773491859436035,
					-0.5773491859436035,
					0.5773491859436035,
					0.5773491859436035,
					0.5773491859436035,
					0.5773491859436035,
					-0.5773491859436035,
					0.5773491859436035,
					-0.5773491859436035,
					-0.5773491859436035,
					0.5773491859436035,
					-0.5773491859436035,
					0.5773491859436035,
					0.5773491859436035
				],
				"TextureCoords": [
					[0, 1,
					0,0,
					1,0,
					1,1,

					1,1,
					1,0,
					0,0,
					0,1]
				],
				"IndexModes": [
					"Triangles"
				],
				"IndexLengths": [
					36
				]
			},
			"name": "Cube",
			"compressed": false
		}
	};

	for(var key in TestResponses) {
		TestResponses[key] = {
			readyState : 4,
			status : 200,
			responseHeader : {
				'Content-Type' : 'application/json'
			},
			responseText : JSON.stringify(TestResponses[key])
		};
	}
	TestResponses.badMesh.responseText += "lalala''lalaola'";


	function MockXHRBuilder(mockResponses) {
		function MockXHR() {

		}

		MockXHR.prototype.open = function(method, url) {
			this.url = url;
		};

		MockXHR.prototype.send = function() {
			if(!mockResponses[this.url])
			{
				this.readyState = 4;
				this.status = 404;
				this.statusText = 'Couldn\'t find a fake response: ' + this.url;
				this.onreadystatechange();
				return;
			}

			var response = mockResponses[this.url];

			for(var key in response) {
				this[key] = response[key];
			}

			this.onreadystatechange();
		};

		MockXHR.prototype.getResponseHeader = function(header) {
			return this.responseHeader[header] ? this.responseHeader[header] : null;
		};

		return MockXHR;
	}

	describe('MeshLoader', function() {
		var loader;
		var goo;
		var projectURL;
		var sceneURL;
		var XHR = XMLHttpRequest;
		//var XMLHttpRequest = new MockXHRBuilder(TestResponses);

		beforeEach(function() {
			XMLHttpRequest = new MockXHRBuilder(TestResponses);
			loader = new MeshLoader();
		});

		afterEach(function() {
			XMLHttpRequest = XHR;
			loader = null;
		});

		it("has an empty string as project URL when nothing is passed to the constructor", function() {
			var aLoader = new MeshLoader();

			expect(aLoader._rootUrl).toBe('');
		});

		it("sets the project URL when passed to the constructor", function() {
			var aLoader = new MeshLoader('pancakes');

			expect(aLoader._rootUrl).toBe('pancakes');
		});

		describe('.setRootUrl()', function() {

			it("sets the root url", function() {
				loader.setRootUrl('bacon');

				expect(loader._rootUrl).toBe('bacon');
			});
		});

		describe('.load()', function() {

			it('resolves its promise and creates a new Mesh from a correct URL', function() {
				var promise = loader.load('mesh');


				promise
					.done(function(data) {
						expect(data instanceof MeshData).toBeTruthy();
						//Do some more checks
						expect(data.indexCount).toBeGreaterThan(0);
						expect(data.vertexCount).toBeGreaterThan(0);
					})
					.always(function() {
						//expect(promise._resolve).toHaveBeenCalled();
						expect(promise._state).toBe('resolved');
					});
			});

			it('rejects its promise from a bad URL', function() {
				var promise = loader.load('404');

				promise.always(function() {
					//expect(promise._reject).toHaveBeenCalled();
					expect(promise._state).toBe('rejected');
				});
			});

			it('rejects its promise when the URL response isn\'t valid JSON', function() {
				var promise = loader.load('badMesh');

				promise.always(function() {
					//expect(promise._reject).toHaveBeenCalled();
					expect(promise._state).toBe('rejected');
				});
			});

			it('loads are unique with every call', function() {

				var promise1 = loader.load('mesh'),
						promise2 = loader.load('mesh');

				Promise.when(promise1, promise2)
					.done(function(data) {
						// Do some checks
						expect(data[0]).not.toBe(data[1]);
					})
					.fail(function() {
						// Fail test if we come here
						expect('success').toBe('failure');
					});
			});
		});
	});



});