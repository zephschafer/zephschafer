/*!
 *  dc.leaflet 0.5.6
 *  http://dc-js.github.io/dc.leaflet.js/
 *  Copyright 2014-2015 Boyan Yurukov and the dc.leaflet Developers
 *  https://github.com/dc-js/dc.leaflet.js/blob/master/AUTHORS
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
(function() { function _dc_leaflet(dc, d3, L) {
'use strict';

var dc_leaflet = {
    version: '0.5.6'
};

dc_leaflet.leafletBase = function(Base) {
    var _chart = new Base();

    _chart.margins({left:0, top:0, right:0, bottom:0});

    var _map;
    var _reuseMap = false;

    var _mapOptions=false;
    var _defaultCenter=false;
    var _defaultZoom=false;

    var _popupMod = null;
    var _filterMod = null;

    var _cachedHandlers = {};

    var _createLeaflet = function(root) {
        // append sub-div if not there, to allow client to put stuff (reset link etc.)
        // in main div. might also use relative positioning here, for now assume
        // appending will put in right position
        var child_div = root.selectAll('div.dc-leaflet');
        child_div = child_div.data([0]).enter()
            .append('div').attr('class', 'dc-leaflet')
            .style('width', _chart.effectiveWidth() + "px")
            .style('height', _chart.effectiveHeight() + "px")
            .merge(child_div);
        return L.map(child_div.node(),_mapOptions);
    };

    var _tiles=function(map) {
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        }).addTo(map);
    };

    _chart.createLeaflet = function(_) {
        if(!arguments.length) {
            return _createLeaflet;
        }
        _createLeaflet = _;
        return _chart;
    };

    _chart._doRender = function() {
        if(! _chart.map()){
            _map = _createLeaflet(_chart.root());
            for(var ev in _cachedHandlers)
                _map.on(ev, _cachedHandlers[ev]);

            if (_defaultCenter && _defaultZoom) {
                _map.setView(_chart.toLocArray(_defaultCenter), _defaultZoom);
            }

            _chart.tiles()(_map);
            _chart._postRender();
        }
        else if (_chart.map() && _reuseMap)
            _chart._postRender();
        else
            console.warn("WARNING: Leaflet map already rendered.");

        return _chart._doRedraw();
    };

    _chart._doRedraw = function() {
        return _chart;
    };

    _chart._postRender = function() {
        return _chart;
    };

    _chart.mapOptions = function(_) {
        if (!arguments.length) {
            return _mapOptions;
        }
        _mapOptions = _;
        return _chart;
    };

    _chart.center = function(_) {
        if (!arguments.length) {
            return _defaultCenter;
        }
        _defaultCenter = _;
        return _chart;
    };

    _chart.zoom = function(_) {
        if (!arguments.length) {
            return _defaultZoom;
        }
        _defaultZoom = _;
        return _chart;
    };

    _chart.tiles = function(_) {
        if (!arguments.length) {
            return _tiles;
        }
        _tiles = _;
        return _chart;
    };

    _chart.map = function(_) {
        if (!arguments.length) {
            return _map;
        }
        _map = _;
        _reuseMap = true;
        return _chart;
    };

    _chart._isMac = navigator.platform.toUpperCase().includes('MAC');

    _chart._modAssignment = {
        shift: 'shiftKey',
        alt: 'altKey',
        ctrlCmd: _chart._isMac ? 'metaKey' : 'ctrlKey'
    };

    _chart.popupMod = function(_) {
        if (!arguments.length)
            return _popupMod;
        _popupMod = _;
        return _chart;
    };

    _chart.filterMod = function(_) {
        if (!arguments.length)
            return _filterMod;
        _filterMod = _;
        return _chart;
    };

    _chart.modKeyMatches = function(e, modKey) {
        if (modKey)
            return e.originalEvent[_chart._modAssignment[modKey]];
        else
            return !e.originalEvent.shiftKey && !e.originalEvent.altKey &&
                !e.originalEvent.ctrlKey && !e.originalEvent.metaKey;
    };

    _chart.bindPopupWithMod = function(layer, value) {
        layer.bindPopup(value);
        layer.off('click', layer._openPopup);
        layer.on('click', function(e) {
            if (_chart.modKeyMatches(e, _chart.popupMod()))
                layer._openPopup(e);
        });
    };

    _chart.toLocArray = function(value) {
        if (typeof value === "string") {
            // expects '11.111,1.111'
            value = value.split(",");
        }
        // else expects [11.111,1.111]
        return value;
    };

    // combine Leaflet events into d3 & dc events
    const super_on = _chart.on;
    _chart.on = function(event, callback) {
        var leaflet_events = ['zoomend', 'moveend'];
        if(leaflet_events.indexOf(event) >= 0) {
            if(_map) {
                _map.on(event, callback);
            }
            else {
                _cachedHandlers[event] = callback;
            }
            return this;
        }
        else return super_on.call(this, event, callback);
    };

    return _chart;
};
//Legend code adapted from http://leafletjs.com/examples/choropleth.html
dc_leaflet.legend = function() {
    var _parent, _legend = {};
    var _leafletLegend = null;
    var _position = 'bottomleft';
    var _legendTitle = false;

    _legend.parent = function (parent) {
        if(!arguments.length)
            return _parent;
        _parent = parent;
        return this;
    };

    function _LegendClass() {
        return L.Control.extend({
            options: {position: _position},
            onAdd: function (map) {
                if (map.legend)
                    map.legend.setContent("");
                else
                    map.legend = this;
                this._div = L.DomUtil.create('div', 'info legend');
                map.on('moveend',this._update,this);
                this._update();
                return this._div;
            },
            setContent: function (content) {
                return this.getContainer().innerHTML = content;
            },
            _update: function () {
                if (!_parent.colorDomain)
                    console.warn('legend not supported for this dc.leaflet chart type, ignoring');
                else {
                    var minValue = _parent.colorDomain()[0],
                        maxValue = _parent.colorDomain()[1],
                        palette = _parent.colors().range(),
                        colorLength = _parent.colors().range().length,
                        delta = (maxValue - minValue)/colorLength,
                        i;

                    // define grades for legend colours
                    // based on equation in dc.js colorCalculator (before version based on colorMixin)
                    var grades = [];
                    grades[0] = Math.round(minValue);
                    for (i= 1; i < colorLength; i++) {
                        grades[i] = Math.round((0.5 + (i - 1)) * delta + minValue);
                    }

                    var div = L.DomUtil.create('div', 'info legend');
                    if (_legendTitle)
                        this._div.innerHTML = "<strong>" + _legendTitle + "</strong><br/>";
                    else
                        this._div.innerHTML = ""; //reset so that legend is not plotted multiple times
                    // loop through our density intervals and generate a label with a colored
                    // square for each interval
                    for (i = 0; i < grades.length; i++) {
                        this._div.innerHTML +=
                            '<i style="background:' + palette[i] + '"></i> ' +
                            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
                    }
                }
            }
        });
    }

    _legend.LegendClass = function(LegendClass) {
        if(!arguments.length)
            return _LegendClass;
        _LegendClass = LegendClass;
        return _legend;
    };

    _legend.legendTitle = function(_) {
        if(!arguments.length)
            return _legendTitle;
        _legendTitle = _;
        return _legend;
    };

    _legend.render = function () {
        // unfortunately the dc.js legend has no concept of redraw, it's always render
        if(!_leafletLegend) {
            // fetch the legend class creator, invoke it
            var Legend = _legend.LegendClass()();
            // and constuct that class
            _leafletLegend = new Legend();
            _leafletLegend.addTo(_parent.map());
        }

        return _legend.redraw();
    };

    _legend.redraw = function () {
        _leafletLegend._update();
        return _legend;
    };

    _legend.leafletLegend = function () {
        return _leafletLegend;
    };

    _legend.position = function (position) {
        if(!arguments.length) return _position;
        _position = position;
        return _legend;
    };

    return _legend;
};
dc_leaflet.bubbleChart = function (parent, chartGroup) {
    "use strict";

    /* ####################################
     * Private variables -- default values.
     * ####################################
     */
    var _chart = dc_leaflet.leafletBase(dc.ColorMixin(dc.MarginMixin));
    _chart.linearColors(['gray']);
    var _selectedColor = 'blue';
    var _unselectedColor = function(d) {
        return _chart.getColor(d);
    };
    var _renderPopup = true;
    var _layerGroup = false;
    var _location = function (d) {
        return _chart.keyAccessor()(d);
    };
    var _popup = function(d, feature) {
        return _chart.title()(d);
    };
    var _r = d3.scaleLinear().domain([0, 100]);
    var _brushOn = true;
    var _marker = function (d, map) {
        var loc = _chart.locationAccessor()(d);
        var locArray = _chart.toLocArray(loc);

        var latlng = L.latLng(+locArray[0], +locArray[1]);
        var circle = L.circleMarker(latlng);

        circle.setRadius(_chart.r()(_chart.valueAccessor()(d)));
        circle.on("mouseover", function (e) {
            if (_chart.renderPopup) this.openPopup();
        });
        circle.on("mouseout", function (e) {
            if (_chart.renderPopup) this.closePopup();
        });

        var key = _chart.keyAccessor()(d);
        var isSelected = (-1 !== _chart.filters().indexOf(key));

        circle.options.color = isSelected ? _chart.selectedColor() : _chart.unselectedColor()(d);

        return circle;
    };

    /**
     #### .r([bubbleRadiusScale])
     Get or set bubble radius scale. By default bubble chart uses ```d3.scaleLinear().domain([0, 100])``` as its r scale .

     **/
    _chart.r = function (_) {
        if (!arguments.length) return _r;
        _r = _;
        return _chart;
    };

    _chart.brushOn = function (_) {
        if (!arguments.length) {
            return _brushOn;
        }
        _brushOn = _;
        return _chart;
    };

    _chart.locationAccessor = function (_) {
        if (!arguments.length) {
            return _location;
        }
        _location = _;
        return _chart;
    };
    /**
     #### .selectedColor([color])
     Get or set the color of a selected (filter) bubble.
     */
    _chart.selectedColor = function (_) {
        if (!arguments.length) {
            return _selectedColor;
        }
        _selectedColor = _;
        return _chart;
    };

    /**
     #### .unselectedColor([color])
     Get or set the color of a bubble which is not currently in the filter.

     */
    _chart.unselectedColor = function (_) {
        if (!arguments.length) {
            return _unselectedColor;
        }
        _unselectedColor = _;
        return _chart;
    };

    _chart.popup = function(_) {
        if (!arguments.length) {
            return _popup;
        }
        _popup= _;
        return _chart;
    };

    _chart.layerGroup = function() {
        return _layerGroup;
    };

    _chart.renderPopup = function(_) {
        if (!arguments.length) {
            return _renderPopup;
        }
        _renderPopup = _;
        return _chart;
    };

    var createmarker = function (v, k) {
        var marker = _chart.marker()(v, _chart.map());
        marker.key = k;
        if (_chart.renderPopup()) {
            _chart.bindPopupWithMod(marker, _chart.popup()(v, marker));
        }
        if (_chart.brushOn()) {
            marker.on("click", selectFilter);
        }
        return marker;
    };

    _chart.marker = function (_) {
        if (!arguments.length) {
            return _marker;
        }
        _marker = _;
        return _chart;
    };

    /* Render and redraw overrides */
    _chart._postRender = function () {
        if (_chart.brushOn()) {

            _chart.map().on('click', function (e) {
                _chart.filter(null);
                _chart.redrawGroup();
            });
        }
        _chart.map().on('boxzoomend', boxzoomFilter, this);
        _layerGroup = new L.LayerGroup();
        _chart.map().addLayer(_layerGroup);
    };

    _chart._doRedraw = function () {
        var groups = _chart._computeOrderedGroups(_chart.data()).filter(function (d) {
            return _chart.valueAccessor()(d) !== 0;
        });
        _layerGroup.clearLayers();
        groups.forEach(function (v, i) {
            var key = _chart.keyAccessor()(v);
            var marker = null;

            marker = createmarker(v, key);
            _layerGroup.addLayer(marker);
        });
    };

    /* Callback functions */
    function boxzoomFilter(e) {
        var filters = [];

        _layerGroup.eachLayer(function (layer) {
            var latLng = layer.getLatLng();
            if (e.boxZoomBounds.contains(latLng)) {
                filters.push(layer.key);
            }
        });

        dc.events.trigger(function (e) {
            _chart.replaceFilter([filters]);
            _chart.redrawGroup();
        });
    }

    var selectFilter = function (e) {
        if (!e.target) {
            return;
        }
        var filter = e.target.key;
        L.DomEvent.stopPropagation(e);
        var filter = e.target.key;
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
            // If ctrl/cmd key modifier was pressed on click, toggle the target
            _chart.filter(filter);
        }
        else {
            // If ctrl key wasn't pressed, clear selection and add target
            _chart.replaceFilter([[filter]]);
        }
        _chart.redrawGroup();
    };


    return _chart.anchor(parent, chartGroup);
};
dc_leaflet.d3 = d3;
dc_leaflet.dc = dc;

return dc_leaflet;
}
    if (typeof define === 'function' && define.amd) {
        define(["dc", "d3", "leaflet", "leaflet.markercluster"], _dc_leaflet);
    } else if (typeof module == "object" && module.exports) {
        var _dc = require('dc');
        var _d3 = require('d3');
        var L = require('leaflet');
        var lmc = require('leaflet.markercluster');
        module.exports = _dc_leaflet(_dc, _d3, L);
    } else {
        const that = typeof self !== undefined ? self : this;
        that.dc_leaflet = _dc_leaflet(that.dc, that.d3, that.L);
    }
}
)();

//# sourceMappingURL=dc.leaflet.js.map
