import mongoose, { Schema, Document } from 'mongoose';

export interface IData extends Document {
  _id: string;
  value: any;
}

const DataSchema: Schema = new Schema({
  _id: { type: String, required: true },
  value: { type: Schema.Types.Mixed, required: true },
});

export default mongoose.models.Data || mongoose.model<IData>('Data', DataSchema);
