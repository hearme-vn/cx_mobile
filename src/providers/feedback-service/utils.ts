import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertController, LoadingController, ToastController } from 'ionic-angular';
import { Platform } from 'ionic-angular';

import { md5 } from '../md5/md5';
import { CONSTANTS } from './constants';

/**
* General utility class
*/
@Injectable()
export class Util {
    private alert_handle: any;

    constructor(
        private loadingCtrl: LoadingController, 
        // public pdevice: Device, 
        public alertCtrl: AlertController,
        public platform: Platform,

        // private toast: Toast,
        public toastController: ToastController,
        public translate: TranslateService
        ) {        
    }
	
	// Extract captcha information
	static extractCaptchaInfomation() {
		if (document.getElementById('g-recaptcha-response')) {			
			let g_response = (<HTMLInputElement>document.getElementById('g-recaptcha-response')).value;
			//console.log(g_response);
			return g_response;
		}
	}

	// Convert date to ISO format, example: 2018-04-23T10:26:00.996Z
    static toISOFormat(date) {
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
    }	

	// Change timezone of datetime d
	static changeTimeZone(d, offset) {
		// convert to msec
		// add local time zone offset
		// get UTC time in msec
		let utc = d.getTime() + (d.getTimezoneOffset() * 60000);
	   
		// create new Date object for different zone
		// using supplied offset
		return new Date(utc + (3600000*offset));
	}    
    
    static processContent(content) {
        if (!content)   return null;
        
        let ret = content.replace(/\\n/g, "<br/>");
        return ret;
    }
    
    // Validate email address
    static isEmail(email: string): boolean {
        let  serchfind:boolean;

        let regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        serchfind = regexp.test(email);
        
        return serchfind
    }    

    // Validate email address
    // Check length: 10 or 11 digits
    static isPhoneNumber(phone: string): boolean {
        if (!phone)     return false;
        
        let digits = phone.replace(/\D/g, "").length;        
        
        return (digits==10 || digits==11);
    }
	
	

	/**
	* Set backgound image for specific object
	*/
	static setObjectBackgroundImage(obj, bgrImg) {
		if (!obj || !bgrImg)	return;
			
 		var classElements = document.getElementsByTagName(obj);
		if (classElements) {
			var urlString = 'url(' + bgrImg + ')';
			classElements[0].style.background = urlString;
		}
	}
    
	/**
	* Set html element attribute
    * Input: 
    * - obj: string - object selector
    * - attr: string - Attribute name
    * - val: Atrribute value
	*/
	static setAppendAttributeValue(obj, attr, val) {
		if (!obj || !attr)	return;
			
 		var classElements = document.getElementsByTagName(obj);
		if (classElements) {
            let classes = classElements[0].getAttribute(attr);
            if (!classes.includes(val))
                classElements[0].setAttribute(attr, classes + " " + val);
		}
	}

	static setAttributeValue(obj, attr, val) {
		if (!obj || !attr)	return;
			
 		var classElements = document.getElementsByTagName(obj);
		if (classElements) {
            classElements[0].setAttribute(attr, val);
		}
	}

	/**
	* Set backgound image for specific object
	*/
	static setObjectBackgroundColor(obj, color) {
		if (!obj || !color)	return;
			
 		var classElements = document.getElementsByTagName(obj);
		if (classElements) {
            classElements[0].style.background = null;
			classElements[0].style.backgroundColor = color;
		}
	}

	/**
	* Clear backgound image for specific object
	*/
	static clearObjectBackground(obj) {
			
 		var classElements = document.getElementsByTagName(obj);
		if (classElements) {
			classElements[0].style.background = null;
		}
    }
    
    /**
     * Update elements atrributes, inputs:
     * - selector: use css selector
     * - att: attribute
     * - val: value for attribute
    */
    static updateElementAttributes(selector, att, val) {
        let elements = document.querySelectorAll( selector );
        if (elements && elements.length)
            for (let i=0; i<elements.length; i++) {
                elements[i].style.setProperty(att, val);
            }
        else 
            return false
        
        return true;
    }
    
    /**
     * Update main corlor for items
    */
    static updateMainColor(main_color) {
        Util.updateElementAttributes(".main_background_color", "background-color", main_color);
        Util.updateElementAttributes(".main_text_color", "color", main_color);
        Util.updateElementAttributes(".main_border_color", "border-color", main_color);
    }

