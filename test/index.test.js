exchange = require("../src/index.js");
require("leaflet");

describe("geo-data-exchange", () => {

    test("build geo json features - missing options", () => {
        expect(
            exchange.buildGeojsonFeatures([
                L.latLng(1, 11),
                L.latLng(2, 22, 222)
            ])
        ).toEqual([{
            "features": [
                {
                    "geometry": {
                        "coordinates": [
                            [11, 1, undefined],
                            [22, 2, 222]
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

    test("build geo json features - interpolate elevation", () => {
        expect(
            exchange.buildGeojsonFeatures(
                [
                    L.latLng(1, 11),
                    L.latLng(2, 22, 222),
                    L.latLng(2.1, 22.1, 2220),
                ],
                { interpolateElevation: true }
            )
        ).toEqual([{
            "features": [
                {
                    "geometry": {
                        "coordinates": [
                            [11, 1, 222],
                            [22, 2, 222]
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
                            [22, 2, 222],
                            [22.1, 2.1, 2220]
                        ],
                        "type": "LineString"
                    },
                    "properties": {
                        "attributeType": 13
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

    test("build geo json features - normalize gradient", () => {
        expect(
            exchange.buildGeojsonFeatures(
                [
                    L.latLng(1, 11, 111),
                    L.latLng(2, 22, 222),
                    L.latLng(2.001, 22.001, 333),
                    L.latLng(2.1, 22.1, 2220),
                    L.latLng(2.101, 22.101, 2220),
                ],
                { normalize: true }
            )
        ).toEqual([{
            "features": [
                {
                    "geometry": {
                        "coordinates": [
                            [11, 1, 111],
                            [22, 2, 222],
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
                            [22, 2, 222],
                            [22.001, 2.001, 333],
                            [22.1, 2.1, 2220],
                            [22.101, 2.101, 2220]
                        ],
                        "type": "LineString"
                    },
                    "properties": {
                        "attributeType": 13
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

    test("build features - empty points list", () => {
        expect(exchange.internal._buildFeatures([], false)).toEqual([]);
    });

    test("build features - one point list", () => {
        expect(
            exchange.internal._buildFeatures(
                [
                    L.latLng(1, 11)
                ],
                false
            )
        ).toEqual([
            {
                "geometry": {
                    "coordinates": [
                        [11, 1, undefined]
                    ],
                    "type": "LineString"
                },
                "properties": {
                    "attributeType": 0
                },
                "type": "Feature"
            }
        ]);
    });

    test("build features - one point list - interpolate", () => {
        expect(
            exchange.internal._buildFeatures(
                [
                    L.latLng(1, 11)
                ],
                true
            )
        ).toEqual([
            {
                "geometry": {
                    "coordinates": [
                        [11, 1, 0]
                    ],
                    "type": "LineString"
                },
                "properties": {
                    "attributeType": 0
                },
                "type": "Feature"
            }
        ]);
    });

    test("build features - all points without altitude", () => {
        expect(
            exchange.internal._buildFeatures(
                [
                    L.latLng(1, 11),
                    L.latLng(2, 22)
                ],
                false
            )
        ).toEqual([
            {
                "geometry": {
                    "coordinates": [
                        [11, 1, undefined],
                        [22, 2, undefined]
                    ],
                    "type": "LineString"
                },
                "properties": {
                    "attributeType": 0
                },
                "type": "Feature"
            }
        ]);
    });

    test("build features - single point with altitude", () => {
        expect(
            exchange.internal._buildFeatures(
                [
                    L.latLng(1, 11),
                    L.latLng(2, 22),
                    L.latLng(3, 33, 333)
                ],
                false
            )
        ).toEqual([
            {
                "geometry": {
                    "coordinates": [
                        [11, 1, undefined],
                        [22, 2, undefined],
                        [33, 3, 333]
                    ],
                    "type": "LineString"
                },
                "properties": {
                    "attributeType": 0
                },
                "type": "Feature"
            }
        ]);
    });

    test("build features - single point with altitude - interpolate", () => {
        expect(
            exchange.internal._buildFeatures(
                [
                    L.latLng(1, 11),
                    L.latLng(3, 33, 333)
                ],
                true
            )
        ).toEqual([
            {
                "geometry": {
                    "coordinates": [
                        [11, 1, 333],
                        [33, 3, 333]
                    ],
                    "type": "LineString"
                },
                "properties": {
                    "attributeType": 0
                },
                "type": "Feature"
            }
        ]);
    });

    test("build features - starting and ending points without altitude", () => {
        expect(
            exchange.internal._buildFeatures(
                [
                    L.latLng(1, 11),
                    L.latLng(2, 22, 222),
                    L.latLng(2.1, 22.1, 2220),
                    L.latLng(3, 33),
                ],
                false
            )
        ).toEqual([
            {
                "geometry": {
                    "coordinates": [
                        [11, 1, undefined],
                        [22, 2, 222]
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
                        [22, 2, 222],
                        [22.1, 2.1, 2220]
                    ],
                    "type": "LineString"
                },
                "properties": {
                    "attributeType": 13
                },
                "type": "Feature"
            },
            {
                "geometry": {
                    "coordinates": [
                        [22.1, 2.1, 2220],
                        [33, 3, undefined]
                    ],
                    "type": "LineString"
                },
                "properties": {
                    "attributeType": 0
                },
                "type": "Feature"
            }
        ]);
    });

    test("build features - starting and ending points without altitude - interpolate", () => {
        expect(
            exchange.internal._buildFeatures(
                [
                    L.latLng(1, 11),
                    L.latLng(2, 22, 222),
                    L.latLng(2.1, 22.1, 2220),
                    L.latLng(3, 33)
                ],
                true
            )
        ).toEqual([
            {
                "geometry": {
                    "coordinates": [
                        [11, 1, 222],
                        [22, 2, 222]
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
                        [22, 2, 222],
                        [22.1, 2.1, 2220]
                    ],
                    "type": "LineString"
                },
                "properties": {
                    "attributeType": 13
                },
                "type": "Feature"
            },
            {
                "geometry": {
                    "coordinates": [
                        [22.1, 2.1, 2220],
                        [33, 3, 2220]
                    ],
                    "type": "LineString"
                },
                "properties": {
                    "attributeType": 0
                },
                "type": "Feature"
            }
        ]);
    });

    test("build features - single gradient - no intermediate points without altitude", () => {
        expect(
            exchange.internal._buildFeatures(
                [
                    L.latLng(1, 11, 111),
                    L.latLng(1.01, 11.01, 211),
                    L.latLng(1.02, 11.02, 311)
                ],
                false
            )
        ).toEqual([
            {
                "geometry": {
                    "coordinates": [
                        [11, 1, 111],
                        [11.01, 1.01, 211],
                        [11.02, 1.02, 311]
                    ],
                    "type": "LineString"
                },
                "properties": {
                    "attributeType": 6
                },
                "type": "Feature"
            }
        ]);
    });

    test("build features - single gradient - intermediate points without altitude", () => {
        expect(
            exchange.internal._buildFeatures(
                [
                    L.latLng(1, 11, 111),
                    L.latLng(1.002, 11.002),
                    L.latLng(1.005, 11.005),
                    L.latLng(1.01, 11.01, 211),
                    L.latLng(1.015, 11.015),
                    L.latLng(1.02, 11.02, 311),
                ],
                false
            )
        ).toEqual([
            {
                "geometry": {
                    "coordinates": [
                        [11, 1, 111],
                        [11.002, 1.002, undefined],
                        [11.005, 1.005, undefined],
                        [11.01, 1.01, 211],
                        [11.015, 1.015, undefined],
                        [11.02, 1.02, 311]
                    ],
                    "type": "LineString"
                },
                "properties": {
                    "attributeType": 6
                },
                "type": "Feature"
            }
        ]);
    });

    test("build features - single gradient - intermediate points without altitude - interpolate", () => {
        expect(
            exchange.internal._buildFeatures(
                [
                    L.latLng(1, 11, 111),
                    L.latLng(1.002, 11.002),
                    L.latLng(1.005, 11.005),
                    L.latLng(1.01, 11.01, 211)
                ],
                true
            )
        ).toEqual([
            {
                "geometry": {
                    "coordinates": [
                        [11, 1, 111],
                        [11.002, 1.002, 131],
                        [11.005, 1.005, 161],
                        [11.01, 1.01, 211]
                    ],
                    "type": "LineString"
                },
                "properties": {
                    "attributeType": 6
                },
                "type": "Feature"
            }
        ]);
    });

    test("build features - multi gradients - no intermediate points without altitude", () => {
        expect(
            exchange.internal._buildFeatures(
                [
                    L.latLng(1, 11, 111),
                    L.latLng(1.01, 11.01, 211),
                    L.latLng(1.02, 11.02, 411),
                    L.latLng(1.03, 11.03, 611)
                ],
                false
            )
        ).toEqual([
            {
                "geometry": {
                    "coordinates": [
                        [11, 1, 111],
                        [11.01, 1.01, 211]
                    ],
                    "type": "LineString"
                },
                "properties": {
                    "attributeType": 6
                },
                "type": "Feature"
            },
            {
                "geometry": {
                    "coordinates": [
                        [11.01, 1.01, 211],
                        [11.02, 1.02, 411],
                        [11.03, 1.03, 611]
                    ],
                    "type": "LineString"
                },
                "properties": {
                    "attributeType": 13
                },
                "type": "Feature"
            }
        ]);
    });

    test("build features - multi gradients - intermediate points without altitude", () => {
        expect(
            exchange.internal._buildFeatures(
                [
                    L.latLng(1, 11, 111),
                    L.latLng(1.002, 11.002),
                    L.latLng(1.004, 11.004),
                    L.latLng(1.01, 11.01, 211),
                    L.latLng(1.015, 11.015),
                    L.latLng(1.02, 11.02, 411),
                ],
                false
            )
        ).toEqual([
            {
                "geometry": {
                    "coordinates": [
                        [11, 1, 111],
                        [11.002, 1.002, undefined],
                        [11.004, 1.004, undefined],
                        [11.01, 1.01, 211]
                    ],
                    "type": "LineString"
                },
                "properties": {
                    "attributeType": 6
                },
                "type": "Feature"
            },
            {
                "geometry": {
                    "coordinates": [
                        [11.01, 1.01, 211],
                        [11.015, 1.015, undefined],
                        [11.02, 1.02, 411]
                    ],
                    "type": "LineString"
                },
                "properties": {
                    "attributeType": 13
                },
                "type": "Feature"
            }
        ]);
    });

    test("build features - multi gradients - intermediate points without altitude - interpolate", () => {
        expect(
            exchange.internal._buildFeatures(
                [
                    L.latLng(1, 11, 111),
                    L.latLng(1.002, 11.002),
                    L.latLng(1.004, 11.004),
                    L.latLng(1.01, 11.01, 211),
                    L.latLng(1.015, 11.015),
                    L.latLng(1.02, 11.02, 411),
                ],
                true
            )
        ).toEqual([
            {
                "geometry": {
                    "coordinates": [
                        [11, 1, 111],
                        [11.002, 1.002, 131],
                        [11.004, 1.004, 151],
                        [11.01, 1.01, 211]
                    ],
                    "type": "LineString"
                },
                "properties": {
                    "attributeType": 6
                },
                "type": "Feature"
            },
            {
                "geometry": {
                    "coordinates": [
                        [11.01, 1.01, 211],
                        [11.015, 1.015, 311],
                        [11.02, 1.02, 411]
                    ],
                    "type": "LineString"
                },
                "properties": {
                    "attributeType": 13
                },
                "type": "Feature"
            }
        ]);
    });

    test("build features - normalization - interpolate", () => {
        expect(
            exchange.internal._buildFeatures(
                [
                    L.latLng(1, 11, 111),
                    L.latLng(1.002, 11.002),
                    L.latLng(1.004, 11.004, 150),
                    L.latLng(1.01, 11.01, 211),
                    L.latLng(1.015, 11.015),
                    L.latLng(1.016, 11.016, 300),
                    L.latLng(1.02, 11.02, 411),
                    L.latLng(1.03, 11.03, 411)
                ],
                true,
                true,
                100
            )
        ).toEqual([
            {
                "geometry": {
                    "coordinates": [
                        [11, 1, 111],
                        [11.002, 1.002, 130.5],
                        [11.004, 1.004, 150],
                        [11.01, 1.01, 211]
                    ],
                    "type": "LineString"
                },
                "properties": {
                    "attributeType": 6
                },
                "type": "Feature"
            },
            {
                "geometry": {
                    "coordinates": [
                        [11.01, 1.01, 211],
                        [11.015, 1.015, 285.2],
                        [11.016, 1.016, 300]
                    ],
                    "type": "LineString"
                },
                "properties": {
                    "attributeType": 9
                },
                "type": "Feature"
            },
            {
                "geometry": {
                    "coordinates": [
                        [11.016, 1.016, 300],
                        [11.02, 1.02, 411]
                    ],
                    "type": "LineString"
                },
                "properties": {
                    "attributeType": 16
                },
                "type": "Feature"
            },
            {
                "geometry": {
                    "coordinates": [
                        [11.02, 1.02, 411],
                        [11.03, 1.03, 411]
                    ],
                    "type": "LineString"
                },
                "properties": {
                    "attributeType": 0
                },
                "type": "Feature"
            }
        ]);
    });

    test("build features - realistic scenario", () => {
        expect(
            exchange.internal._buildFeatures(
                [
                    L.latLng(0.999, 10.999),
                    L.latLng(1, 11, 111),
                    L.latLng(1.002, 11.002),
                    L.latLng(1.004, 11.004),
                    L.latLng(1.01, 11.01, 211),
                    L.latLng(1.015, 11.015),
                    L.latLng(1.02, 11.02, 411),
                    L.latLng(1.03, 11.03, 311),
                    L.latLng(1.04, 11.04, 311),
                    L.latLng(1.05, 11.05, 511),
                    L.latLng(1.06, 11.06),
                ],
                true
            )
        ).toEqual([
            {
                "geometry": {
                    "coordinates": [
                        [10.999, 0.999, 111],
                        [11, 1, 111]
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
                        [11, 1, 111],
                        [11.002, 1.002, 131],
                        [11.004, 1.004, 151],
                        [11.01, 1.01, 211]
                    ],
                    "type": "LineString"
                },
                "properties": {
                    "attributeType": 6
                },
                "type": "Feature"
            },
            {
                "geometry": {
                    "coordinates": [
                        [11.01, 1.01, 211],
                        [11.015, 1.015, 311],
                        [11.02, 1.02, 411]
                    ],
                    "type": "LineString"
                },
                "properties": {
                    "attributeType": 13
                },
                "type": "Feature"
            },
            {
                "geometry": {
                    "coordinates": [
                        [11.02, 1.02, 411],
                        [11.03, 1.03, 311]
                    ],
                    "type": "LineString"
                },
                "properties": {
                    "attributeType": -6
                },
                "type": "Feature"
            },
            {
                "geometry": {
                    "coordinates": [
                        [11.03, 1.03, 311],
                        [11.04, 1.04, 311]
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
                        [11.04, 1.04, 311],
                        [11.05, 1.05, 511]
                    ],
                    "type": "LineString"
                },
                "properties": {
                    "attributeType": 13
                },
                "type": "Feature"
            },
            {
                "geometry": {
                    "coordinates": [
                        [11.05, 1.05, 511],
                        [11.06, 1.06, 511]
                    ],
                    "type": "LineString"
                },
                "properties": {
                    "attributeType": 0
                },
                "type": "Feature"
            },
        ]);
    });

    //
    // Filter coordinates with altitude
    //
    test("filter coordinates with altitude", () => {
        expect(exchange.internal._filterCoordinatesWithAltitude([])).toEqual([]);

        expect(
                exchange.internal._filterCoordinatesWithAltitude([
                        L.latLng(1, 2)
                ])
        ).toEqual([]);

        expect(
                exchange.internal._filterCoordinatesWithAltitude([
                        L.latLng(1, 1),
                        L.latLng(2, 2, 2),
                        L.latLng(3, 3)
                ])
        ).toEqual([
                { point: L.latLng(2, 2, 2), index: 1 }
        ]);

        expect(
                exchange.internal._filterCoordinatesWithAltitude([
                        L.latLng(1, 1),
                        L.latLng(2, 2, 2),
                        L.latLng(3, 3),
                        L.latLng(4, 4, 4),
                        L.latLng(5, 5)
                ])
        ).toEqual([
                { point: L.latLng(2, 2, 2), index: 1 },
                { point: L.latLng(4, 4, 4), index: 3 }
        ]);

        expect(
                exchange.internal._filterCoordinatesWithAltitude([
                        L.latLng(1, 1),
                        L.latLng(2, 2, 2),
                        L.latLng(2.0001, 2.0002, 2), // in fuzzy range
                        L.latLng(3, 3),
                        L.latLng(4, 4, 4),
                        L.latLng(5, 5)
                ])
        ).toEqual([
                { point: L.latLng(2, 2, 2), index: 1 },
                { point: L.latLng(4, 4, 4), index: 4 }
        ]);

        expect(
                exchange.internal._filterCoordinatesWithAltitude([
                        L.latLng(2, 2, 2),
                        L.latLng(2.0001, 2.0001, 2), // in fuzzy range
                        L.latLng(2.0001, 2.0002, 2), // in fuzzy range
                ])
        ).toEqual([
                { point: L.latLng(2, 2, 2), index: 0 }
        ]);
    });

    //
    // Has altitude
    //
    test("has altitude", () => {
        expect(exchange.internal._hasAltitude(L.latLng(1, 1))).toBe(false);
        expect(exchange.internal._hasAltitude(L.latLng(1, 1, 1))).toBe(true);
    });

    //
    // Is in fuzzy range
    //
    test("is in fuzzy range", () => {
        // 20m
        expect(exchange.internal._isInFuzzyRange(
                L.latLng(1, 2),
                L.latLng(1.0001, 2.0001))
        ).toBe(true);
        
        // 30m
        expect(exchange.internal._isInFuzzyRange(
                L.latLng(1, 2),
                L.latLng(1.0003, 2))
        ).toBe(false);

        // 40m
        expect(exchange.internal._isInFuzzyRange(
                L.latLng(1.0001, 2.0001),
                L.latLng(1.0003, 2.0004))
        ).toBe(false);
        
        expect(exchange.internal._isInFuzzyRange(
                L.latLng(1, 1),
                L.latLng(2, 2))
        ).toBe(false);
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

    //
    // Calculate gradient
    //

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

    test("calculate gradient - duplicate points", () => {
        var latLngs = [
            L.latLng(2, 2, 20),
            L.latLng(2, 2, 20)
        ];
        expect(exchange.internal._calculateGradient(latLngs)).toEqual(0);
    });

    test("calculate gradient - points at start have no altitude", () => {
        var latLngs = [
            L.latLng(1, 1),
            L.latLng(2, 2, 2),
            L.latLng(2.001, 2.001, 200)
        ];
        expect(exchange.internal._calculateGradient(latLngs)).toEqual(16);
    });

    test("calculate gradient - points at end have no altitude", () => {
        var latLngs = [
            L.latLng(2, 2, 20),
            L.latLng(2.002, 2.002, 2),
            L.latLng(3, 3)
        ];
        expect(exchange.internal._calculateGradient(latLngs)).toEqual(-6);
    });

    test("calculate gradient - all points with altitutde", () => {
        var latLngs = [
            L.latLng(2, 2, 2),
            L.latLng(2.001, 2.002, 19),
            L.latLng(2.002, 2.002, 20)
        ];
        expect(exchange.internal._calculateGradient(latLngs)).toEqual(5);
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
        expect(exchange.internal._calculateGradient(latLngs)).toEqual(6);
    });

    test("calculate gradient - duplicate points", () => {
        var latLngsNoDuplicate = [
            L.latLng(2.001, 2.001, 100),
            L.latLng(2.0015, 2.0015, 105)
        ];
        var gradient = exchange.internal._calculateGradient(latLngsNoDuplicate);

        var latLngsDuplicate = [
            L.latLng(2.001, 2.001, 100),
            L.latLng(2.001, 2.001, 100),
            L.latLng(2.0015, 2.0015, 105)
        ];

        expect(exchange.internal._calculateGradient(latLngsDuplicate)).toEqual(gradient);
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

    test("interpolate when duplicate point with elevation", () => {
        var latLngs = [
            L.latLng(1.001, 1.001, 1),
            L.latLng(1.002, 1.002),
            L.latLng(1.001, 1.001, 1)
        ];
        expect(exchange.internal._interpolateElevation(latLngs, true))
               .toEqual([
                    L.latLng(1.001, 1.001, 1),
                    L.latLng(1.002, 1.002, 1),
                    L.latLng(1.001, 1.001, 1)
               ]);
    });

    test("interpolate when duplicate point with and without elevation", () => {
        var latLngs = [
            L.latLng(1.001, 1.001, 1),
            L.latLng(1.001, 1.001),
            L.latLng(1.001, 1.001, 1)
        ];
        expect(exchange.internal._interpolateElevation(latLngs, true))
               .toEqual([
                    L.latLng(1.001, 1.001, 1),
                    L.latLng(1.001, 1.001, 1),
                    L.latLng(1.001, 1.001, 1)
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

        expect(exchange.internal._mapGradient(-100)).toEqual(-16);
        expect(exchange.internal._mapGradient(-16)).toEqual(-16);

        expect(exchange.internal._mapGradient(-15.5)).toEqual(-15);
        expect(exchange.internal._mapGradient(-12)).toEqual(-12);
        expect(exchange.internal._mapGradient(-10)).toEqual(-10);

        expect(exchange.internal._mapGradient(-9.5)).toEqual(-9);
        expect(exchange.internal._mapGradient(-7)).toEqual(-7);

        expect(exchange.internal._mapGradient(-6.5)).toEqual(-6);
        expect(exchange.internal._mapGradient(-4)).toEqual(-4);

        expect(exchange.internal._mapGradient(-1.1)).toEqual(-1);
        expect(exchange.internal._mapGradient(-1)).toEqual(-1);

        expect(exchange.internal._mapGradient(-0.9)).toEqual(-1);
        expect(exchange.internal._mapGradient(0.9)).toEqual(1);

        expect(exchange.internal._mapGradient(1)).toEqual(1);
        expect(exchange.internal._mapGradient(3.9)).toEqual(4);

        expect(exchange.internal._mapGradient(4.1)).toEqual(4);
        expect(exchange.internal._mapGradient(6.9)).toEqual(7);

        expect(exchange.internal._mapGradient(7)).toEqual(7);
        expect(exchange.internal._mapGradient(9.9)).toEqual(10);

        expect(exchange.internal._mapGradient(10.1)).toEqual(10);
        expect(exchange.internal._mapGradient(15.9)).toEqual(16);

        expect(exchange.internal._mapGradient(16)).toEqual(16);
        expect(exchange.internal._mapGradient(100)).toEqual(16);
    });
});
