// Maillistner 
var MailListener = require("../controllers/maillistener");
var ticketsController = require("../controllers/ticketsRelated");
var aws_s3 = require('../controllers/aws-s3');
var domainNamesAllowed = require("./config")['mailDomainsAllowed'];
var sanitizeHtml = require('sanitize-html');
var fs = require('fs');

var ticketModel_parent = require('../models/tickets');
var ticketModel = require('mongoose').model('ticket');

var MailListenerLogFile = require('../models/maillistnerlogs');
var mailListnerModel = require('mongoose').model('maillistnerlogs');

function logInDatabase(err, action_triggered) {
    //JSON.stringify
    var mailListnerLog = new mailListnerModel({
        error: err,
        action: action_triggered
    });
    mailListnerLog.save(function (err, data) {
        if (!err) {
            console.log('logs saved in database');
        } else {
            console.log(err);
        }

    })

}


function checkDomainExist(email) {
    var isAllowed = false;
    email = email.toLowerCase();
    var domain = email.replace(/.*@/, ""); // getting domain foloowed by .com, .org, .co.in
    var domainNamefetch = domain.split("."); // extracting exact domain name
    var domainName = domainNamefetch[0];   // assigning domain name to variable
    if (domainNamesAllowed.indexOf(domainName) !== -1) {
        isAllowed = true;
    } else {
        isAllowed = false;
    }
    return isAllowed;
}

module.exports = function (mailConfig) {

    var mailListener = new MailListener(mailConfig);

    mailListener.start();

    mailListener.on("server:connected", function () {
        console.log("imapConnected");
        logInDatabase('imapConnected', 'imapConnected');
    });

    mailListener.on("server:disconnected", function () {
        logInDatabase('imapDisconnected', 'imapDisconnected and now trying to restart server');
        console.log("imapDisconnected", ImapDisErrorOccured);
    });

    mailListener.on("error", function (err) {
        console.log(err);
        logInDatabase(err, 'error');
    });

    var tID = null;
    var generateTicketID = function () {
        return Date.now();
    };


    mailListener.on("attachment", function (attachment) {
        if (!tID) {
            tID = generateTicketID();
            console.log('Attachment Ticket-ID NOT exist', tID);
        } else {
            console.log('Attachement Ticket-ID Exist', tID);
        }
        
       
        console.log('Attachement Ticket-ID Exist', attachment);
        
        console.log("currentVal.path",attachment.fileName);
      
        //ticketsController.saveAttachment(attachment,tID);
        
        
        
        aws_s3(attachment, tID);
    });
    mailListener.on("mail", function (mail) {
        var emp_email = mail.from[0].address;
        // dont allow other email rather than specific email
        if (emp_email && checkDomainExist(emp_email) === false) {
            console.log('domain Not allowed received a mail from: ', emp_email);
            return false;
        } else if(mail.cc){
        	console.log('ticket should not created for cc mail');
        	return false;
        }else{
            console.log('Mail Received and allowed', emp_email);
        }
        var emp_name = mail.from[0].name;
        var subject = mail.subject;
        var description = mail.html;
        var cleanedHTMLTags = sanitizeHtml(description);
        if (subject) {
            if (subject.match(/#[0-9]*/)) {
                var n = subject.match(/#[0-9]*/);
                ticketType = 'employee';
                console.log("inside mail listenr employee comment");
            }
            if (subject.match(/[0-9]*_[a-z]*/)) {
                console.log("inside mail listenr Approver comment");
                var match = subject.match(/[0-9]*_[a-z]*/);
                var n = match[0].substring(0, match[0].lastIndexOf('_'));
                ticketType = 'approver';
            }

        }
        if (n && n[0]) {
            console.log('received a reply Mail');
            if (ticketType === 'approver') {
                var ticketID = n.toString();
            } else {
                var ticketID = n[0].replace('#', '');
            }

            console.log("subject inside ticketId", ticketID);
             var params = {
                ticketID: ticketID,
                emp_email: emp_email,
                emp_name: emp_name,
                subject: subject,
                comment: cleanedHTMLTags,
                ticketType: ticketType
            };
             
            
            if (tID) {
                //Attachments exist for comment reply mail
                params.attachTicketID = tID;
            }
            /*********************************************************
             *If Ticket Already exists add as a comment to the ticket
             *********************************************************/
            ticketsController.addCommentByEmployee(params);

            tID = null;
        } else {
            if (!tID) {
                tID = generateTicketID();
            }
            var values = {
                ticketID: tID,
                email: emp_email,
                name: emp_name,
                description: cleanedHTMLTags
            };
            var result = subject.match(/([\[\(] *)?(RE|FW?) *([-:;)\]][ :;\])-]*|$)|\]+ *$/igm);
            if(result){
            	 subject = subject.replace(result , "");
            	//check that email with the particular subject exist in db or not
            	 ticketModel.find({
            		title : subject ,
            		status :{$ne :'Close'},
            		empEmail : emp_email
            	},function(err , details){
            		if(err){
            			console.log('error details::', err);
            		}
            		var size=details.length;
            		if(size>0){
            			console.log('Reply or Forward mail');
            			console.log('ticket should not created for reply mail');
            			return false;
            		}else{
            			values.subject=subject.trim();
            			ticketsController.createTicket(values);
            			tID = null;
            		}
            	});
            }else{
            	 values.subject=subject.trim();
            	 ticketsController.createTicket(values);
                 tID = null;
            }
        }
    });
};