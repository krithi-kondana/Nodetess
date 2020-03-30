const emailSender = require('./emailSenderController');
const jwt = require('jsonwebtoken');
class UserController 
{
    static createUser = (jEntry,unsaltedPassword,res) =>
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
    
            global.sqlCon.query("SELECT user_id FROM luitel.users WHERE cvr=? OR email=?",[jEntry.cvr,jEntry.email],(err,jResult)=>
            {
                if(jResult && jResult.length == 0)
                {
                    global.sqlCon.query("INSERT INTO luitel.users ("+keyString+") VALUES ("+valueString+")",valuesArray,function (err,jResult)
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
                            emailSender.sendAuthenticationEmail(unsaltedPassword,jEntry.email);
                            //res = cookieliciousController.addCookie(res,'key',jwt.sign(jResult.insertId,secrets.jwtSecret)); 
                            return res.status(200).send(
                            {
                                "message":"Entry added succesfully !",
                                "cookie":jwt.sign(jResult[0].user_id,secrets.jwtSecret),
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
    static checkLogin = (req,res) =>
    {
        try
        {
            let key = cookieliciousController.readCookie(req,'key');
            
            if(key)
            {
                let decoded = jwt.verify(key,secrets.jwtSecret);

                if(decoded && decoded == Number(decoded))
                {
                    return res.status(200).send(
                    {
                            "message":"You are already logged in!",
                            "code":1
                    });
                }
                else
                {
                    return res.status(200).send(
                    {
                            "message":"You need to login !",
                            "code":401
                    });
                }
            }
            else
            {
                return res.status(200).send(
                {
                        "message":"You need to login !",
                        "code":401
                });
            }
            

        }
        catch(err)
        {
            return res.status(500).send(
            {
                    "message":"Error !",
                    "code":500
            });
        }
    }
    static logout = (req,res) =>
    {
        try
        {
            res = cookieliciousController.deleteCookie(res,'key');
            return res.status(200).send(
            {
                    "message":"Succesfully logged out !",
                    "code":200
            });
        }
        catch(err)
        {
            return res.status(500).send(
            {
                    "message":"Error !",
                    "code":500
            });
        }
    }
    static login= (jEntry,res)=>
    {
        try
        {
            global.sqlCon.query("SELECT * FROM luitel.users WHERE cvr=? OR email=?",[jEntry.login, jEntry.login],(err,jResult)=>
            {
                if(err)
                {
                    return res.status(500).send({"message":"Error !"});
                }
                else
                { 
                    if(jResult.length==1)
                    {
                        if(jResult[0].password == jEntry.password)
                        {
                            // setting the cookie on the serverside ( httponly ) with the jsonwebtoken signature of the id.

                            //res = cookieliciousController.addCookie(res,'key',jwt.sign(jResult[0].user_id,secrets.jwtSecret)); 
                            return res.status(200).send({"message":'Succesfully logged',"cookie":jwt.sign(jResult[0].user_id,secrets.jwtSecret),"code":200});
                        }
                        else
                        {
                            return res.status(200).send({"message":"Invalid username/password !","code":401});
                        }
                    }
                    else
                    {
                        return res.status(200).send({"message":"Invalid username/password !","code":401});
                    }
                }
            });
        }
        catch(err)
        {
            return res.status(200).send(
            {
                    "message":"Error !",
                    "code":500
            });
        }
    }
    static activateAccount= (activeK,res)=>
    {
        try
        {
            global.sqlCon.query("UPDATE luitel.users SET activated=1 WHERE activationKey=? AND activated=0",[activeK],(err,jResult)=>
            {
            if(err)
            {
                return res.status(500).send({"message":"Error !"});
            }
            else
            { 
                
                //res = cookielicious.addCookie(res,'key',jwt.sign(jResult[0].id,hashSecret.jwtSecret)); 
                return res.status(200).send({"message":"activated"});
            }
            
            });
        }
        catch(err)
        {
            return res.status(500).send(
            {
                    "message":"Error !",
                    "code":500
            });
        }
    }
}
module.exports = UserController;