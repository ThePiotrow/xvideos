import * as mongoose from 'mongoose';
import * as randomstring from 'randomstring';
import { IUserLink } from 'src/interfaces/user-link.interface';

function transformValue(doc, ret: { [key: string]: any }) {
  delete ret._id;
}

function generateLink(length = 18) {
  return randomstring.generate({
    length,
    charset: 'alphanumeric',
    readable: true,
  });
}

export const UserLinkSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: [true, 'User can not be empty'],
    },
    is_used: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      required: [true, 'Link can not be empty'],
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

UserLinkSchema.pre('validate', function (next) {
  const self = this as IUserLink;

  if (this.isNew) {
    self.link = generateLink();
  }

  next();
});