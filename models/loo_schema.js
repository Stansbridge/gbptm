'use strict';

var _ = require('lodash'),
    Schema = require('mongoose').Schema,
    timestamps = require('mongoose-timestamp'),
    geohash = require('geo-hash'),
    stampopts = {},
    specs = {},
    schemae = {};

specs.looProperties = {};
specs.looCore = {
    'type'    : { type: String, default: "Feature" },
    geometry  : {
        type: { type: String, required: '"{PATH}" should be "Point" and is required' },
        coordinates: [{type: "Number"}],
        
    },
    properties: specs.looProperties,
    geohash: String
};

schemae.looReportSchema = new Schema(
    _.merge(
        {},
        specs.looCore,
        {
            origin: String,
            attribution: {type: String, required: '"{PATH}" to a person or organisation is required'},
            trust: {type: Number, default: 5}
        }
    )
);
schemae.looReportSchema.plugin(timestamps, stampopts);
schemae.looReportSchema.pre('save', function (next) {
  this.geohash = geohash.encode(this.geometry.coordinates[1], this.geometry.coordinates[0]);
  next();
});
schemae.looReportSchema.index({geohash: 1});
schemae.looReportSchema.index({geohash: 1, attribution: 1});

schemae.looSchema = new Schema(
    _.merge(
        {},
        specs.looCore,
        {
            sources: [String],
            attributions: [String],
            reports: [{ type: Schema.Types.ObjectId, ref: 'LooReport' }]
        }
    )
);
schemae.looSchema.pre('save', function (next) {
  this.geohash = geohash.encode(this.geometry.coordinates[1], this.geometry.coordinates[0]);
  next();
});
schemae.looSchema.plugin(timestamps, stampopts);
schemae.looSchema.index({geometry: '2dsphere'});
schemae.looSchema.index({geohash: 1});

module.exports = schemae;