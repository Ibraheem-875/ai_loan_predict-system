const cloudinary = require('../config/cloudinary');

/**
 * POST /api/upload-document
 * Accepts a single file upload via multer-cloudinary and returns the Cloudinary URL.
 * Fields: file (the document), docType (aadhaar | pan | salarySlip)
 */
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const docType = req.body.docType;
    if (!['aadhaar', 'pan', 'salarySlip'].includes(docType)) {
      return res.status(400).json({ error: 'Invalid document type. Must be aadhaar, pan, or salarySlip.' });
    }

    const result = {
      url: req.file.path,
      publicId: req.file.filename,
      docType,
      fileName: req.file.originalname,
      fileSize: req.file.size || 0,
      fileType: req.file.mimetype || 'unknown',
    };

    return res.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Document upload failed.' });
  }
};

/**
 * DELETE /api/delete-document
 * Removes a file from Cloudinary by its publicId.
 */
const deleteDocument = async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) {
      return res.status(400).json({ error: 'publicId is required.' });
    }

    await cloudinary.uploader.destroy(publicId);
    return res.json({ message: 'Document deleted successfully.' });
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ error: 'Failed to delete document.' });
  }
};

module.exports = { uploadDocument, deleteDocument };
