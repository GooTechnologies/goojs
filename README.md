Goo Engine
=====

Goo Engine is an open-source blaha blaha

Project examples
--------------------
<p>
<a href="http://goocreate.com/showcase/case/mountains-of-mouthness/"><img src="http://goocreate.com/wp-content/uploads/2015/11/mountains.jpg"/></a>
<a href="http://goocreate.com/showcase/case/suissemania/"><img src="http://goocreate.com/wp-content/uploads/2015/11/suissemania.jpg"/></a>
<br>
<a href="http://goocreate.com/showcase/case/mountains-of-mouthness/"><img src="http://goocreate.com/wp-content/uploads/2015/11/mountains.jpg"/></a>
<a href="http://goocreate.com/showcase/case/suissemania/"><img src="http://goocreate.com/wp-content/uploads/2015/11/suissemania.jpg"/></a>
<br>
<a href="http://goocreate.com/showcase/case/mountains-of-mouthness/"><img src="http://goocreate.com/wp-content/uploads/2015/11/mountains.jpg"/></a>
<a href="http://goocreate.com/showcase/case/suissemania/"><img src="http://goocreate.com/wp-content/uploads/2015/11/suissemania.jpg"/></a>
<br>
</p>

How to build
-----

    npm install
    npm install -g grunt-cli
    grunt minify

How to unittest
--------------------

To run the tests using Jasmine's test runner in the browser, start a server, e.g. using:

    npm install st -g
    st --port 8000

And then open http://localhost:8000/test/test.html

Documentation
------------

[Learn pages](http://goocreate.com/learn/?_ga=1.198797160.658665154.1444903216)

[API Reference](http://code.gooengine.com/latest/docs/)

[Support forum](https://answers.goocreate.com/index.html)

Releases
------------

[Goo Engine Releases](http://code.gooengine.com/)

Goo Create Platform
------------

[Goo Create](http://goocreate.com/) is the blaha

Style checks
------------

To make sure that no incorrectly styled content appears, install the pre-commit hook:

    grunt init-git

This makes Git check whether all added and modified files pass the style check before allowing a commit.

JS Doc
------------

`grunt jsdoc` - outputs to `out-doc`

GooJS uses a custom documentation compiler, *modoc*; see `tools/modoc/README.md` for more details.

Building variants
------------

+ Minified and mangled: `grunt minify`
+ Minified: `grunt minify-no-mangle`
+ Concatenated: `grunt minify-dev`
