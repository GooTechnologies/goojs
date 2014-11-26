define([
	'goo/renderer/Renderer',
	'goo/renderer/RendererRecord'
], function (
	Renderer,
	RendererRecord
) {
	'use strict';
	
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
					getDefineKey: function () { return key; },
					endFrame: function () {},
					uniforms: uniforms,
					clone: function () { return this; }
				};
			}

			it('creates a new shader and caches it', function () {
				var shader = getShader('k1', {});

				var material = {
					shader: getShader(null, {})
				};

				var result = renderer.findOrCacheMaterialShader(material, shader, {});

				expect(renderer.rendererRecord.shaderCache.get('k1')).toBe(shader);
				expect(material.shader).toBe(shader);
				expect(result).toBe(shader);
			});

			it('finds a shader with the exact same defines and uses it', function () {
				var shader = getShader('k1', {});

				renderer.rendererRecord.shaderCache.set('k1', shader);

				var material = {
					shader: getShader(null, {})
				};

				var result = renderer.findOrCacheMaterialShader(material, shader, {});

				expect(material.shader).toBe(shader);
				expect(result).toBe(shader);
			});

			it('finds a shader with the exact same defines and overrides its uniforms', function () {
				var shader = getShader('k1', { u1: 0, u2: 0 });

				renderer.rendererRecord.shaderCache.set('k1', shader);

				var material = {
					shader: getShader('k1', { u1: 123, u2: 456, u3: [7, 8, 9] })
				};

				var result = renderer.findOrCacheMaterialShader(material, shader, {});

				expect(result.uniforms).toEqual({ u1: 123, u2: 456, u3: [7, 8, 9] });
				expect(result.uniforms.u3).not.toBe(shader.u3);
			});
		});
	});
});
