# Goo Engine

Goo Engine is an open-source 3D engine using HTML5 and WebGL for rendering.

## Showcases

<p>
<a href="http://goocreate.com/showcase/case/mountains-of-mouthness/"><img src="http://labs.gooengine.com/github-images/mountains.jpg"/></a>
<a href="http://goocreate.com/showcase/case/suissemania/"><img src="http://labs.gooengine.com/github-images/suissemania.jpg"/></a>
<a href="http://goocreate.com/showcase/case/nike-phenomenal-shot/"><img src="http://labs.gooengine.com/github-images/nike.jpg"/></a>
<br>
<a href="http://goocreate.com/showcase/case/solar-system/"><img src="http://labs.gooengine.com/github-images/solarsystem.jpg"/></a>
<a href="http://goocreate.com/showcase/case/thomson-reuters/"><img src="http://labs.gooengine.com/github-images/abb.jpg"/></a>
<a href="http://goocreate.com/showcase/case/mazda/"><img src="http://labs.gooengine.com/github-images/mazda.jpg"/></a>
<br>
</p>

[More showcases...](http://goocreate.com/)

## Install

Browser: add the following to your webpage.

```html
<script src="http://code.gooengine.com/latest/lib/goo.js"></script>
```

Node.js: 

```js
npm install --save goojs
```

## Sample code

[Open on codepen](http://codepen.io/rherlitz/pen/yKruG)

```js
// var goo = require('goojs'); // (for node.js)

// Create a runner
var gooRunner = new goo.GooRunner();
var world = gooRunner.world;

// Add the canvas to the DOM
document.body.appendChild(gooRunner.renderer.domElement);

// Add a light entity
world.createEntity(new goo.PointLight(), [100, 100, 100]).addToWorld();

// Add a camera entity
world.createEntity(new goo.Camera(), new goo.OrbitCamControlScript({spherical: [5,0,0]})).addToWorld();

// Add a box entity with a rotation script
world.createEntity(new goo.Box(), goo.Material.createMaterial(goo.ShaderLib.simpleLit), function update(entity) {
    entity.setRotation(world.time, world.time, 0);
}).addToWorld();
```

## Documentation

* [API Reference](http://code.gooengine.com/latest/docs/)
* [Learn pages](http://learn.goocreate.com/)
* [Forum](http://forum.goocreate.com/)

## Releases

* [Goo Engine Releases](http://code.gooengine.com/)

## Goo Create Platform

[Goo Create](http://goocreate.com/) is a complete 3D authoring platform built on top of the Goo Engine.

## How to build

    npm install
    npm install -g grunt-cli
    grunt minify

## Unit testing

* Run `grunt unittest` to run all tests using Karma
* Run `npm test` to test the parts of the engine that are supported in Node.js

## Visual tests

Start a web server, e.g. using:

    npm install st -g
    st --port 8000

And then open:

* Visual tests: [http://localhost:8000/visual-test/](http://localhost:8000/visual-test/)

## Code style checks

To make sure that no incorrectly styled code gets committed, install the pre-commit hook:

    grunt init-git

This makes Git check whether all added and modified files pass the style check before allowing a commit.

## Documentation

`grunt jsdoc` - outputs to `out-doc`

GooJS uses a custom documentation compiler, *modoc*; see `tools/modoc/README.md` for more details.

## Building details

* Minified and mangled: `grunt minify`
* Minified: `grunt minify-no-mangle`
* Concatenated: `grunt minify-dev`

## License

The Goo Engine is released under the [MIT](http://opensource.org/licenses/MIT) license.