    // Search by one key
    static findObjectByKey(array, key, value) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][key] === value) {
                return i;
            }
        }
        return -1;
    }
	

    // Method to show alert text messages
    public showAlertTextMessage(message) {
        if (this.alert_handle)  this.alert_handle.dismiss();
        
        this.alert_handle = this.alertCtrl.create({
            title: message,
            buttons: [{ text: this.translate.instant('LOGIN_close')}]
        });
        this.alert_handle.present();
        return this.alert_handle;
    }

    // Method to show alert with message id
    // Input is message id from language definition
    public showAlertMessageByID(MSG_ID) {
        return this.showAlertTextMessage(this.translate.instant(MSG_ID));
    }
    
    // Show alert message for http call by Checking error code and message
    // Default use toast to show alrt message, but can assign alert function
    public alertErrorResponse(err, alertFunction=null) {
        if (!err)   return;
        
        let message = "";
        if (err.code) {
            message = this.translate.instant("httpcode." + err.code);
        } else {
            message = err.message;
        }
        if (!message)   message = this.translate.instant("message.UNKNOWN");
        if (!alertFunction)     alertFunction = this.showToastMessage.bind(this);
        return alertFunction(message);
    }
    
    // Close all alert message that shown
    public closeAlertMessage() {
        if (this.alert_handle)  this.alert_handle.dismiss();
    }

    // Show progressive bar with message from language definition
    public showProgressive(message_id) {
        let loading = this.loadingCtrl.create({
            content: this.translate.instant(message_id),
            dismissOnPageChange: true
        });
        loading.present();
        return loading;
    }

    // duration: time in seconds;
    // position: 'center', 'bottom', 'top'
    async showToastMessage(message, position="top", 
        duration=CONSTANTS.APP_TOAST_INTERVAL) {
            
        if (this.alert_handle)      this.alert_handle.dismiss();
        
        this.alert_handle = await this.toastController.create({
            message: message,
            duration: duration,
            position: position,
            showCloseButton: true,
            closeButtonText: this.translate.instant('LOGIN_close')
        });
        this.alert_handle.present();
        return this.alert_handle;
    }

    // duration: time in seconds
    public showToastMessageByID(MSG_ID, opts=null) {
            
        let message = this.translate.instant(MSG_ID);
        return this.showToastMessage(message, opts);
    }

    // // duration: time in seconds
    // public showToastMessageByID(MSG_ID, position="top", 
    //     duration=CONSTANTS.APP_TOAST_INTERVAL) {
            
    //     let message = this.translate.instant(MSG_ID);
    //     return this.showToastMessage(message, position, duration);
    // }

    /**
     * Check if user is running device app or web app
    */
    public isMobileApp() {
        if (this.platform.is('core') || this.platform.is('mobileweb'))
            return false
        else 
            return true;
    }

    /**
     * Check if this application is running in specific OS name, osName can be:
     * - Android
     * - iPhone
     * - iPad
     * - Macintosh: for Macbook
     * - Win: For Windows
    */
    static isOS(osName) {
        return navigator.appVersion.indexOf(osName) != -1;
    }

}

export class Proverbs {
	
	private proverbs;	
	
	constructor(proverbs: any) {
		this.proverbs = proverbs;
	}
	
	// Get list of proverbs by type and language id
	public getPrvsByType(type, lang_id) {
        let prvs = [];
		
		if (this.proverbs && this.proverbs.length) {
			for (let i=0; i<this.proverbs.length; i++) {
				let proverb = this.proverbs[i];
				if (proverb.lang_id == lang_id && 
					proverb.category == type) {
					prvs.push(proverb);
				}
			}
		}
		
		return prvs;
	}
	
	/*
	Method to get appropriate proverb
	Input: 
		- lang_id: 0 - 0: Vietnamese; 1: English
		- type: categoy in proverb
			0: General
			1: Bad rating
			2: Good rating
			3. Welcome-valid token
			4. Welcome-Invalid token
	*/    
	public getOneByType(type, lang_id) {
        let prvs = this.getPrvsByType(type, lang_id);

		if (prvs.length) {
			let random = Math.floor(Math.random() * (prvs.length-1));
			let proverb = prvs[random];
            proverb.content = Util.processContent(proverb.content);
			return proverb;
			
		} else 
			return null;

	}
}
