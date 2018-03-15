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
    resolveDate: {
        type: String,
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
        type: Number,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    globalStatus: {
        type: String,
        required: true,
    },
    versions: [
        {
            file: {
                type: String,
                required: true,
            },
            version: {
                type: String,
                required: true,
            },
            date: {
                type: String,
                required: true,
            },
            status: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            rejectReason: {
                type: String,
            },
            sigFile: String
        }
    ],
    groupToken: {
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
            canSee: {
                type: String,
            },
            status: {
                type: String,
            },
            comment: {
                type: String,
            },
            dateIncoming: {
                type: String,
            },
            dateSigning: {
                type: String,
            },
            publicKey: {
                type: String,
            }
        }
    ]
});
mongoose.model('documents', DocumentShema);