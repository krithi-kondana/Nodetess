const emailAuth = require('../credentials/secrets');
const nodemailer = require('nodemailer');


class EmailSenderController 
{
    static sendAuthenticationEmail=(password,email)=>
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
              from: '"Odeno" '+emailAuth.email,
              to: email,
              subject: 'Oprettet konto',// 'Account activation',
              text: 'Login ved hjælp af cvr og adgangskoden. Password:'+password+'',// 'In order to activate your account you need to access the following link',
              html: '<b>Din konto blev oprettet.</b><br>Login ved hjælp af cvr og adgangskoden<br><br> Password:<br><br>'+password+''
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