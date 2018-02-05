const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DocumentPresetShema = new Schema({
    title: {
        type: String,
        required: [true, 'Укажите тип документа']
    },
    routes: [
        {
            _id: {
                type: String,
            },
            author: {
                type: String,
            },
            role: {
                type: String,
            },
            status: {
                type: String,
            },
            canSee: {
                type: Boolean,
            },
            comment: {
                type: String,
            }
        }
    ]
});

mongoose.model('documentsPresets', DocumentPresetShema);