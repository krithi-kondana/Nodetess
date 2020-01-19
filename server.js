const tesseract = require ('node-tesseract-ocr');
const PDF2Pic = require("pdf2pic");
const express = require('express');
const server = express();
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const socketIo = require('socket.io');
const mysql = require('mysql');
const ioServer = require('http').Server(server);
const gm = require('gm');
global.io = require('socket.io')(ioServer);
const Jimp = require('jimp');
const port = 9000;
const ioPort = 9001;
global.connections = [];


/*
    Controllers
*/

/*

    Get all 
    Upload files =>
    Identify the template =>
    Get each page and crop the important parts =>
    OCR each of the parts =>
    based on the rules from the db figure out whats what =>
    save 


*/
global.MasterlistController= require('./controllers/masterlistController');
global.TemplateController = require('./controllers/templateController');
global.PDFController = require('./controllers/pdfController');
global.RuleController = require('./controllers/ruleController');
global.InvoiceController = require('./controllers/invoiceController');
global.CompanyController = require('./controllers/companyController');
global.RuleParser = require('./controllers/ruleParser');

global.originalTemplates = null;
global.zoneTemplates = null;
global.companies = null;
global.masterlist = null;
global.templateRules = [];
global.db=null; 
global.sqlCon=null;

let mysqlcon = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
});
mysqlcon.connect(async(err)=> 
{
    if (err) 
    { 
        console.log('Cannot connect to the MySQL database');
        return false;
    }
    else
    {
        sqlCon=mysqlcon;
        originalTemplates = await TemplateController.getTemplateNameIdentifier();
        zoneTemplates = await TemplateController.getTemplateZones();
        companies = await CompanyController.getCompanies();
        masterlist = await MasterlistController.dbReadAll();
        if(companies.length)
        {
            temporaryRules = await TemplateController.getTemplateRules();
            for(let i=0;i<temporaryRules.length;i++)
            {
                if(!templateRules.length)
                {
                    templateRules.push([]);
                    templateRules[0].push(temporaryRules[i]);
                }
                else
                {
                    let added = false;
                    for(let j=0;j<templateRules.length;j++)
                    {
                        if(templateRules[j][0].company_id === temporaryRules[i].company_id)
                        {
                            templateRules[j].push(temporaryRules[i]);
                            added = true;
                            break;
                        }
                    }
                    if(!added)
                    {
                        templateRules.push([]);
                        templateRules[templateRules.length-1].push(temporaryRules[i]);
                    }
                }
            }
        }
    }
});

io.on('connection', (socket) =>
{
    // I need to store the socket id regardless, cause they still need to see the articles

    let newSocket =
    {
        'id':socket.id
    }
    console.log('Somebody connected !'+socket.id);
    connections[socket.id] = newSocket;

    socket.on('identify-template',(data)=>
    {
        TemplateController.extractData(data.initialFilePath,data.initialFilename,data.companyId,socket);
    });
    socket.on('disconnect',() =>
    {
        // After a client disconnects, we remove him from the array.

        try
        {
            delete connections[socket.id];
            console.log('Somebody disconnected !' + socket.id);
            console.log(connections);
            
        }
        catch(err)
        {
            // logger.error(err);
        }
    });
});
ioServer.listen(ioPort);

/*
=====================================================================================
    #Controllers
=====================================================================================
*/



var storage = multer.diskStorage(
{
    destination: function (req, file, cb) 
    {
        try
        {
            let user = req.body.username;
            let finaldir = 'saved-invoices/'+user + '/';
            if (!fs.existsSync(finaldir))
            {
                fs.mkdirSync(finaldir);
            }
            finaldir += "temp/";
            if (!fs.existsSync(finaldir))
            {
                fs.mkdirSync(finaldir);
            }
            cb(null, finaldir);
        }
        catch(err)
        {
            console.log(err);
        }
    },
    filename: function (req, file, cb) 
    {
        try
        {
            let originalFileName = file.originalname.match(/[^\.]*/);
            let extension = file.originalname.match(/\..*/g);
            extension = extension[0];
            cb(null,originalFileName + extension); //Appending .jpg
        }
        catch(err)
        {
            console.log(err);
        }
    }
})

var upload = multer({storage:storage});


server.use(cors());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

let mime = {
    jpg: 'image/jpeg',
    png: 'image/png',
    pdf: 'application/pdf'
};

server.get('/get-preview-image/:username/:filename', function (req, res) {
    try
    {
        console.log(req.params.username);
        var file = path.join(__dirname, 'saved-invoices/'+req.params.username+'/temp/preview-images/'+req.params.filename);
        var type = mime[path.extname(file).slice(1)];
        var s = fs.createReadStream(file);
        s.on('open', function () {
            res.set('Content-Type', type);
            s.pipe(res);
        });
        s.on('error', function () {
            res.set('Content-Type', 'text/plain');
            res.status(404).end('Not found');
        });
    }
    catch(err)
    {
        console.log(err);
        return res.status(500).send({"message":"Internal Server Error!"});
    }

});

server.get('/upload-image-preview',(req,res)=>
{
    /*  
        req.body.username
        req.body.filename
    */
});
server.post('/upload-invoice',upload.array('invoices[]'),(req,res)=>
{
    try
    {
        TemplateController.identifyInvoiceBasedOnTemplates(req.body.username,req.files,io.sockets.connected[req.body.socketId]);
        return res.status(200).send({message:"Uploaded successfuly!"});
    }
    catch(err)
    {
        console.log(err);
        return res.status(500).send({message:"Something happened!"});
    }

});

