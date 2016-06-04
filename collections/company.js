var mongoose = require('mongoose')
    , Schema = mongoose.Schema;


var CompanySchema = new Schema (
    {
        companyId: {type: String, default: '', trim: true}, // company id
        name: {type: String, default: '', trim: true},
        registered: {type: Boolean, default: false}

    }
);


/**
 * Pre-remove hook
 */

CompanySchema.pre('remove', function (next) {
    // things to do before removing a test
    next()
})

/**
 * Methods
 */

CompanySchema.methods = {

}

/**
 * Statics
 */

CompanySchema.statics = {
}

mongoose.model('Company', CompanySchema);
