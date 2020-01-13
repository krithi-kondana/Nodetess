class CompanyController
{
    static async getCompanies(res)
    {
        try
        {
            return new Promise((resolve,reject)=>
            {
                global.sqlCon.query("SELECT\
                id,\
                company_name,\
                company_phone,\
                company_address\
                FROM luitel.companies",
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
module.exports = CompanyController;