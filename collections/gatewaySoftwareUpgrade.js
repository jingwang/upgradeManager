var mongoose = require('mongoose')
    , Schema = mongoose.Schema;


var GatewaySoftwareUpgradeSchema = new Schema (
    {
        gatewayId: {type: String, default: '', trim: true},
        softwareVersion: {type: String, default: '', trim: true},
        softwareUpgradeTimestampMillis: {type: Number, default: 0}, // milli-second,
        status: {type: String, default: '', trim: true} // PUBLISHED/CONFIRMED
    }
);


/**
 * Pre-remove hook
 */

GatewaySoftwareUpgradeSchema.pre('remove', function (next) {
    // things to do before removing a test
    next()
})

/**
 * Methods
 */

GatewaySoftwareUpgradeSchema.methods = {

}

/**
 * Statics
 */

GatewaySoftwareUpgradeSchema.statics = {
}

mongoose.model('GatewaySoftwareUpgrade', GatewaySoftwareUpgradeSchema);

