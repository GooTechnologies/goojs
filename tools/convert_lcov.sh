#! /bin/bash

# Look for lcov.info in test-out/coverage and convert to cobertura.xml
# Place the last converted file into test-out/coverage/cobertura.xml

LCOV_COBERTURA="tools/lcov_cobertura.py"
COVERAGE_DIR='test-out/coverage'

find "${COVERAGE_DIR}" -name "lcov.info" |
while read f; do
    LCOV_DIR="$(dirname "$f")"
    echo "Converting to cobertura coverage report: $LCOV_DIR"
    python "${LCOV_COBERTURA}" "${LCOV_DIR}/lcov.info" -o "${LCOV_DIR}/cobertura.xml"
    cp "${LCOV_DIR}/cobertura.xml" "${COVERAGE_DIR}/cobertura.xml"
done
