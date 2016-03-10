	describe('Renderer', function () {
		describe('findOrCacheMaterialShader', function () {
			var renderer;
			beforeEach(function () {
				renderer = {};
				renderer.rendererRecord = new RendererRecord();
				renderer.findOrCacheMaterialShader = Renderer.prototype.findOrCacheMaterialShader.bind(renderer);
			});

			function getShader(key, uniforms) {
				return {
					defineKey: key,
					getDefineKey: function () { return key; },
					endFrame: function () {},
					uniforms: uniforms,
					clone: function () { return { key: 'phony' }; }
				};
			}

			it('creates a new shader and caches it', function () {
				var shader = getShader('k1', {});
				var material = {
					shader: shader
				};

				renderer.findOrCacheMaterialShader(material, {});

				expect(renderer.rendererRecord.shaderCache.get('k1')).toBe(material.shader);
				expect(material.shader).not.toBe(shader);
			});

			it('finds a shader with the exact same defines and uses it', function () {
				var shader = getShader('k1', {});

				renderer.rendererRecord.shaderCache.set('k1', shader);

				var material = {
					shader: shader
				};

				renderer.findOrCacheMaterialShader(material, {});

				expect(material.shader).toBe(shader);
			});

			it('finds a shader with the exact same defines and overrides its uniforms', function () {
				var shader = getShader('k1', { u1: 0, u2: 0 });

				renderer.rendererRecord.shaderCache.set('k1', shader);

				var material = {
					shader: getShader('k1', { u1: 123, u2: 456, u3: [7, 8, 9] })
				};

				renderer.findOrCacheMaterialShader(material, {});

				expect(material.shader.uniforms).toEqual({ u1: 123, u2: 456, u3: [7, 8, 9] });
				expect(material.shader.uniforms.u3).not.toBe(shader.u3);
			});
		});
	});
