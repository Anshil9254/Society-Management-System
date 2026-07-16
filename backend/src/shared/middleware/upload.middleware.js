const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const env = require('../config/env.config');
const { MulterError } = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

// Allowed image MIME types
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
]);

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'society-management-uploads',
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif', 'webp', 'bmp'],
  },
});

/**
 * First layer: MIME type check on declared Content-Type header.
 * Cloudinary will also perform deep validation on the uploaded file.
 */
const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error('Only image files are allowed (jpeg, png, gif, webp, bmp)'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});

/**
 * Second layer dummy function for compatibility with existing routes.
 * Cloudinary validates the file natively, so local byte inspection is removed.
 */
const validateImageBytes = async (req, res, next) => {
  console.log('REQ.BODY:', req.body);
  console.log('REQ.FILE:', req.file);
  next();
};

module.exports = upload;
module.exports.validateImageBytes = validateImageBytes;

