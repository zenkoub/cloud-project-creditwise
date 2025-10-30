// routes/files.js
import express from 'express';
import multer from 'multer';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, S3_BUCKET_NAME } from '../s3Client.js';

const router = express.Router();

// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST /api/files/upload
// This route handles a form field named 'file'
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  // Create a unique file name
  const fileName = `uploads/${Date.now()}-${req.file.originalname}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: fileName,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  });

  try {
    await s3Client.send(command);

    // Return the path to save in your RDS database
    res.status(200).json({ 
      message: "File uploaded successfully", 
      path: fileName 
    });

  } catch (err) {
    console.error("S3 Upload Error:", err);
    res.status(500).json({ error: "Failed to upload file." });
  }
});

export default router;