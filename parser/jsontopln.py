import json
# /usr/bin/env python
#
# jsontopln.py - convert JSON to FSX and FS9 flight plans
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
import math
import argparse
import io

class wpt_t:
    """wpt_t is a waypoint."""
    def __init__(self):
        self.icao = 'ZZZZ';
        self.type = 'ZZZZ';
        self.latitude = 0;
        self.longitude = 0;

class plan_t:
    """plan_t is a flight plan."""
    def __init__(self):
        self.title = None;
        self.wpts = [];
    
    def append(self, wpt):
        """Append the waypoint wpt to the waypoint list."""
        self.wpts.append(wpt);

def str_latlon(l,latorlon,fsx=True):
    """Pretty print the coordinate."""
    ret = "";
    if latorlon == 'lat':
        ret += 'N' if l >= 0.0 else 'S';
    else:
        ret += 'E' if l >= 0.0 else 'W';
    l = abs(l);
    ret += str(math.floor(l));
    l -= math.floor(l);
    ret += "° " if fsx else "* "
    # for fsx we should print minutes and seconds, for fs9 just minutes.
    if fsx:
        l *= 60;
        ret += str(math.floor(l));
        ret += "' "
        l -= math.floor(l);
        l *= 60;
        ret += "%.2f\"" % l;
    else:
        l *= 60;
        ret += "%.2f'" % l;
    return ret;

def parse_json(fp):
    """Parse a JSON file to a plan_t object."""
    jobj = json.load(fp);
    pln = plan_t();
    pln.title = jobj['title'];
    for w in jobj['wpts']:
        wpt = wpt_t();
        wpt.icao = w['icao'];
        wpt.type = w['type'];
        wpt.latitude = float(w['latitude']);
        wpt.longitude = float(w['longitude']);
        pln.append(wpt);
    return pln;

def print_fs9(pln):
    """Print the plan_t object in the FS9 file format."""
    print("[flightplan]")
    print("title=%s" % pln.title)
    dep_wpt = pln.wpts[0];
    print("departure_id=%s, %s, %s, +0000000.0" %
            (dep_wpt.icao,
             str_latlon(dep_wpt.latitude, 'lat', False),
             str_latlon(dep_wpt.longitude, 'lon', False)));
    print("departure_name=departure airport")
    dest_wpt = pln.wpts[-1];
    print("destination_id=%s, %s, %s, +0000000.0" %
            (dest_wpt.icao,
             str_latlon(dest_wpt.latitude, 'lat', False),
             str_latlon(dest_wpt.longitude, 'lon', False)));
    print("destination_name=destination airport")
    i = 0;
    for w in pln.wpts:
        print("waypoint.%d=%s, %s, %s, %s, +000000.0," %
                (i, w.icao, {
                    "Airport" : "A",
                    "Intersection" : "I",
                    "VOR" : "V",
                    "NDB" : "N"}.get(w.type, "I"),
                    str_latlon(w.latitude, 'lat', False),
                    str_latlon(w.longitude, 'lon', False)));
        i += 1;

def print_fsx(pln):
    """Print the plan_t object in the FSX file format."""
    print(
"""<?xml version="1.0" encoding="UTF-8"?>
<SimBase.Document>
<FlightPlan.FlightPlan>""");
    print("<Title>%s</Title>" % pln.title);
    print("<DepartureID>%s</DepartureID>" % pln.wpts[0].icao);
    print("<DepartureName>Departure Airport</DepartureName>")
    print("<DestinationID>%s</DestinationID>" % pln.wpts[-1].icao);
    print("<DestinationName>Destination Airport</DestinationName>")
    for w in pln.wpts:
        print("<ATCWaypoint id=\"%s\">" % w.icao);
        print("<ATCWaypointType>%s</ATCWaypointType>" % w.type);
        print("<WorldPosition>%s,%s,+000000.00</WorldPosition>" %
                (str_latlon(w.latitude, 'lat', True),
                    str_latlon(w.longitude, 'lon', True)));
        if w.type in ["Airport","VOR"]:
            print("<ICAO><ICAOIdent>%s</ICAOIdent></ICAO>" % w.icao);
        print("</ATCWaypoint>")
    print(
"""</FlightPlan.FlightPlan>
</SimBase.Document>""");


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
            description="Convert JSON to a FSX or FS9 .pln file.")

    parser.add_argument("-x", "--fsx", action='store_true', default=False,
            help="output an FSX flight plan (default)");
    parser.add_argument("-9", "--fs9", action='store_true', default=False,
            help="output an FS9 flight plan");
    parser.add_argument("file", action='store', default='-',
            type=str, nargs='?', help="the file to read, stdin if not present");

    args = parser.parse_args();

    if args.file == '-':
        f = sys.stdin;
    else:
        # Attempt to read the file
        try:
            f = io.open(args.file);
        except OSError as E:
            print("Unable to open file '%s': %s" % (args.file, str(E.args[1])),
                    file=sys.stderr);
            exit(1);

    # Attempt to read the file
    try:
        pln = parse_json(f);
    except Exception as E:
        print("Unable to read file '%s': %s" % (args.file, str(E)),
                file=sys.stderr);
        f.close();
        exit(1);

    # the file has been read, close it
    if args.file != '-':
        f.close();

    # print the output
    if args.fsx or not args.fs9:
        print_fsx(pln);
    else:
        print_fs9(pln);
