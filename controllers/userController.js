class UserController 
{
    static createUser (jEntry,res)
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

            sqlCon.query("SELECT id FROM luitel.users WHERE username=? OR cvr=?",[jEntry.username,jEntry.cvr],(err,jResult)=>
            {
                if(jResult.length == 0)
                {
                    sqlCon.query("INSERT INTO luitel.users ("+keyString+") VALUES ("+valueString+")",valuesArray,function (err,jResult)
                    {
                        if(err)
                        {
                            console.log(err);
                            return res.status(500).send(
                            {
                                "message":"Entry couldn't be added !",
                                "code":500
                            });
                        }
                        else
                        {
                            return res.status(200).send(
                            {
                                "message":"Entry added succesfully !",
                                "code":200
                            });
                        }
                    });
                }
                else
                {
                    return res.status(200).send(
                        {
                            "message":"Username / email already existing !",
                            "code":400
                        });
                }
            })
    
            
        }
        catch(err)
        {
          console.log(err);
          return res.status(500).send(
            {
                  "message":"Error !",
                  "code":500
            });
        }
    }
}
module.exports = UserController;