Build Tools
===========

Headless tests on Jenkins
-------------------------
To run the headless tests on Jenkins, run the following script:

    ./tools/jenkins-tests.sh

lcov_cobertura.py
------------------
Coverts code coverage report files in lcov format to Cobertura's XML. (http://eriwen.github.com/lcov-to-cobertura-xml/)

Usage:

    python lcov_cobertura.py lcov.info -o cobertura.xml
