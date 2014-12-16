# /usr/bin/env python
#
# planconverterjs.py - convert FSX and FS9 flight plans to JSON
#
# -----------------------------------------------------------------------------
# 
# LICENSE
# --------
# 
# Copyright (c) 2012, Klas Björkqvist
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#
# 1. Redistributions of source code must retain the above copyright notice,
#    this list of conditions and the following disclaimer. 
# 2. Redistributions in binary form must reproduce the above copyright notice,
#    this list of conditions and the following disclaimer in the documentation
#    and/or other materials provided with the distribution. 
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" 
# AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE 
# IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
# ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
# LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
# CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
# SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
# INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN 
# CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
# ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
# POSSIBILITY OF SUCH DAMAGE.
#

import sys
import re
import xml.etree.ElementTree as ET;
import math
from geographiclib.geodesic import Geodesic

#
# Try to parse the file given by filename as an XML file.
# Return the parsed XML tree if successfull, None otherwise.
#
def get_xml_if_xml(filename):
    try:
        tree = ET.parse(filename);
        return tree;
    except ET.ParseError:
        return None;

#
# wpt_t is a waypoint
#
class wpt_t:
    def __init__(self):
        self.icao = 'ZZZZ';
        self.type = 'ZZZZ';
        self.latitude = 0;
        self.longitude = 0;
 
    #
    # Return a string describing this waypoint in JSON format
    #
    def to_json(self,prev=None):
        json  = '{\n';
        json += '"icao" : "%s",\n' % self.icao;
        json += '"type" : "%s",\n' % self.type;
        json += '"latitude" : "%f",\n' % self.latitude;
        json += '"longitude" : "%f",\n' % self.longitude;
        json += '"distance" : "%.1f",\n' % (0. if prev is None else distance(prev,self));
        json += '"heading" : "%d"\n' % (0 if prev is None else heading(prev,self));
        json += '}';
        return json;




def distance(a, b):
    x = Geodesic.WGS84.Inverse(a.latitude, a.longitude, b.latitude, b.longitude)
    return x['s12'] / 1852.0 # m to NM

def heading(a, b):
    x = Geodesic.WGS84.Inverse(a.latitude, a.longitude, b.latitude, b.longitude)
    return (x['azi1'] + 360) % 360

#
# plan_t is a flight plan
#
class plan_t:
    def __init__(self):
        self.title = None;
        self.wpts = [];
    
    #
    # Append the waypoint wpt to the waypoint list
    #
    def append(self, wpt):
        self.wpts.append(wpt);

    #
    # Return a string describing this flight plan in JSON format
    #
    def to_json(self):
        json  = '{\n';
        json += '"title" : "%s",\n' % self.title;
        json += '"wpts" : [\n';
        for i in range(0,len(self.wpts)):
            json += "%s%s\n" % (self.wpts[i].to_json(None if i == 0 else self.wpts[i-1]),
                "," if i < len(self.wpts)-1 else "");
        json += ']\n';
        json += '}\n';
        return json;

#
# Parse a latitude or longitude string. Parses format like
#       N13* 12' 13.45'
# to a float. Positive float is North or East.
#
def parse_latlon(l_str):
    l = 0.0;
    mod = 1.0;
    match = re.search(
            r"(?P<dir>[NESW])"
            r"(?P<degs>\d+)."
            r"(?:\s+(?P<mins>\d+(?:[\.,]\d+)?)')"
            r"(?:\s+(?P<secs>\d+(?:[\.,]\d+)?)\")?"
            , l_str);
    if match:
        if match.group('dir') == "S" or match.group('dir') == "W":
            mod = -1.0;
        l = float(match.group('degs'));
        l += float(re.sub(',', '.', match.group('mins'))) / 60.0;
        if match.group('secs'):
            l += float(re.sub(',', '.', match.group('secs'))) / 3600.0;
    return mod * l;

