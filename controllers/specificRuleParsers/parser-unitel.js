let parser =
{
    // parse:function(filename,text,rules,socket)
    // {
    //     function compare( a, b ) 
    //     {
    //         if ( a.priority < b.priority ){
    //             return -1;
    //         }
    //         if ( a.priority > b.priority ){
    //             return 1;
    //         }
    //         return 0;
    //     }
    //     let response = {
    //         'filename':filename,
    //         'unidentified':0,
    //         'identified':0
    //     };
    //     rules.sort( compare );
    //     for(let j=0;j<text.length;j+=1)
    //     {
    //         let identified = false;
    //         for(let k=0;k<rules.length;k+=1)
    //         {
    //             if(text[j].match(rules[k].rule))
    //             {
    //                 response[rules[k].fieldname]+=1;
    //                 identified = true;
    //                 break;
    //             }
    //         }
    //         if(identified)
    //         {
    //             response.identified+=1;
    //         }
    //     }

    //     socket.emit('invoice-data-extracted', response );
    // }
}
module.exports = parser;