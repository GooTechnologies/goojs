rem call this from the root directory of GooJS like so: tools\generate_jsdoc.bat
del goojs-jsdoc /q
node_modules/jsdoc/jsdoc -r -p "src" -d goojs-jsdoc -t tools/jsdoc-template
