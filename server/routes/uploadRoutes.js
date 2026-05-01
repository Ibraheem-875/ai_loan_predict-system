const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { uploadDocument, deleteDocument } = require('../controllers/uploadController');

// POST /api/upload-document — Upload a document to Cloudinary
router.post('/upload-document', upload.single('file'), uploadDocument);

// DELETE /api/delete-document — Remove a document from Cloudinary
router.delete('/delete-document', deleteDocument);

module.exports = router;
