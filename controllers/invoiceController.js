const tesseract = require ('node-tesseract-ocr');
const PDF2Pic = require("pdf2pic");
const util = require('util');
const path = require('path');
const sharp = require('sharp');
const Jimp = require('jimp');

class InvoiceController
{
    static identifyInvoice(invoice, templates, sUsername, socket)
    {

    }
    static uploadInvoices(aInvoices, sUsername)
    {

    }
    static dbCreate(jInvoice, idUsername)
    {

    }
    static dbUpdate(jInvoice, idInvoice)
    {

    }
    static dbDelete(idInvoice)
    {

    }
    static dbReadAllInvoicesForUser()
    {
        
    }
    static dbReadInvoiceById(idInvoice)
    {
        // there needs to be some sort of validation here
        // as not everybody should allowed to delete an invoice if they know its id
    }
    static readInvoicePreview(invoice,sUsername)
    {

    }
    static async generateInvoicePreview(jInvoice, sInvoicesDir, socket)
    {
        let pdf2picPreviewImages = new PDF2Pic({
            density: 800,           // output pixels per inch
            savename:  global.TemplateController.getFilename(jInvoice.originalname),   // output file name
            savedir: path.join(sInvoicesDir,"/preview-images"),    // output file location
            format: "jpg",          // output file format
            size:'500x500'
        });
        pdf2picPreviewImages.convert(sInvoicesDir + jInvoice.originalname).then((resolve)=>
        {
            socket.emit('image-preview', 
            {   
                imageName:resolve.name, // preview-image filename
                name:jInvoice         // invoice
            });
        }).catch((reject)=>
        {
            console.log(reject);
        });
    }
}
module.exports = InvoiceController;