const streamifier = require("streamifier");
const { cloudinary } = require("../config/cloudinary");

const uploadBuffer = (buffer, folder = "resumes") =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });

module.exports = { uploadBuffer };
