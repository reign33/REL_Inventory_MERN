import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  photoInfo: {
    url: String,
    filename: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

profileSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Profiles = mongoose.model("Profiles", profileSchema);

export default Profiles;

//npm i bcrypt to transform passwordhash to encrypted type