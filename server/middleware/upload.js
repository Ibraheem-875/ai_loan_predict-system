const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

/**
 * Multer storage engine backed by Cloudinary.
 * All uploaded documents land in the "loan_documents" folder.
 */
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'loan_documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'webp'],
    resource_type: 'auto',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

module.exports = upload;
