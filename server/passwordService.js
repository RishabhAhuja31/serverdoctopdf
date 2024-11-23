import PSPDFKit from 'pspdfkit';  // Assuming you are using PSPDFKit

// Function to apply password protection to the PDF
export async function addPasswordToPDF(inputPath, outputPath) {
    try {
        const pdfDoc = await PSPDFKit.load(inputPath);

        // Set password protection
        await pdfDoc.setPassword({
            userPassword: 'userpassword',
            ownerPassword: 'ownerpassword',
            permissions: {
                printing: 'highResolution',
                modifying: false,
                copying: false,
                annotating: false,
            }
        });

        // Save the protected PDF
        await pdfDoc.save(outputPath);
        console.log('PDF saved with password protection.');
    } catch (error) {
        console.error("Error applying password protection:", error);
    }
}
