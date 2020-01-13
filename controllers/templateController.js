const tesseract = require ('node-tesseract-ocr');
const PDF2Pic = require("pdf2pic");
const util = require('util');
const path = require('path');
const sharp = require('sharp');
const Jimp = require('jimp');
const fs = require('fs');

class TemplateController
{
    static dbReadTemplate(templateId)
    {
        // it also contains the rules
        try
        {
            return new Promise((resolve,reject)=>
            {
                sqlCon.query("SELECT\
                company_name,\
                ttext,\
                twidth,\
                theight,\
                tleft,\
                ttop,\
                templateHeight,\
                templateWidth\
                FROM luitel.templatenameidentifier",
                    (err2,jResult) =>
                    {
                        if(err2)
                        {
                            console.log(err2);
                        }
                        else
                        {
                            resolve(jResult);
                        }
                    }
                );
            });
        }
        catch(err)
        {
            console.log(err);
            if(res)
            {
                return res.status(500).send(
                {
                    "message":"Error !",
                    "code":500
                });
            }
            else
            {
                return {
                    "message":"Error !",
                    "code":500
                };
            }
        }
    }
    static dbReadAllTemplateTitleAreas()
    {
        try
        {
            return new Promise((resolve,reject)=>
            {
                sqlCon.query("SELECT\
                company_name,\
                ttext,\
                twidth,\
                theight,\
                tleft,\
                ttop,\
                templateHeight,\
                templateWidth\
                FROM luitel.templatenameidentifier",
                    (err2,jResult) =>
                    {
                        if(err2)
                        {
                            console.log(err2);
                        }
                        else
                        {
                            resolve(jResult);
                        }
                    }
                );
            });
        }
        catch(err)
        {
            console.log(err);
            if(res)
            {
                return res.status(500).send(
                {
                    "message":"Error !",
                    "code":500
                });
            }
            else
            {
                return {
                    "message":"Error !",
                    "code":500
                };
            }
        }
    }
    static randomAlphabetString(length)
    {
        let alphabet = 'abcdefghijklmnopqsrtuv123456789';
        let final='';
        for(let i=0;i<length;i++)
        {
            final += alphabet[Math.floor(Math.random()*alphabet.length)];
        }
        return final;
    }
    static async filterGarbage()
    {

    }
    static async extractData(initialFilePath,initialFilename,companyId,socket)
    {
        //zoneTemplates
        let savingDir = initialFilePath.split('\\');
        savingDir.pop();
        savingDir= savingDir.join('\\');
        console.log(savingDir);

        let pdf2pic = new PDF2Pic({
            density: 800,           // output pixels per inch
            savename:  TemplateController.getFilename(initialFilename)+Math.floor(Math.random()*1000),   // output file name
            savedir: path.join(savingDir,"/zoneimages"),    // output file location
            format: "jpg",          // output file format
            size:'5000x5000'
        });

        pdf2pic.convertBulk(initialFilePath,-1).then((resolve) => 
        {
            
            let zone;
            for(let j=0;j<zoneTemplates.length;j++)
            {
                if(zoneTemplates[j].company_id === companyId)
                {
                    zone = zoneTemplates[j];
                    break;
                }
            }
            if(resolve.length)
            {
                for(let i =0;i<resolve.length;i++)
                {
                    let outputImage = TemplateController.getFilename(initialFilename) +Math.floor(Math.random()*1000)+".jpg";
                    if (!fs.existsSync(path.join(savingDir,"/zoneimages/zones")))
                    {
                        fs.mkdirSync(path.join(savingDir,"/zoneimages/zones"));
                    }
                    sharp(resolve[i].path)
                    .extract({ 
                        width: Number(zone.twidth)*5,
                        height: Number(zone.theight)*5,
                        left: Number(zone.tleft)*5,
                        top: Number(zone.ttop)*5 
                    })
                    .toFile(path.join(savingDir,"/zoneimages/zones",outputImage))
                    .then(function(new_file_info) 
                    {
                        const config = 
                        {
                            lang: "dan",
                            oem: 1,
                            psm: 4
                        };
                        tesseract.recognize(path.join(savingDir,"/zoneimages/zones",outputImage), config)
                        .then(text => 
                        {
                            for(let z=0;z<companies.length;z++)
                            {
                                if(companies[z].id === companyId)
                                {
                                    console.log(text.split('\n'));
                                    RuleParser.rules[companies[z].company_name](text.split('\n'),[],i);
                                    break;
                                }
                            }
                        })
                        .catch(error => {
                            console.log(error.message)
                        })
                    })
                    .catch(function(err) {
                        console.log(err);
                    });
                }
            }
            else
            {
                let outputImage = TemplateController.getFilename(initialFilename) +Math.floor(Math.random()*1000)+".jpg";
                if (!fs.existsSync(path.join(savingDir,"/zoneimages/zones",outputImage)))
                {
                    fs.mkdirSync(path.join(savingDir,"/zoneimages/zones",outputImage));
                }
                sharp(resolve.path)
                .extract({ 
                    width: Number(zone.twidth),
                    height: Number(zone.theight),
                    left: Number(zone.tleft),
                    top: Number(zone.ttop) 
                })
                .toFile(path.join(savingDir,"/zoneimages/zones",outputImage))
                .then(function(new_file_info) 
                {
                    const config = 
                    {
                        lang: "dan",
                        oem: 1,
                        psm: 1
                    };
                    tesseract.recognize(path.join(savingDir,"/zoneimages/zones",outputImage), config)
                    .then(text => {
                        console.log("Result:", text.split('\n'));
                    })
                    .catch(error => {
                        console.log(error.message)
                    })
                })
                .catch(function(err) {
                    console.log(err);
                });
            }


        });
        // pdf2pic.convert(initialFilePath).then((resolve)=>
        // {
        //     let originalImage = resolve.path;
        //     for(let j=0;j<originalTemplates.length;j++)
        //     {
        //         let outputImage = originalImage.substr(0,originalImage.length-4)+TemplateController.randomAlphabetString(20)+ '.jpg';
        //         sharp(originalImage)
        //         .extract(
        //         { 
        //             width: Number(originalTemplates[j].twidth*5),
        //             height: Number(originalTemplates[j].theight*5),
        //             left: Number(originalTemplates[j].tleft*5),
        //             top: Number(originalTemplates[j].ttop *5) 
        //         })
        //         .toFile(outputImage)
        //         .then(function(new_file_info) 
        //         {
        //             const config = 
        //             {
        //                 lang: "dan",
        //                 oem: 1,
        //                 psm: 1
        //             }
        //             tesseract.recognize(outputImage, config)
        //             .then(text => {
        //                 let lines =text.split('\n');
        //                 for(let k=0;k<lines.length;k++)
        //                 {
        //                     for(let n=0;n<originalTemplates.length;n++)
        //                     {
        //                         if(lines[k].match(originalTemplates[n].ttext)!==null)
        //                         {
        //                             let companyId = originalTemplates[n].company_id;
        //                             outputImage = outputImage.substr(0,outputImage.length-26)+'.pdf';
        //                             socket.emit('templateIdentified',
        //                             {
        //                                 company:originalTemplates[n].company_name,
        //                                 file:outputImage
        //                             });
        //                             TemplateController.extractData(initialFilePath,companyId,socket);
        //                             return;
        //                         }
        //                     }
        //                 }
        //             })
        //         })
        //         .catch(function(err) {
        //             console.log(err);
        //         });
        //         }
        // })

    }
    static getTemplateRules()
    {
        try
        {
            return new Promise((resolve,reject)=>
            {
                global.sqlCon.query("SELECT\
                id,\
                company_id,\
                rule,\
                fieldname,\
                tablename\
                FROM luitel.templaterules",
                    (err2,jResult) =>
                    {
                        if(err2)
                        {
                            console.log(err2);
                        }
                        else
                        {
                            resolve(jResult);
                        }
                    }
                );
            });
        }
        catch(err)
        {
            console.log(err);
            if(res)
            {
                return res.status(500).send(
                {
                    "message":"Error !",
                    "code":500
                });
            }
            else
            {
                return {
                    "message":"Error !",
                    "code":500
                };
            }
        }
    }
    static getExtension(filename)
    {
        let parts = filename.split('.');
        return parts[1];
    }
    static getFilename(filename)
    {
        let parts =filename.split('.');
        return parts[0];
    }
    static async readZoneAndIdentifyTemplate(initialFilePath,initialFilename,outputImage,socket)
    {
        const config = 
        {
            lang: "dan",
            oem: 1,
            psm: 1
        }
        tesseract.recognize(outputImage, config)
        .then(text => {
            
            let lines =text.split('\n');
            for(let k=0;k<lines.length;k++)
            {
                for(let n=0;n<originalTemplates.length;n++)
                {
                    if(lines[k].match(originalTemplates[n].ttext)!==null)
                    {
                        let companyId = originalTemplates[n].company_id;
                        outputImage = outputImage.substr(0,outputImage.length-26)+'.pdf';
                        socket.emit('templateIdentified',
                        {
                            company:originalTemplates[n].company_name,
                            file:outputImage
                        });
                        TemplateController.extractData(initialFilePath,initialFilename,companyId,socket);
                        return;
                    }
                }
            }
        })
        .catch(error => {
            console.log(error.message)
        })
    }
    static async generateImageForPDF(jInvoice,sInvoicesDir,socket)
    {
        let pdf2pic = new PDF2Pic({
            density: 800,           // output pixels per inch
            savename:  TemplateController.getFilename(jInvoice.originalname),   // output file name
            savedir: path.join(sInvoicesDir,"/titleimages"),    // output file location
            format: "jpg",          // output file format
            size:'5000x5000'
        });
        let initialFilePath = sInvoicesDir + jInvoice.originalname;
        pdf2pic.convert(initialFilePath).then((resolve)=>
        {
            let originalImage = resolve.path;
            console.log(originalImage);
            for(let j=0;j<originalTemplates.length;j++)
            {
                let outputImage = originalImage.substr(0,originalImage.length-4)+TemplateController.randomAlphabetString(20)+ '.jpg';
                sharp(originalImage)
                .extract(
                { 
                    width: Number(originalTemplates[j].twidth*5),
                    height: Number(originalTemplates[j].theight*5),
                    left: Number(originalTemplates[j].tleft*5),
                    top: Number(originalTemplates[j].ttop *5) 
                })
                .toFile(outputImage)
                .then(function(new_file_info) 
                {
                    TemplateController.readZoneAndIdentifyTemplate(initialFilePath,jInvoice.originalname,outputImage,socket);
                })
                .catch(function(err) {
                    console.log(err);
                });
                }
        })
    }
    static async identifyInvoiceBasedOnTemplates(sUsername,aInvoices,socket)
    {
        try
        {
            for(let i=0;i<aInvoices.length;i++)
            {
                let sInvoicesDir = path.join(__dirname,'..',aInvoices[i].destination);
                // creating preview images
                InvoiceController.generateInvoicePreview(aInvoices[i], sInvoicesDir, socket);
                TemplateController.generateImageForPDF(aInvoices[i],sInvoicesDir,socket);
            }
        }
        catch(err)
        {
            console.log(err);
        }






            //   for(let i=0;i<templates.length;i++)
            //   {
            //     let templatesDir =path.join(__dirname,'..',templates[i].destination);
            //     const pdf2picFull = new PDF2Pic({
            //         density: 800,           // output pixels per inch
            //         savename:  TemplateController.getFilename(templates[i].originalname),   // output file name
            //         savedir: path.join(templatesDir,"/full-images/"+TemplateController.getFilename(templates[i].originalname)),    // output file location
            //         format: "jpg",          // output file format
            //         size:'5000x5000'
            //       });
                   
            //       pdf2picFull.convertBulk(templatesDir + templates[i].originalname, -1).then((resolve) => {
            //         console.log(resolve);

            //       });
            //   }


            /*
              {
                fieldname: 'invoices[]',
                originalname: 'Faktura 00374866 .pdf',
                encoding: '7bit',
                mimetype: 'application/pdf',
                destination: 'saved-invoices/Clauzzz/temp/',
                filename: 'Faktura 00374866 .pdf',
                path: 'saved-invoices\\Clauzzz\\temp\\Faktura 00374866 .pdf',
                size: 187598
            }, 
            */
        
        // console.log(socketId);
    }
    static async getTemplateZones(res)
    {
        try
        {
            let type = 'zone';
            return new Promise((resolve,reject)=>
            {
                sqlCon.query("SELECT\
                company_id,\
                twidth,\
                theight,\
                tleft,\
                ttop,\
                templateHeight,\
                templateWidth\
                FROM luitel.templatenameidentifier\
                WHERE fieldType = '"+type+"'",
                    (err2,jResult) =>
                    {
                        if(err2)
                        {
                            console.log(err2);
                        }
                        else
                        {
                            resolve(jResult);
                        }
                    }
                );
            });
        }
        catch(err)
        {
            console.log(err);
            if(res)
            {
                return res.status(500).send(
                {
                    "message":"Error !",
                    "code":500
                });
            }
            else
            {
                return {
                    "message":"Error !",
                    "code":500
                };
            }
        }
    }
    static async getTemplateNameIdentifier(res)
    {
        try
        {
            let type = 'company';
            return new Promise((resolve,reject)=>
            {
                sqlCon.query("SELECT\
                company_id,\
                company_name,\
                ttext,\
                twidth,\
                theight,\
                tleft,\
                ttop,\
                templateHeight,\
                templateWidth\
                FROM luitel.templatenameidentifier\
                WHERE fieldType = '"+type+"'",
                    (err2,jResult) =>
                    {
                        if(err2)
                        {
                            console.log(err2);
                        }
                        else
                        {
                            resolve(jResult);
                        }
                    }
                );
            });
        }
        catch(err)
        {
            console.log(err);
            if(res)
            {
                return res.status(500).send(
                {
                    "message":"Error !",
                    "code":500
                });
            }
            else
            {
                return {
                    "message":"Error !",
                    "code":500
                };
            }
        }
    }
    static saveTemplateNameIdentifier(jEntry,res)
    {
        try
        {
            let keyString="";
            let valueString="";
            let valuesArray=[];
            let i;
            let keys=Object.keys(jEntry);
            let n=keys.length;
        
            for(i=0;i<n-1;i+=1)
            {
                keyString+=keys[i]+",";
                valueString+="?,";
                valuesArray.push(jEntry[keys[i]]);
            }
        
            keyString+=keys[i];
            valueString+="?";
            valuesArray.push(jEntry[keys[i]]);
            sqlCon.query("INSERT INTO luitel.templatenameidentifier ("+keyString+") VALUES ("+valueString+")",valuesArray,
                (err2,jResult) =>
                {
                    if(err2)
                    {
                        console.log(err2);
                        if(res)
                        {
                            return res.status(500).send(
                                {
                                    "message":"Entry couldn't be added !",
                                    "code":500
                                });
                        }
                    }
                    else
                    {
                        if(res)
                        {
                            return res.status(200).send(
                            {
                                "message":"Entry added succesfully !",
                                "code":200
                            });
                        }
                    }
                }
            );
        }
        catch(err)
        {
            console.log(err);
            if(res)
            {
                return res.status(500).send(
                {
                    "message":"Error !",
                    "code":500
                });
            }
        }
    }
}
module.exports = TemplateController;