import * as mongoose from 'mongoose';
import { IMedia } from '../interfaces/media.interface';

function transformValue(doc, ret: { [key: string]: any }) {
  delete ret._id;
  delete ret.__v;
}

export const MediaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    urls: {
      original: {
        type: String,
        required: true
      },
      thumbnail: {
        type: String,
        required: false
      },
      hls: {
        type: String,
        required: false
      }
    },
    type: {
      type: String,
      required: [true, 'Type can not be empty'],
      enum: ['image', 'video'],
    },
    duration: {
      type: Number,
      required: false,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'User can not be empty'],
    },
    is_deleted: {
      type: Boolean,
      default: false
    },
    deleted_at: {
      type: Date,
      default: null
    }
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

  if (!this.isModified('deleted_at'))
    self.updated_at = Date.now();

  next();
});
