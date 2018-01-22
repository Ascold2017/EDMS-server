const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DocumentShema = new Schema({
    title: {
        type: String,
        required: [true, 'Укажите название документа']
    },
    date: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    author_id: {
        type: String,
        default: mongoose.Types.ObjectId(),
    },
    state: {
        type: String,
        required: true,
    },
    globalStatus: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    document: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
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
            comment: {
                type: String,
            }
        }
    ]
});
mongoose.model('documents', DocumentShema);