GooJS Examples
==============

This directory contains examples showing features of the Goo Javascript Engine and how they can be used.

Running
-------
Since many browsers do not allow loading images (read textures) when using the file:// protocol, it is best to serve the examples from a local webserver, such as SimpleHTTPServer (Python)

    python -m SimpleHTTPServer

or http-server (Node.js)

    npm install http-server
    node_modules/.bin/http-server -p 8000

and navigate to http://localhost:8000/examples. Start the servers from the root of the GooJS repository as the examples need access to resources and the goo js engine.
