# Goo Engine

Goo Engine is an open-source 3D engine using HTML5 and WebGL for rendering.

## Project examples
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
[See more showcases](http://goocreate.com/)

## How to build

    npm install
    npm install -g grunt-cli
    grunt minify

## Documentation

* [Learn pages](http://goocreate.com/learn/?_ga=1.198797160.658665154.1444903216)
* [API Reference](http://code.gooengine.com/latest/docs/)
* [Support forum](https://answers.goocreate.com/index.html)
* [Hello world codepen](http://codepen.io/rherlitz/pen/yKruG)

## Releases

* [Goo Engine Releases](http://code.gooengine.com/)

## Goo Create Platform

[Goo Create](http://goocreate.com/) is a complete 3D authoring platform built on top of the Goo Engine.

## How to run unit tests and visual tests

Start a web server, e.g. using:

    npm install st -g
    st --port 8000

And then open:
* Unit tests: http://localhost:8000/test/test.html
* Visual tests: http://localhost:8000/visual-test/

## Style checks

To make sure that no incorrectly styled content appears, install the pre-commit hook:

    grunt init-git

This makes Git check whether all added and modified files pass the style check before allowing a commit.

## JS Doc

`grunt jsdoc` - outputs to `out-doc`

GooJS uses a custom documentation compiler, *modoc*; see `tools/modoc/README.md` for more details.

## Building details

+ Minified and mangled: `grunt minify`
+ Minified: `grunt minify-no-mangle`
+ Concatenated: `grunt minify-dev`

## License

The Goo Engine is released under the [MIT](http://opensource.org/licenses/MIT) license.
