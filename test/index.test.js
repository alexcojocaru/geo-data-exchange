exchange = require("../src/index.js");
require("leaflet");

describe("geo-data-exchange", () => {

    test("build features - empty points list", () => {
        var latLngs = [];

        var result = exchange.buildGeojsonFeatures(latLngs);

        expect(result).toEqual(
            [{
                type: "FeatureCollection",
                features: [],
                properties: {
                    Creator: "github.com/alexcojocaru/geo-data-exchange",
                    records: 0,
                    summary: "gradient"
                }
            }]
        );
    });

    test("build features - no options provided", () => {
        var latLngs = [
            L.latLng(1.111, 2.221, 1),
            L.latLng(1.113, 2.223),
            // the altitude on the above will not get interpolated,
            // hence the point will count for distance calculation
            L.latLng(1.115, 2.225, 5),
            // > 200m so far; current gradient is 0; restart with the last
            L.latLng(1.117, 2.227, 70)
            // > 200m so far; new segment, for the current gradient is 5
        ];
        expect(exchange.buildGeojsonFeatures(latLngs))
                .toEqual([{
                    "features": [
                        {
                            "geometry": {
                                "coordinates": [
                                    [2.221, 1.111, 1],
                                    [2.223, 1.113, undefined],
                                    [2.225, 1.115, 5]
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
                                    [2.225, 1.115, 5],
                                    [2.227, 1.117, 70]
                                ],
                                "type": "LineString"
                            },
                            "properties": {
                                "attributeType": 5
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
                }]);
    });

    test("build features - all options provided", () => {
        var latLngs = [
            L.latLng(1.108, 2.218),
            // the altitude on this will get interpolated to 8
            L.latLng(1.110, 2.220, 8),
            // > 300m so far, but previous point has interpolated altitude; no new segment
            L.latLng(1.113, 2.223, 10),
            // > 300m so far; new segment; gradient = 0; restart with last point
            L.latLng(1.116, 2.226),
            // < 300m so far; the elevation will get interpolated to 760
            L.latLng(1.117, 2.227, 1010),
            // > 300m so far; new segment; gradient = 5; restart with last point
            L.latLng(1.127, 2.237, 1011)
            // > 300m so far; new segment; gradient = 0
        ];
        var options = {
            segments: 100,
            minSegmentDistance: 300,
            interpolateElevation: true
        };
        var result = exchange.buildGeojsonFeatures(latLngs, options);

        expect(result).toEqual([{
            "features": [
                {
                    "geometry": {
                        "coordinates": [
                            [2.218, 1.108, 8],
                            [2.220, 1.110, 8],
                            [2.223, 1.113, 10]
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
                            [2.223, 1.113, 10],
                            [2.226, 1.116, 760],
                            [2.227, 1.117, 1010]
                        ],
                        "type": "LineString"
                    },
                    "properties": {
                        "attributeType": 5
                    },
                    "type": "Feature"
                },
                {
                    "geometry": {
                        "coordinates": [
                            [2.227, 1.117, 1010],
                            [2.237, 1.127, 1011],
                        ],
                        "type": "LineString"
                    },
                    "properties": {
                        "attributeType": 0
                    },
                    "type": "Feature"
                }
            ],
            "properties": {
                "Creator": "github.com/alexcojocaru/geo-data-exchange",
                "records": 3,
                "summary": "gradient"
            },
            "type": "FeatureCollection"
        }]);
    });

    test("build features - some options provided", () => {
        var latLngs = [
            L.latLng(1.108, 2.218),
            // the altitude on this will get interpolated to 8
            L.latLng(1.110, 2.220, 8),
            // > 200m so far, but previous point has interpolated altitude; no new segment
            L.latLng(1.112, 2.222)
        ];
        var options = {
            interpolateElevation: true
        };
        var result = exchange.buildGeojsonFeatures(latLngs, options);

        expect(result).toEqual([{
            "features": [
                {
                    "geometry": {
                        "coordinates": [
                            [2.218, 1.108, 8],
                            [2.220, 1.110, 8],
                            [2.222, 1.112, 8]
                        ],
                        "type": "LineString"
                    },
                    "properties": {
                        "attributeType": 0
                    },
                    "type": "Feature"
                }
            ],
            "properties": {
                "Creator": "github.com/alexcojocaru/geo-data-exchange",
                "records": 1,
                "summary": "gradient"
            },
            "type": "FeatureCollection"
        }]);
    });

    test("build features - enforce minSegmentDistance", () => {
        var latLngs = [
            L.latLng(1.108, 2.218, 8),
            L.latLng(1.1085, 2.2185, 8),
            // 10m apart (> 10m, but < 50 min enforced), no new segment
            L.latLng(1.110, 2.220, 10),
            // > 50m so far, new segment; gradient = 0
            L.latLng(1.112, 2.222, 20)
            // > 50m so far, new segment; gradient = 1
        ];
        var options = {
            minSegmentDistance: 10
        };
        var result = exchange.buildGeojsonFeatures(latLngs, options);

        expect(result).toEqual([{
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
        }]);
    });

    test("build features - union segments with same gradient", () => {
        var latLngs = [
            L.latLng(1.108, 2.218, 8),
            L.latLng(1.110, 2.220, 9),
            // > 200m so far, new segment; gradient = 0
            L.latLng(1.112, 2.222, 12),
            // > 200m so far, new segment; gradient = 0
            L.latLng(1.114, 2.224, 20),
            // > 200m so far, new segment; gradient = 1
            L.latLng(1.117, 2.227, 22)
            // > 200m so far, new segment; gradient = 0
        ];
        var result = exchange.buildGeojsonFeatures(latLngs);

        expect(result).toEqual([{
            "features": [
                {
                    "geometry": {
                        "coordinates": [
                            [2.218, 1.108, 8],
                            [2.220, 1.110, 9],
                            [2.222, 1.112, 12]
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
                            [2.222, 1.112, 12],
                            [2.224, 1.114, 20]
                        ],
                        "type": "LineString"
                    },
                    "properties": {
                        "attributeType": 1
                    },
                    "type": "Feature"
                },
                {
                    "geometry": {
                        "coordinates": [
                            [2.224, 1.114, 20],
                            [2.227, 1.117, 22]
                        ],
                        "type": "LineString"
                    },
                    "properties": {
                        "attributeType": 0
                    },
                    "type": "Feature"
                }
            ],
            "properties": {
                "Creator": "github.com/alexcojocaru/geo-data-exchange",
                "records": 3,
                "summary": "gradient"
            },
            "type": "FeatureCollection"
        }]);
    });

    //
    // Partition by min distance
    //

    test("partition by min distance - no points", () => {
        expect(exchange.internal._partitionByMinDistance([], 100)).toEqual([]);
    });

    test("partition by min distance - less than min distance, all points without altitude", () => {
        var latLngs = [
            L.latLng(1.11111, 2.22221),
            L.latLng(1.11112, 2.22222),
            L.latLng(1.11113, 2.22223),
            L.latLng(1.11114, 2.22224)
        ];
        // the points are about 3m apart
        expect(exchange.internal._partitionByMinDistance(latLngs, 100))
                .toEqual([
                    [
                        L.latLng(1.11111, 2.22221),
                        L.latLng(1.11112, 2.22222),
                        L.latLng(1.11113, 2.22223),
                        L.latLng(1.11114, 2.22224)
                    ]
                ]);
    });

    test("partition by min distance - more than min distance, all points without altitude", () => {
        var latLngs = [
            L.latLng(1.111, 2.221),
            L.latLng(1.112, 2.222),
            L.latLng(1.113, 2.223),
            L.latLng(1.114, 2.224),
            L.latLng(1.115, 2.225)
        ];
        // the points are about 630m apart
        expect(exchange.internal._partitionByMinDistance(latLngs, 200))
                .toEqual([
                    [
                        L.latLng(1.111, 2.221),
                        L.latLng(1.112, 2.222),
                        L.latLng(1.113, 2.223),
                        L.latLng(1.114, 2.224),
                        L.latLng(1.115, 2.225)
                    ]
                ]);
    });

    test("partition by min distance - less than min distance, start points without altitude", () => {
        var latLngs = [
            L.latLng(1.1111, 2.2221),
            L.latLng(1.1112, 2.2222, 10),
            L.latLng(1.1113, 2.2223, 11),
            L.latLng(1.1114, 2.2224, 12)
        ];
        // the points are about 30m apart
        expect(exchange.internal._partitionByMinDistance(latLngs, 100))
                .toEqual([
                    [
                        L.latLng(1.1111, 2.2221),
                        L.latLng(1.1112, 2.2222, 10),
                        L.latLng(1.1113, 2.2223, 11),
                        L.latLng(1.1114, 2.2224, 12)
                    ]
                ]);
    });

    test("partition by min distance - less than min distance, end points without altitude", () => {
        var latLngs = [
            L.latLng(1.1111, 2.2221, 9),
            L.latLng(1.1112, 2.2222, 10),
            L.latLng(1.1113, 2.2223, 11),
            L.latLng(1.1114, 2.2224)
        ];
        // the points are about 30m apart
        expect(exchange.internal._partitionByMinDistance(latLngs, 100))
                .toEqual([
                    [
                        L.latLng(1.1111, 2.2221, 9),
                        L.latLng(1.1112, 2.2222, 10),
                        L.latLng(1.1113, 2.2223, 11),
                        L.latLng(1.1114, 2.2224)
                    ]
                ]);
    });

    test("partition by min distance - less than min distance, some points without altitude", () => {
        var latLngs = [
            L.latLng(1.1111, 2.2221, 9),
            L.latLng(1.1112, 2.2222),
            L.latLng(1.1113, 2.2223),
            L.latLng(1.1114, 2.2224, 12),
            L.latLng(1.1115, 2.2225, 13)
        ];
        // the points are about 30m apart
        expect(exchange.internal._partitionByMinDistance(latLngs, 100))
                .toEqual([
                    [
                        L.latLng(1.1111, 2.2221, 9),
                        L.latLng(1.1112, 2.2222),
                        L.latLng(1.1113, 2.2223),
                        L.latLng(1.1114, 2.2224, 12),
                        L.latLng(1.1115, 2.2225, 13)
                    ]
                ]);
    });

    test("partition by min distance - less than min distance, all points with altitude", () => {
        var latLngs = [
            L.latLng(1.1111, 2.2221, 9),
            L.latLng(1.1112, 2.2222, 10),
            L.latLng(1.1113, 2.2223, 11),
            L.latLng(1.1114, 2.2224, 12)
        ];
        // the points are about 30m apart
        expect(exchange.internal._partitionByMinDistance(latLngs, 100))
                .toEqual([
                    [
                        L.latLng(1.1111, 2.2221, 9),
                        L.latLng(1.1112, 2.2222, 10),
                        L.latLng(1.1113, 2.2223, 11),
                        L.latLng(1.1114, 2.2224, 12)
                    ]
                ]);
    });

    test("partition by min distance - more than min distance, start points without altitude", () => {
        var latLngs = [
            L.latLng(1.111, 2.221),
            L.latLng(1.112, 2.222),
            L.latLng(1.113, 2.223, 13),
            L.latLng(1.114, 2.224, 14),
            L.latLng(1.115, 2.225, 15),
            // distance so far is > 200m; reset and restart with last
            L.latLng(1.116, 2.226, 16),
            L.latLng(1.117, 2.227, 17),
            L.latLng(1.118, 2.228, 18)
            // distance so far is > 200; reset
        ];
        expect(exchange.internal._partitionByMinDistance(latLngs, 200))
                .toEqual([
                    [
                        L.latLng(1.111, 2.221),
                        L.latLng(1.112, 2.222),
                        L.latLng(1.113, 2.223, 13),
                        L.latLng(1.114, 2.224, 14),
                        L.latLng(1.115, 2.225, 15)
                    ],
                    [
                        L.latLng(1.115, 2.225, 15),
                        L.latLng(1.116, 2.226, 16),
                        L.latLng(1.117, 2.227, 17),
                        L.latLng(1.118, 2.228, 18)
                    ]
                ]);
    });

    test("partition by min distance - more than min distance, too many start points without altitude", () => {
        var latLngs = [
            L.latLng(1.111, 2.221),
            L.latLng(1.112, 2.222),
            L.latLng(1.113, 2.223),
            L.latLng(1.114, 2.224),
            L.latLng(1.115, 2.225, 15),
            L.latLng(1.116, 2.226, 16),
            L.latLng(1.117, 2.227, 17),
            L.latLng(1.118, 2.228, 18)
        ];
        // distance is much more than 500m, but < 500m between points with altitude
        expect(exchange.internal._partitionByMinDistance(latLngs, 500))
                .toEqual([
                    [
                        L.latLng(1.111, 2.221),
                        L.latLng(1.112, 2.222),
                        L.latLng(1.113, 2.223),
                        L.latLng(1.114, 2.224),
                        L.latLng(1.115, 2.225, 15),
                        L.latLng(1.116, 2.226, 16),
                        L.latLng(1.117, 2.227, 17),
                        L.latLng(1.118, 2.228, 18)
                    ]
                ]);
    });

    test("partition by min distance - more than min distance, end points without altitude", () => {
        var latLngs = [
            L.latLng(1.111, 2.221, 11),
            L.latLng(1.112, 2.222, 12),
            L.latLng(1.113, 2.223, 13),
            // distance so far is > 200m; reset and restart with last
            L.latLng(1.114, 2.224, 14),
            L.latLng(1.115, 2.225, 15),
            // distance so far is > 200m; reset
            L.latLng(1.116, 2.226),
            L.latLng(1.117, 2.227)
            // last 2 points will get appended to the last segment
        ];
        expect(exchange.internal._partitionByMinDistance(latLngs, 200))
                .toEqual([
                    [
                        L.latLng(1.111, 2.221, 11),
                        L.latLng(1.112, 2.222, 12),
                        L.latLng(1.113, 2.223, 13)
                    ],
                    [
                        L.latLng(1.113, 2.223, 13),
                        L.latLng(1.114, 2.224, 14),
                        L.latLng(1.115, 2.225, 15),
                        L.latLng(1.116, 2.226),
                        L.latLng(1.117, 2.227)
                    ]
                ]);
    });

    test("partition by min distance - more than min distance, too many end points without altitude", () => {
        var latLngs = [
            L.latLng(1.111, 2.221, 11),
            L.latLng(1.112, 2.222, 12),
            L.latLng(1.113, 2.223, 13),
            L.latLng(1.114, 2.224, 14),
            L.latLng(1.115, 2.225),
            L.latLng(1.116, 2.226),
            L.latLng(1.117, 2.227)
        ];
        // distance is much more than 500m, but < 500m between points with altitude
        expect(exchange.internal._partitionByMinDistance(latLngs, 500))
                .toEqual([
                    [
                        L.latLng(1.111, 2.221, 11),
                        L.latLng(1.112, 2.222, 12),
                        L.latLng(1.113, 2.223, 13),
                        L.latLng(1.114, 2.224, 14),
                        L.latLng(1.115, 2.225),
                        L.latLng(1.116, 2.226),
                        L.latLng(1.117, 2.227)
                    ]
                ]);
    });

    test("partition by min distance - more than min distance, some points without altitude", () => {
        var latLngs = [
            L.latLng(1.111, 2.221, 11),
            L.latLng(1.112, 2.222, 12),
            // < 200m so far
            L.latLng(1.113, 2.223),
            // > 200m so far, but still < 200m between points with altitude
            L.latLng(1.114, 2.224, 14),
            // > 200m, all good; reset and restart with last
            L.latLng(1.115, 2.225),
            // < 200m so far
            L.latLng(1.116, 2.226, 16)
            // > 200m so far; reset and restart with last
        ];
        expect(exchange.internal._partitionByMinDistance(latLngs, 200))
                .toEqual([
                    [
                        L.latLng(1.111, 2.221, 11),
                        L.latLng(1.112, 2.222, 12),
                        L.latLng(1.113, 2.223),
                        L.latLng(1.114, 2.224, 14)
                    ],
                    [
                        L.latLng(1.114, 2.224, 14),
                        L.latLng(1.115, 2.225),
                        L.latLng(1.116, 2.226, 16)
                    ]
                ]);
    });

    test("partition by min distance - more than min distance, all points with altitude, exact fit", () => {
        var latLngs = [
            L.latLng(1.111, 2.221, 11),
            L.latLng(1.112, 2.222, 12),
            // < 200m so far
            L.latLng(1.113, 2.223, 13),
            // > 200m so far; reset and restart with the last
            L.latLng(1.114, 2.224, 14),
            // < 200m
            L.latLng(1.115, 2.225, 15)
            // > 200m; reset
        ];
        expect(exchange.internal._partitionByMinDistance(latLngs, 200))
                .toEqual([
                    [
                        L.latLng(1.111, 2.221, 11),
                        L.latLng(1.112, 2.222, 12),
                        L.latLng(1.113, 2.223, 13)
                    ],
                    [
                        L.latLng(1.113, 2.223, 13),
                        L.latLng(1.114, 2.224, 14),
                        L.latLng(1.115, 2.225, 15)
                    ]
                ]);
    });

    test("partition by min distance - more than min distance, all points with altitude, extra trailing points", () => {
        var latLngs = [
            L.latLng(1.111, 2.221, 11),
            L.latLng(1.112, 2.222, 12),
            // < 200m so far
            L.latLng(1.113, 2.223, 13),
            // > 200m so far; reset and restart with last
            L.latLng(1.114, 2.224, 14),
            // < 200m
            L.latLng(1.115, 2.225, 15),
            // > 200m; reset and restart with last
            L.latLng(1.116, 2.226, 16)
            // < 200m; since it's last point, append it to last segment
        ];
        expect(exchange.internal._partitionByMinDistance(latLngs, 200))
                .toEqual([
                    [
                        L.latLng(1.111, 2.221, 11),
                        L.latLng(1.112, 2.222, 12),
                        L.latLng(1.113, 2.223, 13)
                    ],
                    [
                        L.latLng(1.113, 2.223, 13),
                        L.latLng(1.114, 2.224, 14),
                        L.latLng(1.115, 2.225, 15),
                        L.latLng(1.116, 2.226, 16)
                    ]
                ]);
    });

    //
    // Calculate distance
    //

    test("calculate distance - not enough points", () => {
        expect(exchange.internal._calculateDistance([])).toEqual(0);
        expect(exchange.internal._calculateDistance([ L.latLng(1, 1) ])).toEqual(0);
    });

    test("calculate distance - same point", () => {
        var latLngs = [
            L.latLng(2, 2),
            L.latLng(2, 2)
        ];
        expect(exchange.internal._calculateDistance(latLngs)).toEqual(0);
    });

    test("calculate distance", () => {
        var latLngs = [
            L.latLng(2.001, 2.101),
            L.latLng(2.001, 2.111),
            L.latLng(2.001, 2.111), // same point as before
            L.latLng(2.001, 2.101), // going back to initial point
            L.latLng(2.002, 2.121),
            L.latLng(2.003, 2.131)
        ];
        var expectedDistance = "5564.684";

        expect(exchange.internal._calculateDistance(latLngs).toFixed(3))
                .toEqual(expectedDistance);

        // reverse the array and check the result, should be the same
        expect(exchange.internal._calculateDistance(latLngs.reverse()).toFixed(3))
                .toEqual(expectedDistance);
    });

    test("calculate gradient - not enough points", () => {
        expect(exchange.internal._calculateGradient([])).toEqual(0);
        expect(exchange.internal._calculateGradient([ L.latLng(1, 1, 1) ])).toEqual(0);
    });

    test("calculate gradient - not enough points with altitude", () => {
        var latLngs;

        latLngs = [
            L.latLng(1, 1),
            L.latLng(2, 2),
            L.latLng(3, 3)
        ];
        expect(exchange.internal._calculateGradient(latLngs)).toEqual(0);

        latLngs = [
            L.latLng(1, 1),
            L.latLng(2, 2, 2)
        ];
        expect(exchange.internal._calculateGradient(latLngs)).toEqual(0);

        latLngs = [
            L.latLng(1, 1),
            L.latLng(2, 2),
            L.latLng(3, 3, 3)
        ];
        expect(exchange.internal._calculateGradient(latLngs)).toEqual(0);

        latLngs = [
            L.latLng(1, 1),
            L.latLng(2, 2, 2),
            L.latLng(3, 3)
        ];
        expect(exchange.internal._calculateGradient(latLngs)).toEqual(0);

        latLngs = [
            L.latLng(1, 1, 1),
            L.latLng(2, 2)
        ];
        expect(exchange.internal._calculateGradient(latLngs)).toEqual(0);
    });

    test("calculate gradient - all points with same altitude", () => {
        var latLngs = [
            L.latLng(2, 2, 20),
            L.latLng(2.002, 2.002, 20),
            L.latLng(3, 3, 20)
        ];
        expect(exchange.internal._calculateGradient(latLngs)).toEqual(0);
    });

    test("calculate gradient - points at start have no altitude", () => {
        var latLngs = [
            L.latLng(1, 1),
            L.latLng(2, 2, 2),
            L.latLng(2.001, 2.001, 200)
        ];
        expect(exchange.internal._calculateGradient(latLngs)).toEqual(5);
    });

    test("calculate gradient - points at end have no altitude", () => {
        var latLngs = [
            L.latLng(2, 2, 20),
            L.latLng(2.002, 2.002, 2),
            L.latLng(3, 3)
        ];
        expect(exchange.internal._calculateGradient(latLngs)).toEqual(-2);
    });

    test("calculate gradient - all points with altitutde", () => {
        var latLngs = [
            L.latLng(2, 2, 2),
            L.latLng(2.001, 2.002, 19),
            L.latLng(2.002, 2.002, 20)
        ];
        expect(exchange.internal._calculateGradient(latLngs)).toEqual(2);
    });

    test("calculate gradient - some points with altitutde", () => {
        var latLngs = [
            L.latLng(1, 1),
            L.latLng(2, 2, 2),
            L.latLng(2.001, 2.001),
            L.latLng(2.0015, 2.0015),
            L.latLng(2.002, 2.002, 20),
            L.latLng(3, 3)
        ];
        expect(exchange.internal._calculateGradient(latLngs)).toEqual(2);
    });

    //
    // Interpolate
    //

    test("interpolate single point without altitude", () => {
        var latLngs = [
            L.latLng(1, 1)
        ];

        expect(exchange.internal._interpolateElevation(latLngs, true))
                .toEqual([
                    L.latLng(1, 1, 0)
                ]);
    });

    test("interpolate multiple points without altitude", () => {
        var latLngs = [
            L.latLng(1, 1),
            L.latLng(2, 2)
        ];

        var result = exchange.internal._interpolateElevation(latLngs, true);

        expect(result).toEqual([
            L.latLng(1, 1, 0),
            L.latLng(2, 2, 0)
        ]);
    });

    test("interpolate single point without altitude at start", () => {
        var latLngs = [
            L.latLng(1, 1),
            L.latLng(2, 2, 2)
        ];

        var result = exchange.internal._interpolateElevation(latLngs, true);

        expect(result).toEqual([
            L.latLng(1, 1, 2),
            L.latLng(2, 2, 2)
        ]);
    });

    test("interpolate multiple points without altitude at start", () => {
        var latLngs = [
            L.latLng(1, 1),
            L.latLng(2, 2),
            L.latLng(3, 3, 3.3)
        ];

        var result = exchange.internal._interpolateElevation(latLngs, true);

        expect(result).toEqual([
            L.latLng(1, 1, 3.3),
            L.latLng(2, 2, 3.3),
            L.latLng(3, 3, 3.3)
        ]);
    });

    test("interpolate multiple points without altitude in middle", () => {
        var latLngs = [
            L.latLng(1, 1, 1),
            L.latLng(2, 2),
            L.latLng(3, 3),
            L.latLng(4, 4, 4)
        ];

        var result = exchange.internal._interpolateElevation(latLngs, true);

        expect(result).toEqual([
            L.latLng(1, 1, 1),
            L.latLng(2, 2, 2),
            L.latLng(3, 3, 3),
            L.latLng(4, 4, 4)
        ]);
    });

    test("interpolate single point without altitude at end", () => {
        var latLngs = [
            L.latLng(1, 1, 1),
            L.latLng(2, 2)
        ];

        var result = exchange.internal._interpolateElevation(latLngs, true);

        expect(result).toEqual([
            L.latLng(1, 1, 1),
            L.latLng(2, 2, 1)
        ]);
    });

    test("interpolate multiple points without altitude at end", () => {
        var latLngs = [
            L.latLng(1, 1, 1),
            L.latLng(2, 2),
            L.latLng(3, 3)
        ];

        var result = exchange.internal._interpolateElevation(latLngs, true);

        expect(result).toEqual([
            L.latLng(1, 1, 1),
            L.latLng(2, 2, 1),
            L.latLng(3, 3, 1)
        ]);
    });

    test("interpolate multiple points without altitude at start, in between, at end", () => {
        var latLngs = [
            L.latLng(1, 1),
            L.latLng(2, 2),
            L.latLng(3, 3, 3),
            L.latLng(4, 4),
            L.latLng(5, 5, 5),
            L.latLng(6, 6),
            L.latLng(7, 7),
            L.latLng(8, 8, 8),
            L.latLng(9, 9, 9),
            L.latLng(10, 10)
        ];

        var result = exchange.internal._interpolateElevation(latLngs, true);

        expect(result).toEqual([
            L.latLng(1, 1, 3),
            L.latLng(2, 2, 3),
            L.latLng(3, 3, 3),
            L.latLng(4, 4, 4),
            L.latLng(5, 5, 5),
            L.latLng(6, 6, 6),
            L.latLng(7, 7, 7),
            L.latLng(8, 8, 8),
            L.latLng(9, 9, 9),
            L.latLng(10, 10, 9)
        ]);
    });

    test("interpolate when all points have altitude", () => {
        var latLngs = [
            L.latLng(1, 1, 1)
        ];
        expect(exchange.internal._interpolateElevation(latLngs, true))
               .toEqual([
                   L.latLng(1, 1, 1)
               ]);

        var latLngs = [
            L.latLng(1, 1, 1),
            L.latLng(2, 2, 2)
        ];
        expect(exchange.internal._interpolateElevation(latLngs, true))
               .toEqual([
                   L.latLng(1, 1, 1),
                   L.latLng(2, 2, 2)
               ]);

        var latLngs = [
            L.latLng(1, 1, 1),
            L.latLng(2, 2, 2),
            L.latLng(3, 3, 3)
        ];
        expect(exchange.internal._interpolateElevation(latLngs, true))
               .toEqual([
                   L.latLng(1, 1, 1),
                   L.latLng(2, 2, 2),
                   L.latLng(3, 3, 3)
               ]);
    });

    test("interpolate disabled", () => {
        var latLngs = [ L.latLng(1, 1) ];

        var result = exchange.internal._interpolateElevation(latLngs, false);

        expect(Object.is(result, latLngs)).toBe(true); // same instance
    });

    //
    // Map gradient
    //

    test("map gradient", () => {
        expect(exchange.internal._mapGradient(NaN)).toEqual(0);
        expect(exchange.internal._mapGradient(0)).toEqual(0);

        expect(exchange.internal._mapGradient(-100)).toEqual(-5);
        expect(exchange.internal._mapGradient(-16)).toEqual(-5);

        expect(exchange.internal._mapGradient(-15.5)).toEqual(-4);
        expect(exchange.internal._mapGradient(-12)).toEqual(-4);
        expect(exchange.internal._mapGradient(-10)).toEqual(-4);

        expect(exchange.internal._mapGradient(-9.5)).toEqual(-3);
        expect(exchange.internal._mapGradient(-7)).toEqual(-3);

        expect(exchange.internal._mapGradient(-6.5)).toEqual(-2);
        expect(exchange.internal._mapGradient(-4)).toEqual(-2);

        expect(exchange.internal._mapGradient(-1.1)).toEqual(-1);
        expect(exchange.internal._mapGradient(-1)).toEqual(-1);

        expect(exchange.internal._mapGradient(-0.9)).toEqual(0);
        expect(exchange.internal._mapGradient(0.9)).toEqual(0);

        expect(exchange.internal._mapGradient(1)).toEqual(1);
        expect(exchange.internal._mapGradient(3.9)).toEqual(1);

        expect(exchange.internal._mapGradient(4.1)).toEqual(2);
        expect(exchange.internal._mapGradient(6.9)).toEqual(2);

        expect(exchange.internal._mapGradient(7)).toEqual(3);
        expect(exchange.internal._mapGradient(9.9)).toEqual(3);

        expect(exchange.internal._mapGradient(10.1)).toEqual(4);
        expect(exchange.internal._mapGradient(15.9)).toEqual(4);

        expect(exchange.internal._mapGradient(16)).toEqual(5);
        expect(exchange.internal._mapGradient(100)).toEqual(5);
    });
});
