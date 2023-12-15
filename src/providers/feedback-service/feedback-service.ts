//import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';

import { md5 } from '../md5/md5';
//import { SqliteProvider } from '../sqlite/sqlite';
import { Config } from '../../app/config';
import { AuthService } from '../auth-service/auth-service';
import { Util } from '../feedback-service/utils';
import { CONSTANTS } from './constants';
import { createSurvey, SurveyINF } from './surveys';


@Injectable()
export class FeedbackService {
    public survey: SurveyINF;
	public organization: any;
	public device: any;
	public invitation: any;
	
    private messageHeader: any;
    public promotion_code: String = null;
    //private batchjob_handl = null;
    public isPositive_feedback = false;   
 
    constructor(private conf: Config, private http : Http, 
        private auth: AuthService) {
            
        this.promotion_code = null;
    }
    
    // Return: true if successful, false if failed
    public initSurvey(survey_data) {
        this.survey = createSurvey(survey_data);
        if (!this.survey)   return false;
        
        // Init first, last survey
        let first = this.survey.getFirstSurvey();
		if (!first)		return false;
        first.isFirst = true;
		
        let last = this.survey.getLastSurvey();
        if (last)    last.isLast = true;

        this.survey.resetState();
        //console.log("Step count: ", this.survey.getSteps());

		// create promotion code
		if (survey_data.promotion && survey_data.promotion.id) {
			this.promotion_code = this.makePromotionCode(CONSTANTS.APP_PROMOTIONCODE_LENGTH);
		}

		return true;
    }
        
    public setMessageHeader(header) {
        this.messageHeader = header;
    }
    
    /** 
     * Send feedback: generate feedback message, promotion code, root feedback id
     * - Prepare data for sending feedback
     * - Setting data for using in thank page: isPositive_feedback, promotion_code
     * - Send feedback to server
     */
    public sendFeedback() {
        let message = Object.assign({}, this.messageHeader);    // Clone header to new message
/* 		
		// Check and get capchar response code
		if (this.device && this.device.type==CONSTANTS.DEVICE_CHANNEL_WEB) {
			let g_captcha = Util.extractCaptchaInfomation();
			message['g_recaptcha_response'] = g_captcha;
		}
 */		
        
		// Update feedback
        let feedback = this.survey.packageFeedback();
		// Update customer information for email channel
		if (this.device.type==CONSTANTS.DEVICE_CHANNEL_EMAIL) {
			let customer = this.invitation.customer;
			feedback.name = customer.name;
			feedback.contact = customer.phone;
		}  
        message.feedback = feedback;
        message.status = this.survey.feedback.status;

        // Update message header
        let current_Time = new Date();
        message.device_date = current_Time.toString();	// In local timezone

        // Calculate time to server
        let destination_date = Util.changeTimeZone(current_Time, this.conf.SERVER_TIMEZONE);
        message.created = Util.toISOFormat(destination_date);

        // Calculate id for root feedback
        feedback.id = this.generateFeedbackId(message.device_id, message.created,
            feedback.sur_path, feedback.sur_id);

        if (message.pro_id) {
            message.code = this.promotion_code;
            // message.code = this.makePromotionCode(CONSTANTS.APP_PROMOTIONCODE_LENGHT);
            // this.promotion_code = feedback.id + "-" + message.code;
        }

        if (this.survey.recursiveNotification()) {
            message.notification = true;
            message.notificationMessages = this.survey.getSurveyClass().notificationMessages;
            message.notificationColor = this.survey.getSurveyClass().notificationColor;
            this.isPositive_feedback = false;
        } else {
            this.isPositive_feedback = true;
        }
        
        //let id = message.feedback.id;
        this.postMessage(message)
            .subscribe(
                (res) => {
                    // console.log("Send feedback to system successfully", res.json());
					// Redirect to organization URL					
                },
                (err) => {
                    // console.log("Error code: ", err.status);
                }
            );
		return message;
    }

    // Make id for feedback
    public generateFeedbackId(device_id, created_time, sur_path, sur_id) {
        if (!device_id || !created_time || !sur_id)    return null;
        if (!sur_path)      sur_path = "None";
        
        let id_data = device_id + '-' + created_time + '-' + sur_path + '-' + sur_id;
        //console.log("ID string: ", id_data);
        return md5(id_data);
    }
    
    // Make promotion code for customer
    public makePromotionCode(length) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }
	
    // Send message to hearme server by post APIs.
    // Save to local storage if un-successful
    public postMessage(payload){
        // Configure feedback URL and related information
        let url = this.conf.dataFront_service + "webmessage/create";
		if (this.device && this.device.type &&
			this.device.type == CONSTANTS.DEVICE_CHANNEL_EMAIL) {
			url = this.conf.dataFront_service + "mailmessage/create";
		}
		
        let token = this.auth.getToken();
        let headers = new Headers({ 'Authorization': 'BEARER ' + token, 'Content-Type': 'application/json'});
        let options = new RequestOptions({ headers: headers });
        return this.http.post(url, JSON.stringify(payload), options);

    }

}
