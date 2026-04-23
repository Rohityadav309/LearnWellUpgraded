import { v2 as cloudinary } from "cloudinary";

export const uploadImageToCloudinary = async (
  file,
  folder,
  height,
  quality,
) => {
  const options = { folder, resource_type: "auto" };

  if (height) {
    options.height = height;
  }

  if (quality) {
    options.quality = quality;
  }

  return cloudinary.uploader.upload(file.tempFilePath, options);
};
