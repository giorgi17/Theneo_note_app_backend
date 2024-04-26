const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema(
    {
        title: {
            type: String,
            require: true,
        },
    },
    {
        timestamps: true,
    }
);

categorySchema.index({ title: 'text' });

module.exports = mongoose.model('Category', categorySchema);
