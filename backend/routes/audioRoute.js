
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, resolve, extname } from 'path';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types';
import options from '../audiofiles/metaling/metaphono/metaphoneaw/phontrail/cvsyl/options.js'
const route = express.Router();

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Construct the base directory path relative to the project root
const baseDirectory = resolve(__dirname, '../audiofiles');

// Handle the POST request to fetch audio files
route.post('/getaudio', (req, res) => {
  const filenameWithPath = req.body.filenameWithPath;

  if (!filenameWithPath) {
    return res.status(400).send('filenameWithPath is required');
  }

  // Normalize the folderPath to remove any leading slashes and handle platform differences
  const normalizedFolderPath = path.normalize(filenameWithPath).replace(/^(\.\\|\\|\/)+/, '');
  const filePath = resolve(baseDirectory, normalizedFolderPath);


  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  const mimeType = mime.lookup(extname(filePath)) || 'application/octet-stream';
  res.setHeader('Content-Type', mimeType);
  res.sendFile(filePath, err => {
    if (err) {
      res.status(500).send('Error sending file');
    }
  });
});

// New endpoint to list available audio files in a directory
route.post('/listfiles', (req, res) => {
  const folderPath = req.body.folderPath;

  if (!folderPath) {
    return res.status(400).send('folderPath is required');
  }

  // Normalize the folderPath to remove any leading slashes and handle platform differences
  const normalizedFolderPath = path.normalize(folderPath).replace(/^(\.\\|\\|\/)+/, '');

  // Combine the paths
  const dirPath = path.join(baseDirectory, normalizedFolderPath);



  if (!fs.existsSync(dirPath)) {
    return res.status(404).send('Directory not found');
  }

  fs.readdir(dirPath, (err, files) => {
    if (err) {
      return res.status(500).send('Error reading directory');
    }

    // Filter out non-audio files if needed
    const audioFiles = files.filter(file => {
      const ext = extname(file).toLowerCase();
      return ext === '.wav' || ext === '.mp3'; // Add other audio file types if needed
    });
    const audioData = audioFiles.map(file => {
      const script = file.replace(extname(file), ''); // Assume the script is the file name without extension
      return { fileName: file, script };
    });

    res.json(audioFiles);
  });
});

// Handle the POST request to get options for a specific audio file
route.post('/getoptions', (req, res) => {
  const fileName = req.body.fileName;

  if (!fileName) {
    return res.status(400).send('fileName is required');
  }

  const optionsForFile = options[fileName]; // Use bracket notation here
  // console.log(optionsForFile);

  if (!optionsForFile) {
    return res.status(404).send('Options not found for the provided file name');
  }

  res.json({ options: optionsForFile });
});

const getJsonData = (basePath) => {
  const filePath = path.join(basePath, '\\option.json'); // Adjust file name/path as needed
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found at path: ${filePath}`);
  }
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent);
};

route.post('/getquestions', (req, res) => {
  const { optionPath, noiseLevel, topicName } = req.body;
  const normalizedFolderPath = path.normalize(optionPath).replace(/^(\.\\|\\|\/)+/, '');
  const folderPath = resolve(baseDirectory, normalizedFolderPath);
  console.log(folderPath);
  // return res.json("varun")

  if (!folderPath || !noiseLevel || !topicName) {
    return res.status(400).json({ error: 'Missing required fields: folderPath, noiseLevel, or topicName.' });
  }

  try {
    const data = getJsonData(folderPath);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


export default route;