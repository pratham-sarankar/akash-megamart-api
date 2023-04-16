import multer from 'multer';

const upload = multer({dest: 'uploads/'});
export default class MulterMiddleware {
    public static uploader = upload.single('file');
}

