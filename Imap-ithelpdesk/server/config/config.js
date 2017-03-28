var path = require('path');
var rootPath = path.normalize(__dirname + '/../../');
var attachPath = path.normalize(__dirname + '/../../../');
//console.log('port number listening',process.env.PORT);
module.exports = {
    development: {
        //db:'mongodb://sai:password@ds011241.mlab.com:11241/it-help-desk',
        //db:'//mongodb://devdb:password@ds153775.mlab.com:53775/it-help-desk-dev',
        db:'mongodb://127.0.0.1/IT-help-desk',
        rootPath: rootPath,
        port: process.env.PORT || 5000
    },
    production: {
        rootPath: rootPath,
        //db: 'mongodb://sai:password@ds011241.mlab.com:11241/it-help-desk',
        db:'mongodb://127.0.0.1/IT-help-desk',
        //db:'//mongodb://devdb:password@ds153775.mlab.com:53775/it-help-desk-dev', // development environment
        port: process.env.PORT || 5000
    },
    mailListener: {
        //username: "ithelpdesk@charterglobal.com",
        //password: "Charter5225",
    	username: "cmothkuri@charterglobal.com",
        password: "Chaithu@123",
        host: "outlook.office365.com",
        port: 993,
        tls: true,
        tlsOptions: {rejectUnauthorized: false},
        mailbox: "INBOX",
        markSeen: true,
        fetchUnreadOnStart: false,
        attachments: true,
        attachmentOptions: {directory:attachPath+"/public/attachments/"},
        smtpHost:'smtp.office365.com',
    },
    mailer:{
        //username: "ithelpdesk@charterglobal.com",
        //password: "Charter5225",
    	username: "cmothkuri@charterglobal.com",
        password: "Chaithu@123",
        smtpHost:'smtp.office365.com',
        turnOff:false
    },
    aws: {
       AWS_ACCESS_KEY_ID: "AKIAJ22YY3WKVYDY6SBA",
       AWS_SECRET_ACCESS_KEY: "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",
       S3_BUCKET_NAME: "it-helpdesk-cgi"
    },
    serverRestartTimeInMin:120,
    secret: '1ZcckOmDkZ6tnc5SW781iG1ZY3G7383G',
    mailDomainsAllowed:['gmail','outlook','charterglobal'],
    // applicationUrl used to send in email to the registered users
    applicationUrl: 'http://localhost:5000',
    // clientUrl used to communicate to client application from Listener
    clientUrl: 'http://localhost:5000',
    attachmentsPath: '/attachments/'
//    client: {
//        name: "IT-Help-Desk",
//        clientId: "itteam",
//        clientSecret: "SomeRandomCharsAndNumbers1",
//        tokenLife : 33600
//    }
}