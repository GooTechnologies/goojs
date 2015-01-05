#!/bin/sh

cd ../../
./E2E
OUT=$?
if [ $OUT -eq 0 ];then
   wget -O- http://192.168.168.150:8004/ok > /dev/null
else
   wget -O- http://192.168.168.150:8004/fail > /dev/null
fi