const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "daj8zz425",
  api_key: "436441351317478",
  api_secret: "wMifEGjOmnOZiQ75UIQYIse1UQc",
});

module.exports = cloudinary;