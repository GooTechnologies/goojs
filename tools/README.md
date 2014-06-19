Build Tools
===========

Cycle detector
--------------

###Usage
    
    node cycleDetector.js [--cycles] [--dependencies <modulepath>] [--dependants <modulepath>]
    
####Options
    
`--cycles` Checks for cycles in the require graph

`--dependencies <modulepath>` Returns a list of dependencies for the provided module

`--dependants <modulepath>` Returns a list of modules that directly require the provided module