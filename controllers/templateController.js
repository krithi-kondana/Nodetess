const tesseract = require ('node-tesseract-ocr');
const PDF2Pic = require("pdf2pic");
const util = require('util');
const path = require('path');
const sharp = require('sharp');
const Jimp = require('jimp');

class TemplateController
{
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
    static async extractData(username,templates,socketId,io)
    {
        let originalTemplates = await TemplateController.getTemplateNameIdentifier();

        for(let i=0;i<templates.length;i++)
        {
            let templatesDir =path.join(__dirname,'..',templates[i].destination);
            let pdf2pic = new PDF2Pic({
                density: 800,           // output pixels per inch
                savename:  templates[i].originalname.substr(0, templates[i].originalname.length-4),   // output file name
                savedir: path.join(templatesDir,"/titleimages"),    // output file location
                format: "jpg",          // output file format
                size:'5000x5000'
              });
              pdf2pic.convert(templatesDir + templates[i].originalname).then((resolve)=>
              {
                  let originalImage = resolve.path;

                // file name for cropped image
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
                              const config = {
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
                                        //console.log(lines[k]);
                                        if(lines[k].match(originalTemplates[n].ttext)!==null)
                                        {
                                            outputImage = outputImage.substr(0,outputImage.length-26)+'.pdf';
                                            io.sockets.connected[socketId].emit('templateIdentified',{company:originalTemplates[n].company_name,file:outputImage});
                                            return;
                                        }
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
              });
        }
    }
    static async identifyTemplate(username,templates,socket)
    {
        let originalTemplates = await TemplateController.getTemplateNameIdentifier();

        // console.log(username);
        for(let i=0;i<templates.length;i++)
        {
            let templatesDir =path.join(__dirname,'..',templates[i].destination);
            let pdf2pic = new PDF2Pic({
                density: 800,           // output pixels per inch
                savename:  templates[i].originalname.substr(0, templates[i].originalname.length-4),   // output file name
                savedir: path.join(templatesDir,"/titleimages"),    // output file location
                format: "jpg",          // output file format
                size:'5000x5000'
              });
              pdf2pic.convert(templatesDir + templates[i].originalname).then((resolve)=>
              {
                  let originalImage = resolve.path;

                // file name for cropped image
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
                            // Jimp.read(outputImage, (err, newImage) => {
                            //     if (err) throw err;
                            //     newImage
                            //       .greyscale()
                            //       .contrast(1)
                            //       .write(outputImage);
                                  
                            //   });
                              const config = {
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
                                        //console.log(lines[k]);
                                        if(lines[k].match(originalTemplates[n].ttext)!==null)
                                        {
                                            outputImage = outputImage.substr(0,outputImage.length-26)+'.pdf';
                                            socket.emit('templateIdentified',{company:originalTemplates[n].company_name,file:outputImage});
                                            return;
                                        }
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

                //   Jimp.read(resolve.path, (err, image) => {
                //       console.log(image);
                //   });
              });
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
        }
        // console.log(socketId);
    }
    static async getTemplateNameIdentifier(res)
    {
        try
        {
            return new Promise((resolve,reject)=>
            {
                global.sqlCon.query("SELECT\
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
            global.sqlCon.query("INSERT INTO luitel.templatenameidentifier ("+keyString+") VALUES ("+valueString+")",valuesArray,
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