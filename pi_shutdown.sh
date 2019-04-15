#!/bin/sh
#
# PoisonTap
#  by samy kamkar
#  http://samy.pl/poisontap
#  01/08/2016
#
# If you find this doesn't come up automatically as an ethernet device
# change idVendor/idProduct to 0x04b3/0x4010

#echo 0x1d6b > idVendor   # Linux Foundation
#echo 0x0104 > idProduct  # Multifunction Composite Gadget

# turn the LED on and keep it on...
echo 0 /sys/class/leds/led0/brightness
echo "stopping usb interface"
ifconfig usb0 down
echo "stopping server"
killall nodejs
killall dnsspoof
/etc/init.d/isc-dhcp-server stop
/sbin/sysctl -w net.ipv4.ip_forward=0
echo "brining up wireless interface"
ifconfig wlan0 up
/home/pi/upnet.sh