#
# Parse the XML ElementTree tree as an FSX flight plan
#
def parse_fsx(tree):
    # find the flight plan element
    fp = tree.getroot().find("FlightPlan.FlightPlan");
    if fp == None:
        # no element was found
        return None;

    try:
        # create the flight plan
        plan = plan_t();
        plan.title = fp.find('Title').text
        wpts = fp.findall("./ATCWaypoint");
        for w in wpts:
            # get the data from the XML element
            wpt = wpt_t();
            wpt.icao = w.get('id', '-');
            wpt.type = w.findtext('ATCWaypointType', default='User');
            if wpt.type == 'Airport':
                # for airports we additionally look at the ICAO identifier
                # that is specified, though it will probably always be the
                # same as the element id.
                wpt.icao = w.findtext('./ICAO/ICAOIdent', default=wpt.icao);
            worldpos = w.findtext('WorldPosition', default='N0* 0\' 0.0",E0* 0\' 0.0",+0');
            match = re.match(r"(?P<lat>[NS].+),\s*(?P<lon>[EW].+),\s*[\+\-]", worldpos);

            if not match:
                continue;

            # parse the latitude and longitude strings
            wpt.latitude = parse_latlon(match.group('lat'));
            wpt.longitude = parse_latlon(match.group('lon'));

            plan.append(wpt);

        return plan;
    except:
        raise

#
# Parse the file given by filename as an FS9 flightplan file.
#
def parse_fs9(filename):
    f = open(filename, 'r');
    line = f.readline();
    
    # sanity check of the first line
    if not re.match(r"\[[Ff]lightplan\]", line):
        return None;
    
    # the plan we will return
    plan = plan_t();

    for line in f:
        # check the key=value of each line
        match = re.match(r"^([^=]+)=(.*)$", line);
        if match:
            key = match.group(1);
            value = match.group(2);

            if key == "title":
                # set title
                plan.title = value;
            elif key.startswith("waypoint"):
                # line is a waypoint
                # find match the fields against regexes

                # apparently SFP has a non-standard format?
                m = re.match(
                        r"^\s*(?P<icao>[A-Z]+)\s*,"
                        r"\s*(?P<type>[AVIN])\s*,"
                        r"\s*(?P<lat>[NS][^,]+),"
                        r"\s*(?P<lon>[EW][^,]+),"
                        r"\s*(?:[^,]+),\s*$",
                        value);
                if not m:
                    # doesn't match SFP format, use the other format we have
                    # examples for
                    m = re.match(
                            r"^(?:[^,]*),"
                            r"\s*(?P<icao>[A-Z]+)\s*,"
                            r"(?:[^,]*),"
                            r"(?:[^,]*),"
                            r"\s*(?P<type>[AVIN])\s*,"
                            r"\s*(?P<lat>[NS][^,]+),"
                            r"\s*(?P<lon>[EW][^,]+),"
                            r"(?:[^,]+),\s*$",
                            value);

                if m:
                    # the fields match, use the regex groups to get the data
                    wpt = wpt_t();
                    wpt.icao = m.group('icao');
                    wpt.type = {
                            "A" : "Airport",
                            "I" : "Intersection",
                            "V" : "VOR",
                            "N" : "NDB"
                            }.get(m.group('type'), "User");
                    wpt.latitude = parse_latlon(m.group('lat'));
                    wpt.longitude = parse_latlon(m.group('lon'));
                    plan.append(wpt);




    return plan;

if __name__ == "__main__":
    # check if all arguments are there
    if len(sys.argv) < 2:
        print("usage: python %s flight_plan_file" % sys.argv[0],
                file=sys.stderr);
        exit(1);

    # try to parse the file as an XML file
    filename = sys.argv[1];
    tree = get_xml_if_xml(filename)

    plan = None
    if tree != None:
        # file is xml
        plan = parse_fsx(tree);
    else:
        # file is not xml
        plan = parse_fs9(filename)

    # if it was not possible to parse the file, print an error and exit
    if plan == None:
        print("could not parse '%s'" % filename, file=sys.stderr);
        exit(1);

    # print the plan in JSON format
    print(plan.to_json());

    exit(0);

