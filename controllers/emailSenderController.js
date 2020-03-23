const emailAuth = require('../credentials/secrets');
const nodemailer = require('nodemailer');


class EmailSenderController 
{
    static sendEmail=(code,email)=>
    {
        nodemailer.createTestAccount(
        (err, account) => 
        {
            let transporter = nodemailer.createTransport(
            {
              host: 'smtp.gmail.com',
              port: 587,
              secure: false,
              auth: 
              {
                user: emailAuth.email,
                pass: emailAuth.emailPassword
              }
            })
      
            let mailOptions = 
            {
              from: '"ThoughtTree" '+emailAuth.email,
              to: email,
              subject: 'Account activation',
              text: 'In order to activate your account you need to access the following link',
              html: '<b>In order to activate your account you need to access the following link</b> <a href="http://localhost:8900/activate/' + code + '">Activation link</a>'
            }
      
            transporter.sendMail(mailOptions, (error, info) => 
            {
              if(error)
              {
                console.log(error);
              }
              else
              {
                console.log(info);
              }
            })
        })
    }
}
module.exports = EmailSenderController;