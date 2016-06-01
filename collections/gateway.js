var mongoose = require('mongoose')
    , Schema = mongoose.Schema;


var GatewaySchema = new Schema (
    {

            gatewayId: {type: String, default: '', trim: true}, // unique id to identify each gateway
            name: {type: String, default: '', trim: true},
            address: {type: String, default: '', trim: true},
            latitude: {type: Number},
            longitude: {type: Number},
            enabled: {type: Boolean, default: true}
    }
);


/**
 * Pre-remove hook
 */

GatewaySchema.pre('remove', function (next) {
    // things to do before removing a test
    next()
})

/**
 * Methods
 */

GatewaySchema.methods = {

}

/**
 * Statics
 */

GatewaySchema.statics = {
}

mongoose.model('Gateway', GatewaySchema);