server.post('/delete-temp-invoice',(req,res)=>
{
    console.log(req.body);
    
    try
    {
        fs.unlink(__dirname + '/saved-invoices/'+req.body.username+'/temp/'+req.body.file, (err) => {
            if (err)
            {
                throw err;
            } 
          });
        res.status(200).send({message:"yo"});
    }
    catch(err)
    {
        res.status(500).send({message:"nope"});
        console.log(err);
    }

});
server.listen(port,()=>
{
    console.log('Server started on port '+ port);
});


const sharp = require('sharp');

// original image


// pdf2pic.convertBulk("faktura2.pdf",-1).then((resolve) => {
//     console.log("image converter successfully!");
    

//     let originalImage = '1_1.jpg';

// // file name for cropped image
//     let outputImage = 'croppedImage.jpg';

//     sharp(originalImage)
//     .extract({ width: 1221, height: 597, left: 2169, top: 1149 })
//     .toFile(outputImage)
//     .then(function(new_file_info) 
//     {
//         console.log("Image cropped and saved");
//         tesseract.recognize("croppedImage.jpg", config)
//         .then(text => {
//             console.log("Result:", text.split('\n'));
//         })
//         .catch(error => {
//             console.log(error.message)
//         })
//     })
//     .catch(function(err) {
//         console.log("An error occured");
//     });

// });

function jimpReadFiles(path,file)
{
    Jimp.read(path+file, (err, image) => {
        let w =image.bitmap.width;
        let h =image.bitmap.height;
        console.log("Width ", w);
        console.log("Height: ",h);
        let localMaxX =0;
        let localMaxY =0;
        let localMinX = 1500;
        let localMinY = 1500;
        for(let j=0;j<w;j++)
        {
            for(let k=0;k<h;k++)
            {
                let color =Jimp.intToRGBA(image.getPixelColor(j, k));
                if(color.r===237 && color.g===28 && color.b===36)
                {
                    if(j<localMinX)
                    {
                        localMinX = j;
                    }
                    if(j>localMaxX)
                    {
                        localMaxX = j;
                    }
                    if(k<localMinY)
                    {
                        localMinY = k;
                    }
                    if(k>localMaxY)
                    {
                        localMaxY = k;
                    }
                }
            }
        }
        console.log(file+"  : width:  " + (localMaxX-localMinX) +"  height:  " + (localMaxY - localMinY)  +"  left:  " +  localMinX +"  top:  " + localMinY );
    });
}

// function basedOnTemplate(templa te)
// {

// }
function generateAreaForCustomerName()
{

}
function generateAreasForTemplateInfo()
{

}
function generateTextTemplates()
{
    try
    {
        let templatesDir =__dirname + "/templates/zoneimages/";
        fs.readdir(templatesDir,(err,files)=>
        {
            for(let i =0;i<files.length;i++)
            {
                jimpReadFiles(templatesDir,files[i]);
            }
        })
    }
    catch(err)
    {
        console.log(err);
    }
}
//generateTextTemplates();
function generatezoneTemplates()
{
    try
    {
        let templatesDir =__dirname + "/templates";
        fs.readdir(templatesDir+ "/pdf",(err,files)=>
        {
            for(let i =0;i<files.length;i++)
            {
                const pdf2pic = new PDF2Pic({
                    density: 800,           // output pixels per inch
                    savename: files[i].substr(0,files[i].length-4),   // output file name
                    savedir: "./templates/zoneimages/",    // output file location
                    format: "png",          // output file format
                    size:'1000x1000'
                  });
                pdf2pic.convert(templatesDir + "/pdf/"+files[i]).then((resolve)=>
                {
                    Jimp.read(resolve.path, (err, image) => {
                        console.log(image);
                    });
                });
            }
            
        })
    }
    catch(err)
    {
        console.log(err);
    }
}

/*
        let templates =[
            {
                id:1,
                title:'Flexfone',
                name:'flexfone',
                width: 172,
                height:65,
                left:475,
                top:1,
                tw:707,
                th:1000
            },
            {
                id:2,
                title:'Firmafon',
                name:'firmafon',
                width: 233,
                height:83,
                left:447,
                top:9,
                tw:707,
                th:1000
            },
            {
                id:3,
                title:'Fullrate',
                name:'fullrate',
                width: 117,
                height:26,
                left:545,
                top:40,
                tw:707,
                th:1000
            },
            {
                id:4,
                title:'Global Connect',
                name:'globalconnect',
                width: 166,
                height:37,
                left:476,
                top:76,
                tw:707,
                th:1000
            },
            {
                id:5,
                title:'Telavox',
                name:'telavox',
                width: 309,
                height:74,
                left:20,
                top:15,
                tw:707,
                th:1000
            },
            {
                id:6,
                title:'Tdc',
                name:'tdc',
                width: 39,
                height:17,
                left:91,
                top:73,
                tw:707,
                th:1000
            },
            {
                id:7,
                title:'Telia',
                name:'telia',
                width: 35,
                height:17,
                left:521,
                top:387,
                tw:739,
                th:1000
            },
            {
                id:8,
                title:'Ipvision',
                name:'ipvision',
                width: 175,
                height:54,
                left:447,
                top:52,
                tw:707,
                th:1000
            }
        ];
        for(let i=0;i<templates.length;i++)
        {
            let jEntry={
                company_name:templates[i].title,
                ttext:templates[i].name,
                twidth:templates[i].width,
                theight:templates[i].height,
                tleft:templates[i].left,
                ttop:templates[i].top,
                templateHeight:templates[i].th,
                templateWidth:templates[i].tw
                
            }
            TemplateController.saveTemplateNameIdentifier(jEntry);


            // Unitel
        let jEntry={
            company_name:'Unitel',
            ttext:'uni-tel',
            twidth:145,
            theight:49,
            tleft:459,
            ttop:31,
            templateHeight:1000,
            templateWidth:707
            
        }
        TemplateController.saveTemplateNameIdentifier(jEntry);
        }
*/ 





