const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { isValidObjectId } = require("mongoose");
const {
  validateUserName,
  validateEmailId,
  validatePassword,
  validateRoleStatus,
} = require("../validations/validator");

//================================= Register User ================================================//

let userRegistration = async function (req, res) {
  try {
    let data = req.body;

    let { userName, emailId, password, role } = data;

    if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "Body can't be empty" });

    if (!userName || typeof userName != "string")
      return res.status(400).send({
        status: false,
        message:
          "Please provide user name with suitable datatype OR it can't be empty",
      });

    if (!validateUserName(userName)) {
      return res.status(400).send({
        status: false,
        message: "User name should contain only alphabates.",
      });
    }

    if (!emailId || typeof emailId != "string")
      return res.status(400).send({
        status: false,
        messsage: "Email is mandatory with suitable datatype",
      });

    if (!validateEmailId(emailId)) {
      return res.status(400).send({
        status: false,
        message: "EmailId should be in a valid format.",
      });
    }

    let checkEmail = await userModel.findOne({ emailId: emailId });

    if (checkEmail) {
      return res.status(400).send({
        status: false,
        message: "Provide a unique emailid this id already in use.",
      });
    }

    if (!password || typeof password != "string")
      return res.status(400).send({
        status: false,
        messsage: "Paasword is mandatory with suitable datatype",
      });

    if (!validatePassword(password)) {
      return res.status(400).send({
        status: false,
        message: "Password should be in a valid format.",
      });
    }

    let hashing = bcrypt.hashSync(password, 8);
    data.password = hashing;

    if (role) {
      if (typeof role != "string") {
        return res
          .status(400)
          .send({ status: false, message: "Role must be in string" });
      }

      if (!validateRoleStatus(role)) {
        return res.status(400).send({
          status: false,
          message: "Role status should be Admin , Task Creator and Visitor .",
        });
      }
    }

    let savedata = await userModel.create(data);

    if (savedata.role == "Admin" || savedata.role == "Task Creator") {
      savedata.permission = "true";

      let { userName, emailId, password, role, permission } = savedata;
      let finalData = { userName, emailId, password, role, permission };

      return res.status(201).send({
        status: true,
        message: "User created successfully",
        data: finalData,
      });
    } else {
      savedata.permission = "false";

      let { userName, emailId, password, role, permission } = savedata;
      let finalData = { userName, emailId, password, role, permission };

      return res.status(201).send({
        status: true,
        message: "User created successfully",
        data: finalData,
      });
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

//==================================== Login User ============================================//

const userLogin = async function (req, res) {
  try {
    let { emailId, password } = req.body;

    if (Object.keys(req.body).length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "Please input user Details" });
    }
    if (!emailId || typeof emailId != "string")
      return res.status(400).send({
        status: false,
        messsage: "Email is mandatory with suitable datatype",
      });

    if (!validateEmailId(emailId)) {
      return res
        .status(400)
        .send({ status: false, message: "EmailId should be Valid" });
    }

    if (!password || typeof password != "string")
      return res.status(400).send({
        status: false,
        messsage: "Paasword is mandatory with suitable datatype",
      });

    if (!validatePassword(password)) {
      return res.status(400).send({
        status: false,
        message: "Password should be in a valid format.",
      });
    }

    let verifyUser = await userModel.findOne({ emailId: emailId });
    if (!verifyUser) {
      return res.status(400).send({ status: false, message: "User not found" });
    }

    let hash = verifyUser.password;

    let isCorrect = bcrypt.compareSync(password, hash);
    if (!isCorrect)
      return res
        .status(400)
        .send({ status: false, message: "Password is incorrect" });

    let token = jwt.sign(
      {
        userId: verifyUser._id.toString(),
        exp: Math.floor(Date.now() / 1000) + 120 * 60,
        iat: Math.floor(Date.now()),
      },
      "secret-key"
    );

    res.setHeader("x-api-key", token);
    res.status(200).send({
      status: true,
      message: "Successfully Login.",
      data: { userId: verifyUser["_id"], token },
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

//======================================== Update User ==========================================//

const updateUser = async function (req, res) {
  try {
    let userId = req.params.userId;

    if (!isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: false, message: "User Id is invalid." });

    let getUserId = await userModel.findOne({ _id: userId });

    if (!getUserId)
      return res
        .status(404)
        .send({ status: false, message: "User not found." });

    let data = req.body;

    let { userName, emailId, password, role } = data;

    if (Object.keys(data).length == 0)
      return res.status(400).send({
        status: false,
        message: "At least one field is mendatory for update user profile.",
      });

    let updatedData = {};

    if (userName) {
      if (typeof userName != "string")
        return res.status(400).send({
          status: false,
          message: "Please provide user name with suitable datatype.",
        });

      if (!validateUserName(userName)) {
        return res.status(400).send({
          status: false,
          message: "User name should contain only alphabates.",
        });
      }
      updatedData.userName = userName;
    }

    if (emailId) {
      if (typeof emailId != "string")
        return res.status(400).send({
          status: false,
          messsage: "Email is mandatory with suitable datatype",
        });

      if (!validateEmailId(emailId)) {
        return res.status(400).send({
          status: false,
          message: "EmailId should be in a valid format.",
        });
      }
      let checkEmail = await userModel.findOne({ emailId: emailId });

      if (checkEmail) {
        return res.status(400).send({
          status: false,
          message: "Provide a unique emailid this id already in use.",
        });
      }

      updatedData.emailId = emailId;
    }

    if (password) {
      if (typeof password != "string")
        return res.status(400).send({
          status: false,
          messsage: "Paasword is mandatory with suitable datatype",
        });

      if (!validatePassword(password)) {
        return res.status(400).send({
          status: false,
          message: "Password should be in a valid format.",
        });
      }

      let hashing = bcrypt.hashSync(password, 8);

      updatedData.password = hashing;
    }

    if (role) {
      if (typeof role != "string") {
        return res
          .status(400)
          .send({ status: false, message: "Role must be in string" });
      }

      if (!validateRoleStatus(role)) {
        return res.status(400).send({
          status: false,
          message: "Role status should be Admin , Task Creator and Visitor .",
        });
      }
      updatedData.role = role;
    }

    let updateUserData = await userModel.findOneAndUpdate(
      { _id: userId },
      updatedData,
      { new: true }
    );

    if (
      updateUserData.role == "Admin" ||
      updateUserData.role == "Task Creator"
    ) {
      updateUserData.permission = "true";

      let { userName, emailId, password, role, permission } = updateUserData;
      let finalData = { userName, emailId, password, role, permission };

      return res.status(201).send({
        status: true,
        message: "User created successfully",
        data: finalData,
      });
    } else {
      updateUserData.permission = "false";

      let { userName, emailId, password, role, permission } = updateUserData;
      let finalData = { userName, emailId, password, role, permission };

      return res.status(201).send({
        status: true,
        message: "User created successfully",
        data: finalData,
      });
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { userRegistration, userLogin, updateUser };
