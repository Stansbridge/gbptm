const _ = require('lodash');
const Schema = require('mongoose').Schema;
const mongoosePaginate = require('mongoose-paginate');
const geohash = require('geo-hash');
const specs = {};
const schemae = {};

specs.looCore = {
  type: { type: String, default: 'Feature' },
  geometry: {
    type: {
      type: String,
      required: '"{PATH}" should be "Point" and is required',
    },
    coordinates: [{ type: 'Number' }],
  },
  properties: {
    name: { type: String },
    active: { type: Boolean, default: true },
    access: { type: String, default: 'public' },
    opening: { type: String },
    type: { type: String },
    accessibleType: { type: String },
    disposal: { type: String },
    babyChange: { type: String },
    babyChangeLocation: { type: String },
    changingPlace: { type: String },
    familyToilet: { type: String },
    radar: { type: String },
    attended: { type: String },
    automatic: { type: String },
    parking: { type: Boolean },
    fee: { type: String },
    streetAddress: { type: String },
    postcode: { type: String },
    operator: { type: String },
    reportEmail: { type: String },
    reportPhone: { type: String },
    notes: { type: String },
    infoUrl: { type: String },
    architecturalInterest: { type: String },
    historicalInterest: { type: String },
    geocoded: { type: Boolean },
    geocoding_method: { type: String },
    orig: { type: Object },
    removal_reason: { type: String },
    area: [
      {
        type: { type: String },
        name: { type: String },
      },
    ],
  },
  geohash: String,
};

schemae.looReportSchema = new Schema(
  _.merge({}, specs.looCore, {
    origin: String,
    attribution: {
      type: String,
      required: '"{PATH}" to a person or organisation is required',
    },
    userId: { type: String, select: false },
    trust: { type: 'Number', default: 5, min: -1, max: 10 },
    collectionMethod: { type: String },
    derivedFrom: { type: Schema.Types.ObjectId, ref: 'Loo' },
  }),
  { timestamps: true }
);
schemae.looReportSchema.pre('save', function(next) {
  this.geohash = geohash.encode(
    this.geometry.coordinates[1],
    this.geometry.coordinates[0]
  );
  next();
});
schemae.looReportSchema.index({ geohash: 1 });
schemae.looReportSchema.index({ geohash: 1, attribution: 1 });
schemae.looReportSchema.index({ 'properties.active': 1 });

schemae.looSchema = new Schema(
  _.merge({}, specs.looCore, {
    sources: [String],
    attributions: [String],
    reports: [{ type: Schema.Types.ObjectId, ref: 'LooReport' }],
    credibility: { type: Number },
  }),
  { timestamps: true }
);
schemae.looSchema.pre('save', function(next) {
  this.geohash = geohash.encode(
    this.geometry.coordinates[1],
    this.geometry.coordinates[0]
  );
  next();
});
schemae.looSchema.index({ geometry: '2dsphere' });
schemae.looSchema.index({ geohash: 1 });
schemae.looSchema.plugin(mongoosePaginate);

// add text index for search API endpoint
schemae.looSchema.index(
  { 'properties.name': 'text', 'properties.notes': 'text' },
  { default_language: 'none' }
);

module.exports = schemae;
