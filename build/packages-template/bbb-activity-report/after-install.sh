#!/bin/bash -e

BIGBLUEBUTTON_USER=bigbluebutton

# set ownership of activity directory
chown -R $BIGBLUEBUTTON_USER:$BIGBLUEBUTTON_USER /var/bigbluebutton/activity-report/
#
# Restart nginx to take advantage of the updates to /etc/bigbluebutton/nginx
#
reloadService nginx

