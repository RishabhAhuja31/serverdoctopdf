
const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
const port = 3000;

app.use(cors());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

app.post('/convertFile', upload.single('file'), (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded"
            });
        }

        // Define the output file path
        let outputPath = path.join(__dirname, "files", `${req.file.originalname.replace('.docx', '')}.pdf`);

        // Use the correct path to LibreOffice's soffice binary on macOS
        exec(`/Applications/LibreOffice.app/Contents/MacOS/soffice --headless --convert-to pdf --outdir ${path.join(__dirname, 'files')} ${req.file.path}`, (err, stdout, stderr) => {
            if (err || stderr) {
                console.log("Error:", err || stderr);
                return res.status(500).json({
                    message: "Error converting DOCX to PDF"
                });
            }

            // After conversion, send the file for download
            res.download(outputPath, (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        message: "Error downloading the file"
                    });
                }

                // Clean up the uploaded DOCX file after conversion
                fs.unlink(req.file.path, (err) => {
                    if (err) console.log("Error deleting the uploaded file:", err);
                });

                console.log("File Downloaded");
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});