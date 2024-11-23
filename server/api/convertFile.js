const multer = require("multer");
const path = require("path");
const { exec } = require("child_process");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/tmp/uploads');  // Vercel uses `/tmp` for temporary storage
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

module.exports = async (req, res) => {
    // Allow CORS by adding the necessary headers
    res.setHeader('Access-Control-Allow-Origin', '*');  // Allow all origins
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow these HTTP methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow these headers

    // If the method is OPTIONS (preflight request), return a 200
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Handle only POST requests for file conversion
    if (req.method === 'POST') {
        // Use Multer to handle file upload
        upload.single('file')(req, res, function (err) {
            if (err) {
                return res.status(400).json({ message: "Error uploading file" });
            }

            if (!req.file) {
                return res.status(400).json({ message: "No file uploaded" });
            }

            const filePath = req.file.path;
            const outputDir = '/tmp/files';  // Vercel’s `/tmp` directory for output files
            const outputPath = path.join(outputDir, `${req.file.originalname.replace('.docx', '')}.pdf`);

            // Ensure the output directory exists
            fs.mkdirSync(outputDir, { recursive: true });

            // Run LibreOffice command to convert the file
            exec(`/usr/bin/soffice --headless --convert-to pdf --outdir ${outputDir} ${filePath}`, (err, stdout, stderr) => {
                if (err || stderr) {
                    console.log("Error:", err || stderr);
                    return res.status(500).json({ message: "Error converting DOCX to PDF" });
                }

                // Send the converted file as the response
                res.download(outputPath, (err) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ message: "Error downloading the file" });
                    }

                    // Clean up the uploaded DOCX file after conversion
                    fs.unlink(filePath, (err) => {
                        if (err) console.log("Error deleting the uploaded file:", err);
                    });

                    // Clean up the PDF file after sending
                    fs.unlink(outputPath, (err) => {
                        if (err) console.log("Error deleting the PDF file:", err);
                    });

                    console.log("File Downloaded");
                });
            });
        });
    } else {
        // If the method is not POST, return a 405 Method Not Allowed
        res.status(405).json({ message: "Method Not Allowed" });
    }
};
