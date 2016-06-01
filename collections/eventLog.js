var mongoose = require('mongoose')
    , Schema = mongoose.Schema;


var EventLogSchema = new Schema (
    {
        username: {type: String, default: '', trim: true}, // reference User.username
        event: {type: String, default: '', trim: true}, //
        content: {type: String, default: '', trim: true},
        timestamp: {type: Date, default: Date.now},
        gatewayId: {type: String, default: '', trim: true}
    }
);


/**
 * Pre-remove hook
 */

EventLogSchema.pre('remove', function (next) {
    // things to do before removing a test
    next()
})

/**
 * Methods
 */

EventLogSchema.methods = {

}

/**
 * Statics
 */

EventLogSchema.statics = {
}

mongoose.model('EventLog', EventLogSchema);

