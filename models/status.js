var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    mongoosePaginate = require('mongoose-paginate');

var StatusSchema = new mongoose.Schema({
    message: {
        type: Object,
        required: 'message is required'
    }
}, {
    timestamps: true
});

StatusSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

StatusSchema.set('toJSON', { getters: true, virtuals: true });
StatusSchema.set('toObject', { getters: true, virtuals: true });
StatusSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Status', StatusSchema);
