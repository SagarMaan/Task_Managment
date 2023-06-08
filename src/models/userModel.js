const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    lowerCase : true
  },
  emailId: {
    type: String,
    required: true,
    unique: true,
    lowerCase : true
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["Task Creator", "Admin", "Visitor"],
    default : "Visitor"
  },
  permissions: {
    type: Boolean,
  },
},
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;