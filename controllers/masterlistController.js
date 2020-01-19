class MasterlistController
{
    static dbCreate(jInvoice, idUsername)
    {

    }
    static dbUpdate(jInvoice, idInvoice)
    {

    }
    static dbDelete(idInvoice)
    {

    }
    static dbRead(id)
    {

    }
    static dbReadAll()
    {
        try
        {
            return new Promise((resolve,reject)=>
            {
                global.sqlCon.query("SELECT\
                id,\
                name,\
                major,\
                translation_key\
                FROM luitel.masterlist",
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
}
module.exports = MasterlistController;