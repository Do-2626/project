import mongoose, { Schema, models, model } from 'mongoose';

const ContactSchema = new Schema({
    name: { type: String, required: true, unique: true },
    type: {
        type: String,
        enum: ['customer', 'supplier', 'other'],
        default: 'other'
    },
    phone: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Force deletion of model in development to ensure schema updates
if (process.env.NODE_ENV === 'development') {
    delete models.Contact;
}

export default models.Contact || model('Contact', ContactSchema);
