import * as mongoose from 'mongoose';
import { IMedia } from '../interfaces/media.interface';

function transformValue(doc, ret: { [key: string]: any }) {
  delete ret._id;
}

export const MediaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name can not be empty'],
    },
    description: String,
    user_id: {
      type: String,
      required: [true, 'User can not be empty'],
    },
    duration: {
      type: Number,
      required: [false, 'Duration can not be empty'],
    },
    path: {
      type: String,
      required: [true, 'Path can not be empty'],
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: transformValue,
    },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: transformValue,
    },
  },
);

MediaSchema.pre('validate', function (next) {
  const self = this as IMedia;

  if (this.isModified('user_id') && self.created_at) {
    this.invalidate('user_id', 'The field value can not be updated');
  }
  next();
});
