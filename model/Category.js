import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  content: {
    type: String,
    minLength: 4,
    required: true,
  },
  important: Boolean,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  photoInfo: {
    url: String,
    filename: String,
  },
});

categorySchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Category = mongoose.model("Category", categorySchema);

export default Category;

//npm i bcrypt to transform passwordhash to encrypted type