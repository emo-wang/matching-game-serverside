const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://yimengpuppet:Exc2DhS5V74NzWA2@cluster0.xfxbgbq.mongodb.net/matchingGameDatabase?retryWrites=true&w=majority&appName=Cluster0', {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Connection error", err.message);
  }
}

module.exports = connectDB;
