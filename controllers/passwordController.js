class PasswordController
{
    static createRandomPassword(length)
    {
        let alphabet ="ABCDEFGHIJKLMNOPQSRTUVWXYZabcdefghijklmnopqsrtuvwxyz1234567890";
        let password ="";
        for(let i=0;i<length;i++)
        {
            password += alphabet[Math.floor(Math.random()*alphabet.length)];
        }
        return password;
    }
}
module.exports = PasswordController;