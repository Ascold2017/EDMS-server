const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DocumentPresetShema = new Schema({
    title: {
        type: String,
        required: [true, 'Укажите название пресета']
    },
    group: {
        type: String,
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
                type: String,
            },
            comment: {
                type: String,
            }
        }
    ]
});

mongoose.model('documentsPresets', DocumentPresetShema);