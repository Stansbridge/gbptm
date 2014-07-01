var LooReport = require('../../../../models/loo_report'),
    thunk = require('thunkify'),
    parse = require('co-body'),
    _ = require('lodash'),
    routes = {};

routes.submit_report = {
    handler: function*(){
        var data = yield parse(this);
        var validator = new LooReport(data);
        validator.validate = thunk(validator.validate);
        try {
            yield validator.validate();
        } catch (e) {
            if (e.name === 'ValidationError') {
                this.throw(400, _.pluck(e.errors, 'message').join('\n'));
            } else {
                throw e;
            }
        }
        var results = yield LooReport.processReport(data);
        this.status = 201;
        this.set('Location', this.app.url('report', {id: results[0]._id}));
        this.set('Content-Location', this.app.url('loo', {id: results[1]._id}));
    },
    path: '/reports',
    method: 'post'
};

module.exports = routes;