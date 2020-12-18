# geo-data-exchange
[![Build Status](https://travis-ci.org/alexcojocaru/geo-data-exchange.png?branch=master)](https://travis-ci.org/alexcojocaru/geo-data-exchange)
Transform a GPX or Leaflet track to GeoJSON

A Javascript UMD module to transform a GPX track or a Leaflet track
(as an array of [LatLng](https://leafletjs.com/reference-1.7.1.html#latlng) points)
to a GeoJSON feature collection.
The given points are grouped into features based on the elevation
grade change between subsequent points in the track. Each feature is of type `LineString`
and has an `attributeType` property set to its elevation grade level.
The FeatureCollection element itself has a `records` property set to the feature count,
as well as a `summary` property set to `gradient`. See the example below for details.

The elevation grade levels are defined
[here](https://github.com/alexcojocaru/geo-data-exchange/blob/master/src/index.js#L45-L56).

Since the elevation coordinate on geo points is usually not very accurate,
the elevation is normalized before grouping;
the normalization process allows a certain degree of configuration via options.
After grouping, the elevation interpolation is applied, if enabled via options:
each points which lacks the elevation coordinate
could have its elevation set using a process which looks at the elevation
of its closest neighbours with elevation in the track and tries to estimate the elevation,
considering a constant gradient between these points - this is not an accurate technique,
and its results could be very far from reality.

See below for an example of how such feature collection looks like.
More example of such feature collections can be found in the
[unit tests](https://github.com/alexcojocaru/geo-data-exchange/blob/master/test/index.test.js).

```
[{
    "features": [
        {
            "geometry": {
                "coordinates": [
                    [2.218, 1.108, 8],
                    [2.2185, 1.1085, 8],
                    [2.220, 1.110, 10]
                ],
                "type": "LineString"
            },
            "properties": {
                "attributeType": 0
            },
            "type": "Feature"
        },
        {
            "geometry": {
                "coordinates": [
                    [2.220, 1.110, 10],
                    [2.222, 1.112, 20]
                ],
                "type": "LineString"
            },
            "properties": {
                "attributeType": 1
            },
            "type": "Feature"
        }
    ],
    "properties": {
        "Creator": "github.com/alexcojocaru/geo-data-exchange",
        "records": 2,
        "summary": "gradient"
    },
    "type": "FeatureCollection"
}]
```

The initial goal of this project was to make possible the generation of feature collections, using
the elevation grade level as grouping criterion.
Here is an example of using such a feature collection to mark various grade levels on an elevation graph:

<img width="600" src="https://github.com/alexcojocaru/geo-data-exchange/raw/master/resources/heightgraph.svg" alt="heightgraph" />

*NB: GPX track to GeoJSON transformation is WIP.*

## Usage

The main function is `buildGeojsonFeatures(latLngs, options)`
(documentation [here](https://github.com/alexcojocaru/geo-data-exchange/blob/master/src/index.js#L41-L79)),
exposed externally as `exports.buildGeojsonFeatures`,
which takes an array of Leaflet LatLng `objects`, as well as an optional `options` object.

There is a set of default transformation options
(documentation [here](https://github.com/alexcojocaru/geo-data-exchange/blob/master/src/index.js#L10-L38)),
exposed externally as `exports.defaultOptions`,
which could be used as prototype for creating custom options to pass to transformation function.

There are more functions, not documented, exposed externally via the `internal` namespace,
mainly for visibility for unit testing;
since they are internal, they might change at any time, even between patch versions.

## Dependencies
*   **[Leaflet](https://leafletjs.com/)**: for the [LatLng](https://leafletjs.com/reference-1.7.1.html#latlng) type usage, for distance calculations, etc

## Build

The artifact is created in the *dist* directory.
The code is not minified; after minification with uglify-js, even with the mangle and compress options disabled,
the IIFE did not work as expected.


#### Build a patch version
```
$ npm run build-patch
```

#### Build a minor version
```
$ npm run build
```

