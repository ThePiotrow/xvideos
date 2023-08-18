import * as mongoose from 'mongoose';
import { ILive } from '../interfaces/live.interface';

function transformValue(doc, ret: { [key: string]: any }) {
  delete ret._id;
}

export const LiveSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title can not be empty'],
    },
    description: {
      type: String,
      default: "",
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User can not be empty'],
    },
    start_time: {
      type: Date,
      required: [true, 'Start time can not be empty'],
    },
    end_time: {
      type: Date,
      default: null,
    },
    socket_id: {
      type: String,
      required: [true, 'Socket id can not be empty'],
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

LiveSchema.pre('validate', function (next) {
  const self = this as ILive;

  if (this.isModified('user_id') && self.created_at) {
    this.invalidate('user_id', 'The field value can not be updated');
  }
  next();
});
