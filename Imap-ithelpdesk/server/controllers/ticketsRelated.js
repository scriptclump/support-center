/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var ticketModel_parent = require('../models/tickets');
var ticketModel = require('mongoose').model('ticket');

var commentModel = require('../models/comment');
var commentModels = require('mongoose').model('comment');

exports.createTicket = function (data) {
	var StartedAt=Date.now();
	var startDateFormated = new Date(StartedAt);
	var expected_end_time=startDateFormated.setHours(startDateFormated.getHours() + 1);
    ticketModel.create({
        reportedDate:data.ticketID,
        title: data.subject,
        empEmail: data.email,
        empName: data.name,
        description: data.description,
        master_st: StartedAt, // set the ticket timer time
        expected_end_time: expected_end_time,
        track_button: true, // mark the button on
        tat_time: 1,
        
    }, function (err, ticket) {
        if (err) {
            console.log(err);
        } else {
            console.log('ticket created with ID',ticket.title);
        }
    }); /// Create Record Operation Ends here
};

exports.saveAttachment = function (attachment, ReportedTimestamp) {
	 console.log('imap s3UploadService was triggered with ID', ReportedTimestamp);
   
 
  ticketModel.find({reportedDate: ReportedTimestamp}, function (err, details) {
	  if (err) {
          console.log(ReportedTimestamp, 'No Ticket Found with this Ticket ID');
      } else {
    	  console.log(ReportedTimestamp, 'Inside Ticket ID Found',details[0]);
      }
      
  });

};



exports.addCommentByEmployee = function (params) {
	    if(params.ticketType==='approver'){
	    	console.log("inside params.approver");
	    	var comment_type = 'team_approver';
	    }else{
	    	console.log("inside params.emp");
	    	var comment_type = 'team_emp';
	    }
		
    var newCommentModel = new commentModel({
        ticketID: params.ticketID,
        reportedBy: params.emp_name,
        reportedByEmail: params.emp_email,
        comment: params.comment,
        commentedByName: params.emp_name,
        comment_type: comment_type
    });
    newCommentModel.save(function (err, data) {
        if (err) {
            console.log('error occured while saving comment', err);
        } else {
            console.log('New Mail received and saved as a comment to existing ticket');
        }

    });
};
exports.commentAddedByTeamToEmp = function (req, res) {
    var commentBody = req.body;
   
    var newCommentModel = new commentModel({
        ticketID: commentBody.ticketID,
        tid: commentBody.tid,
        reportedBy: commentBody.reportedby,
        reportedByEmail: commentBody.reportedbyemail,
        comment: commentBody.comment,
        commentedByID: commentBody.userid,
        commentedByName: commentBody.username,
        comment_type: comment_type
    });
    newCommentModel.save(function (err, data) {
        if (err) {
            res.status(400);
            return res.json({msg: 'comment is not able to save.'});
        } else {
            if (commentBody.notifyEmp === true) {
                var subject = '#' + commentBody.ticketID + ' - comment is added by ' + commentBody.username;
                var params = {
                    comment: commentBody.comment,
                    commentedBy: commentBody.username,
                    ticketID: commentBody.ticketID
                };
                mailer.mailerService(commentBody.reportedbyemail, subject, params, 'template-comment');
            }
            res.status(200);
            res.json(data);
        }

    });
};