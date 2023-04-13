import { getModelForClass, prop } from '@typegoose/typegoose';
import mongoose from 'mongoose';

class Token {
    _id!: mongoose.Types.ObjectId;

    @prop({ required: true })
    userId!: string;

    @prop({ required: true })
    token!: string;

    @prop({ default: Date.now, expires: 60 * 30 })
    createdAt: Date;
}

const TokenModel = getModelForClass(Token);

export default TokenModel;
