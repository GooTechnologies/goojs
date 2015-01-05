#!/bin/bash

#cron */5 * * * * ./cron-it.sh # you need proper permissions
while true
do
	./cron-it.sh
	sleep 10m
done