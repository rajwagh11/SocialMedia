import multer from 'multer';

const storage = multer.memoryStorage(); //not be saved to disk

const uploadFile = multer({ storage }).single("file");

export default uploadFile;