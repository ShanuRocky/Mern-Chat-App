import { timeStamp } from "console";
import mongoose from "mongoose";
import { type } from "os";

const MessageSchema = new mongoose.Schema(
    {
        reciever: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        text: String
    },{timestamps:true}
);

const Messagemodel = mongoose.model('Message',MessageSchema);
export default Messagemodel;

