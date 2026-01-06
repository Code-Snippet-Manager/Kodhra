const mongoose = require("mongoose");

const subscriptionsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subscription: {
    type: Object,
    reuired: true,
  },
});

const Subscription = mongoose.model("Subscription", subscriptionsSchema);
module.exports = Subscription;