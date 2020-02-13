class RuleParser
{
    static unitelParser = require('./specificRuleParsers/parser-unitel.js');
    static telavoxParser = require('./specificRuleParsers/parser-telavox.js');
    static tdcParser = require('./specificRuleParsers/parser-tdc.js');
    static teliaParser = require('./specificRuleParsers/parser-telia.js');
    static firmafonParser = require('./specificRuleParsers/parser-firmafon.js');
    static flexfoneParser = require('./specificRuleParsers/parser-flexfone.js');
    static fullrateParser = require('./specificRuleParsers/parser-fullrate.js');
    static globalconnectParser = require('./specificRuleParsers/parser-globalConnect.js');
    static ipvisionParser = require('./specificRuleParsers/parser-ipvision.js');
    static rules =
    {
        "unitel":RuleParser.unitelParser.parse,
        "telavox":RuleParser.telavoxParser.parse,
        "tdc":RuleParser.tdcParser.parse,
        "telia":RuleParser.teliaParser.parse,
        "firmafon":RuleParser.firmafonParser.parse,
        "flexfone":RuleParser.flexfoneParser.parse,
        "fullrate":RuleParser.fullrateParser.parse,
        "globalConnect":RuleParser.globalconnectParser.parse,
        "ipvision":RuleParser.ipvisionParser.parse
    };
    static parseInitializeDocument (data)
    {
        if(!connections[data.socketId].processing)
        {
            connections[data.socketId].processing = {};
        }
        let document =
        {
            initialFilePath:data.initialFilePath,
            initialFilename:data.initialFilename,
            companyId:data.companyId,
            pages:data.pages,
            socketId:data.socketId,
            rules:data.rules,
            processed:[]
        };
        connections[data.socketId].processing[data.initialFilename]=document;
    };
    static parseAddToDocument(data)
    {
        let processedFile = connections[data.socketId].processing[data.initialFilename];
        processedFile.processed[data.page] = data;
        let finishedProcessing = true;
        for(let i=0;i<processedFile.pages;i++)
        {
            if(!processedFile.processed[i])
            {
                finishedProcessing = false;
                break;
            }
        }
        if(finishedProcessing)
        {
            let fileProcessed = 
            {
                initialFilename:data.initialFilename,
                socketId: data.socketId
            }
            RuleParser.parseDocument(fileProcessed);
        }
    }
    static parseDocument (data)
    {
        let file = connections[data.socketId].processing[data.initialFilename];
        file.processed.sort(this.compare);
        file.rules.sort(this.compareRules);
        let response = 
        {
            initialFilename: data.initialFilename,
        };
        for(let i=0;i<file.processed.length;i++)
        {
            for(let j=0;j<file.processed[i].text.length;j++)
            {
                let line = file.processed[i].text[j];
                let unknown = true;
                for(let k=0;k<file.rules.length;k++)
                {

                    let rule = file.rules[k];
                    let match = line.match(new RegExp(rule.rule));
                    if(match && rule.field_id)
                    {
                        for(let n=0;n<masterlist.length;n++)
                        {
                            if(masterlist[n].id == rule.field_id && masterlist[n].major)
                            {
                                if(rule.value_count)
                                {
                                    if(response[masterlist[n].name])
                                    {
                                        response[masterlist[n].name]+=Number(match[0]);
                                    }
                                    else
                                    {
                                        response[masterlist[n].name]=Number(match[0]);
                                    }
                                }
                                else
                                {
                                    if(response[masterlist[n].name])
                                    {
                                        response[masterlist[n].name]+=1;
                                    }
                                    else
                                    {
                                        response[masterlist[n].name]=1;
                                    }
                                }
                                break;
                            }
                        }
                        break;
                    }
                }
            }
        }
        io.sockets.connected[data.socketId].emit('data-extracted',response);
    }
    static compareRules( a, b ) 
    {
        if ( a.priority < b.priority ){
            return 1;
        }
        if ( a.priority > b.priority ){
            return -1;
        }
        return 0;
    }
    static comparePage( a, b ) 
    {
        if ( a.page < b.page ){
            return -1;
        }
        if ( a.page > b.page ){
            return 1;
        }
        return 0;
    }
}
module.exports = RuleParser;