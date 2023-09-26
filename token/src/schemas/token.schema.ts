import * as mongoose from 'mongoose';

function transformValue(doc, ret: { [key: string]: any }) {
  delete ret._id;
  delete ret.__v;
}

export const TokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, 'Token can not be empty'],
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'User can not be empty'],
    },
  },
  {
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