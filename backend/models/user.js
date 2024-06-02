import mongoose from "mongoose";

const userschema = new mongoose.Schema(
    {
        firstname: String,
        lastname: String,
        email: 
        {
        type: String,
        unique: true
        },
        password: String,
        gender: String,
        phone: String,
        dateofbirth: Date,
    },{timestamps: true}
);

const Usermodel = mongoose.model('User',userschema);

export default Usermodel;