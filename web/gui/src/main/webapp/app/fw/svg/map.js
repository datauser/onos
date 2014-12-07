/*
 * Copyright 2015 Open Networking Laboratory
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 ONOS GUI -- SVG -- Map Service

 @author Simon Hunt
 */

/*
    The Map Service provides a simple API for loading geographical maps into
    an SVG layer. For example, as a background to the Topology View.

    e.g.  var ok = MapService.loadMapInto(svgLayer, '*continental-us');

    The Map Service makes use of the GeoDataService to load the required data
    from the server.
*/

(function () {
    'use strict';

    // injected references
    var $log, $http, fs;

    // internal state
    var mapCache = d3.map(),
        bundledUrlPrefix = '../data/map/';

    function getUrl(id) {
        if (id[0] === '*') {
            return bundledUrlPrefix + id.slice(1) + '.json';
        }
        return id + '.json';
    }

    angular.module('onosSvg')
        .factory('MapService', ['$log', '$http', 'FnService',
        function (_$log_, _$http_, _fs_) {
            $log = _$log_;
            $http = _$http_;
            fs = _fs_;


            function fetchGeoMap(id) {
                if (!fs.isS(id)) {
                    return null;
                }
                var url = getUrl(id),
                    promise = mapCache.get(id);

                if (!promise) {
                    // need to fetch the data, build the object,
                    // cache it, and return it.
                    promise = $http.get(url);

                    promise.meta = {
                        id: id,
                        url: url,
                        wasCached: false
                    };

                    promise.then(function (response) {
                            // success
                            promise.mapdata = response.data;
                        }, function (response) {
                            // error
                            $log.warn('Failed to retrieve map data: ' + url,
                                response.status, response.data);
                        });

                    mapCache.set(id, promise);

                } else {
                    promise.meta.wasCached = true;
                }

                return promise;
            }

            var geoMapProj;

            function setProjForView(path, topoData) {
                var dim = 1000;

                // start with unit scale, no translation..
                geoMapProj.scale(1).translate([0, 0]);

                // figure out dimensions of map data..
                var b = path.bounds(topoData),
                    x1 = b[0][0],
                    y1 = b[0][1],
                    x2 = b[1][0],
                    y2 = b[1][1],
                    dx = x2 - x1,
                    dy = y2 - y1,
                    x = (x1 + x2) / 2,
                    y = (y1 + y2) / 2;

                // size map to 95% of minimum dimension to fill space..
                var s = .95 / Math.min(dx / dim, dy / dim);
                var t = [dim / 2 - s * x, dim / 2 - s * y];

                // set new scale, translation on the projection..
                geoMapProj.scale(s).translate(t);
            }


            function loadMapInto(mapLayer, id) {
                var mapObject = fetchGeoMap(id);
                if (!mapObject) {
                    $log.warn('Failed to load map: ' + id);
                    return null;
                }

                var mapdata = mapObject.mapdata,
                    topoData, path;

                mapObject.then(function () {
                    // extracts the topojson data into geocoordinate-based geometry
                    topoData = topojson.feature(mapdata, mapdata.objects.states);

                    // see: http://bl.ocks.org/mbostock/4707858
                    geoMapProj = d3.geo.mercator();
                    path = d3.geo.path().projection(geoMapProj);

                    setProjForView(path, topoData);

                    mapLayer.selectAll('path')
                        .data(topoData.features)
                        .enter()
                        .append('path')
                        .attr('d', path);
                });
                // TODO: review whether we should just return true (not the map object)
                return mapObject;
            }

            return {
                loadMapInto: loadMapInto
            };
        }]);

}());