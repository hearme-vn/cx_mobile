/**
* This class is for Init application and store common data for sharing between pages
* @author ThucVX <thuc@hearme.vn>
* @date 12 Dec 2019 
*/

import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
//import { Device } from '@ionic-native/device';
import { TranslateService } from '@ngx-translate/core';
import { NavController, Platform } from 'ionic-angular';
import * as io from 'socket.io-client';
//import { Toast } from '@ionic-native/toast';
import { ModalController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from "rxjs/observable/forkJoin";
import { AlertController } from 'ionic-angular';

import { AuthService } from '../auth-service/auth-service';
import { Config } from '../../app/config';
import { FeedbackService } from '../feedback-service/feedback-service';
import { Util, Proverbs } from '../feedback-service/utils';
import { CONSTANTS } from '../feedback-service/constants';

@Injectable()
export class AppInit {
    private ex_params = ['token', 'orientation', 'welcome', 'no_tm', 'lang_id', 'c', 'tran_id'];

    // Loading application data
    public status = CONSTANTS._STATUS_NOT_INIT_;
    public device = null;
    public organization = null;
	public invitation = null;
	public customer = null;         // For storing customer from Kiosk channel - socket synchronized
    public online_customer = null;  // For storing customer from web channel
    public survey_data = null;
    public socket = null;
    public proverbs: any;   //Json store proberbs word in languages
    public tabs = [];
    public configs = {};    // soft configuration for this device - loaded from server
    public survey = null;
	public urlParams = null;
    public DEVICE_MAIN_COLOR = CONSTANTS.APP_MAIN_COLOR;
    /**
     * If system config allows to use Welcome page, this value is false. Otherwise, it's true
    */
    public direct_survey_page = false;

    // Utility data
    public navCtrl: NavController;
    public ThanksPage;
    public FactorsInfoPage = null;
    public request_options = null;
    public page_timeout_handle = null;
    private page_timeout_length = CONSTANTS.APP_PAGES_DELAY_DEFAULT;
	// private constants = CONSTANTS;
	private pdevice = null;
    
    // Processing
    public lang_id = 0; // Vietnamese: 0; English: 1 
    public header = null;
	public pageController: any;
	public screen_orientation; // values: landscape-primary; portrait-primary
    
    // Default languate
    public languages = {
        selected: {
            "id": '1',
            "name": "English",
            "code": "en",
            "flag": "/assets/icon/en.svg",
            "default": true,
            "active": false,
            "selected": false
        }, 
        datas: []
    };
    
    constructor(public conf: Config, public http: Http, private auth: AuthService, 
        public util: Util,
        public alertCtrl: AlertController,
        public translate: TranslateService, 
		public modalCtrl: ModalController, 
		public fbService: FeedbackService) {
    }
    
    /*
    * This method start load read token, then preload data. Finally, it loads main data
    * There are two callback: afterPreload and afterInit methods
    */
    public initApplication() {
        if (!this.request_options) {
            let options = this.prepareToken();
            if (!options)   return;
        }

        // Pre-load data - for displaying data in welcome page
        this.getDeviceData().subscribe(
            results => {
                //console.log("tabs info: ", JSON.stringify(this.tabs));
            }
        );
        
        // Main Init application: Attach device and check active
        this.attachDevice().subscribe(
        device => {
            // Processing after preload data: move to welcome or first page
            this.afterPreload();
            
            // Checking receivable device
            if (this.device.receivable==CONSTANTS._DEVICE_RECEIVABLE_) {
                this.status = CONSTANTS._STATUS_ACTIVE_;
            } else {
                this.status = CONSTANTS._STATUS_INACTIVE_;
                this.finishSurvey();
                return;
            }
            
			if (this.device.type==CONSTANTS.DEVICE_CHANNEL_EMAIL) {
				// Get and check invitation's status is active or not
				this.checkInvitation().subscribe(
					invitation => {
						// Invitation is valid. Any post-process here
					},
					error => {
						
					}
				);
			}
			
            //Load active survey
            this.getActiveSurvey().subscribe(
            survey => {
                //Load other items here: language for organization, survey, tabs
                //console.log("Active survey: ", JSON.stringify(survey));
                this.status = CONSTANTS._STATUS_SURVEY_READY_;
                this.afterInit();
            },
            error => {
				this.finishSurvey();
            });
        },
        error => {
			this.finishSurvey();
        }); 
		
		//setInterval(this.recaptchaOnload, 500);
    }
    
    //Make request option from token
    public makeRequestHeader(token) {
        let headers = new Headers({ 'Authorization': 'BEARER ' + token, 'Content-Type': 'application/json'});
        let options = new RequestOptions({ headers: headers });
        this.request_options = options;        
        return options;
    }
    
    // Get token and make request header for processing later
    public prepareToken() {
		// Process token, Save token into cookies
		let token = this.urlParams.get('token');
		if (!token) {
            let code = this.urlParams.get('c');
            if (code) {
                // Exchange code into token
                this.http.get(this.conf.core_Service + "link/info/" + code).subscribe(
                    (res) => {
                        let token = res.json().link;
                        localStorage.setItem(this.conf.tokenPrefix + "_" + this.conf.tokenName, token);
                        this.makeRequestHeader(token);
                        this.initApplication();
                    },
                    (err) => {
                        this.finishSurvey();
                        return;
                    });
                return null;
            } else {            
                this.finishSurvey();
                return;
            }
		}
		localStorage.setItem(this.conf.tokenPrefix + "_" + this.conf.tokenName, token);
        return this.makeRequestHeader(token);
    }
    
    /**
    * Method to attach physical device into logical device. Check device active
    */  
    public attachDevice() {
        // User logged, now update device information
        let device_infor = this.getDeviceInformation();
        return Observable.create(observer => {
        this.http.post(this.conf.core_Service + "device/attach", JSON.stringify(device_infor), 
            this.request_options).subscribe(
                (res) => {
                    //console.log("Attached device to account with token: ", token);
                    this.status = CONSTANTS._STATUS_ATTACHED_;
                    this.device = res.json().device;
                    
                    // Check device channel
                    if (!this.device || 
                        (this.device.type!=CONSTANTS.DEVICE_CHANNEL_WEB &&
                        this.device.type!=CONSTANTS.DEVICE_CHANNEL_EMAIL)) {
                            
                        this.finishSurvey();
                    }
                    
                    // Process organization information
                    this.organization = this.device.organization;
                    if (this.organization && this.organization.logo)   
                        this.organization.logo = this.conf.img_server + this.organization.logo;

                    // Get organization name
                    if (this.organization && this.organization.id) {
                        var uri = "fieldtext/list/organization/name/" + this.organization.id;
                        this.http.get(this.conf.core_Service + uri, this.request_options).map(
                            (res) => {
                                this.organization.org_names = res.json();
                            }
                        );
                    }

                    observer.next(true);
                },
                (err) => {
                    this.finishSurvey();
                    return;
                });
        });
    }
    
	/**
	* This method check active invitation
	*/
	public checkInvitation() {
        let token = this.auth.getToken();
        let headers = new Headers({ 'Authorization': 'BEARER ' + token, 'Content-Type': 'application/json'});
        let options = new RequestOptions({ headers: headers });
        
        // User logged, now update device information
        return Observable.create(observer => {
        this.http.get(this.conf.core_Service + "customer/check_invitation_bydevice", options).subscribe(
            (res) => {
				this.invitation = res.json();
				
				if (this.invitation.status!=CONSTANTS.INVITATION_STATUS_ACTIVE) {
					// This invitation is expired, get outerHTML
					this.finishSurvey();
					return;
				}
				this.customer = this.invitation.customer;
                this.fbService.invitation = this.invitation;

				observer.next(true);
            },
			(err) => {
				this.finishSurvey();
				return;
			});
        });		
	}
	
    /**
    * Get Active survey for device. If not success, goto Idle page
    */  
    public getActiveSurvey() {
        // Device is active. Now get active survey 
        return Observable.create(observer => {
        this.http.get(this.conf.core_Service + "v1.5/device/active_survey", 
            this.request_options).subscribe (
                res => {
                    this.survey_data = res.json();
                    //console.log('this.survey', this.survey);
                    this.status = CONSTANTS._STATUS_AVTIVE_SURVEY_;
                    observer.next(this.survey);
                    observer.complete();
                    },
                err => {
                    //console.log("No active survey for device: ", this.device.id);
                    this.status = CONSTANTS._STATUS_NO_SURVEY_;
                    let err_message = "Error when getting active survey for device";
                    if (err && err.status == 400)
                        err_message = err.json().message;
                    //return Observable.throw(err_message);
                    this.navCtrl.getActiveChildNav().select(CONSTANTS.PAGE_INDEX_IDLE);
                    return;
                });
        });
    }
    
    /**
    * Get all data for running device survey: organization, proverbs, tabs, configs
    */
    public getDeviceData() {
        if (!this.request_options)  return null;  
        let request_Set = [];
        
        //get proverbs en
		let filters = {};
        let proverbs = this.http.post(this.conf.core_Service + "v160/device/proverbs", 
			JSON.stringify(filters), this.request_options).map (
            (res) => {
                //this.proverbs = res.json();
				this.proverbs = new Proverbs(res.json());
            },
            (err) => {
                console.log("There is no provers", err);
            }
        );
        request_Set.push(proverbs);
        
        //Get device tabs
        let tab_req =  this.http.get(this.conf.core_Service + "device/tabs", 
        this.request_options).map(
            (res) => {
                this.tabs = [];
                var tabs = res.json();
                
                // Get default language for tabs
                // let tabs_req_Set = [];
                for (var i = 0; i < tabs.length; i++) {
                    let tab = tabs[i];
					tab.tab_names = tab.label_texts;
                    this.tabs[tab.function] = tab;
                }

            }
        );
        request_Set.push(tab_req);
    
        // Get device configuration, Get only active config
        let param = {status: CONSTANTS.CONFIG_ACTIVE};
        let config_req = this.http.post(this.conf.core_Service + "device/configs", JSON.stringify(param), 
        this.request_options).map(
            (res) => {
                // Processing config data
                var configs = res.json();
                if (configs && configs.length>0) {
                    for (var i=0; i<configs.length; i++) {
                        this.configs[configs[i].cfg_key] = configs[i];
                    }
                }
                // Init timeout value for pages
                if (this.configs['FEEDBACK_TIMEOVER'])
                    this.page_timeout_length = this.configs['FEEDBACK_TIMEOVER'].value;
                // init device main color
                if (this.configs['DEVICE_MAIN_COLOR'])
                    this.DEVICE_MAIN_COLOR = this.configs['DEVICE_MAIN_COLOR'].value;

                this.getUserLanguages();
            },
            (err) => {
                console.log("Error in getting configuration for device", err);
            }
        );
        request_Set.push(config_req);
        
        // Join all here
        return forkJoin(request_Set);
    }

    private afterPreload() {
        // Load welcome screen
        if (this.urlParams.get('welcome')==1 || this.urlParams.get('welcome')==undefined)
            this.navCtrl.getActiveChildNav().select(CONSTANTS.PAGE_INDEX_WELCOME);
        
    }

	private afterInit() {
		// PreProcessing data
        // Set header for feedback message
        this.header = {
            "device_id": this.device.id,
            "grp_id": this.device.grp_id,
        }
        if (this.survey_data && this.survey_data.promotion)
            this.header["pro_id"] = this.survey_data.promotion.id;
		
		// Init Feedback service
		if (!this.fbService.initSurvey(this.survey_data)) {
			this.navCtrl.getActiveChildNav().select(CONSTANTS.PAGE_INDEX_IDLE);
			return;
		}

		// Setting require data for processing later
		this.fbService.setMessageHeader(this.header);
		this.fbService.organization = this.organization;
		this.fbService.device = this.device;

		// Set background images
		if (this.configs['DEVICE_BGR_IMG']) {
			let url = this.conf.img_server + this.configs['DEVICE_BGR_IMG'].value;
			Util.setObjectBackgroundImage("ion-tabs", url);
		}

        this.paramProcessor();

        // Set postMessage handleEvent
        window.addEventListener('message', this.messageListener.bind(this), false);

        // Send ready post message to parent window
        this.postWindowMessage(this.status, "hearme_survey_ready");

        let welcome_config = this.configs['DEVICE_INTROPAGE_OFF'];
        if (this.urlParams.get('welcome') == 0
            || (welcome_config && welcome_config.status == CONSTANTS.CONFIG_ACTIVE
                && welcome_config.value == CONSTANTS.WELCOMEPAGE_ACTIVE)) {
            this.direct_survey_page = true;
            this.survey = this.fbService.survey.goNext();
            this.navCtrl.getActiveChildNav().select(this.survey.page);
        }
        
	}
    
    // Make necessary config with parameters in URL
    private paramProcessor() {
        if ((this.urlParams.get("tran_id") != undefined) &&
            (this.urlParams.get("tran_id") != null)) {
            this.header["tran_id"] = this.urlParams.get("tran_id");
        }
        // Save other params into attached_info field in header
        let attached_info = {};
        this.urlParams.forEach((value, key) => {
            // console.log("Param: %s, %s", key, value);
            if (key && (this.ex_params.indexOf(key) < 0)) {
                attached_info[key] = value;
            }            
        });

        if (Object.keys(attached_info).length)
            this.header.attached_info = attached_info;
    }
    
    private messageListener(e) {
        // Check origin
        if ( e.origin === this.urlParams.get('origin') ) {
            try {
                let data = JSON.parse(e.data);
                this.customer = data.customer;
                this.header.online_customer = data.customer;
                this.header.attached_info = data.attached_info;
            } catch(e) {
                // console.log("Received data: ", e.data);
                console.log("Received data is not in JSON format");                
            }            
            
        }            
    }
    
    public getDeviceInformation() {
        let device_infor = {
            // For running in web browser
            "os": "online",
            "hardware_id": "n/a"
        }

        //console.log('device_infor', device_infor);
        return device_infor;
        
    }

    // This method for Kiosk mode only
    private resetAppState() {
        this.status = CONSTANTS._STATUS_NOT_INIT_;
        this.survey = null;
        this.survey_data = null;        
        
    }
	
    // These two methods are for displaying captcha before submiting data
	public recaptchaOnload() {
		var grecaptcha: any;
		
		if (document.getElementsByClassName('g-recaptcha').length > 0) {
			grecaptcha.render("recaptcha", {
				sitekey: this.conf.CAPTCHA_SITEKEY
			});
			return;
		}
	}
	
	public gCaptchaResponse(response) {
		console.log("captcha response: ", response);
	}

	/*
	Process browser to go to outpage after finish survey	
	*/
	public finishSurvey() {
		// Send event to parent window
		this.postWindowMessage(this.status, "hearme_finished_feedback");

		// Redirect
		if (this.organization && this.organization.url) {
			window.location.href = this.organization.url;
		} else {
			window.location.href = this.conf.hearme_HOME;
		}
	}
	
    // Send window message to container window of iframe
	public postWindowMessage(status, data) {
		if (!this.urlParams.get('iframe')) 		return;
		
		let json_message = {
			status: status,
			message: data
		}
		
		let post_message = JSON.stringify(json_message);
		if (window.parent)
			window.parent.postMessage(post_message, "*");
	}
    
    public getAllLanguage() {		
		return this.conf.LANGUAGES;
    }
    
    /**
    * Get default language for device
    * Priority order is: 
        - Online parameter; 
        - System configuration (by administration application)
        - Default value in cx_online config file
    */
    public getDefaultLanguage(langs) {
        let default_index = -1;
        
        // Check first priority: lang_id parameter
        let lang_id = this.urlParams.get('lang_id');
        if (lang_id!=null && lang_id!=undefined) {
            default_index = Util.findObjectByKey(langs, "id", lang_id);            
        }

        if (default_index < 0) {
            // Second priority from administration configuration
            let default_lang_cfg = this.configs['DEVICE_LANGUAGE_DEFAULT'];
            if (default_lang_cfg && default_lang_cfg.value!=undefined &&
                 default_lang_cfg.value!=null)
                default_index = Util.findObjectByKey(langs, "id", default_lang_cfg.value);
        }
        
        if (default_index < 0)
            // Get default language in this application config
            default_index = Util.findObjectByKey(langs, "default", true);
            
        return default_index;
    }
    
    public getUserLanguages() {
        let langs = this.getAllLanguage();

        let default_index = this.getDefaultLanguage(langs);
        let default_lang = langs[default_index];

        let user_langs = [];
        let cfgDeviceLangs = this.configs['DEVICE_LANGUAGES'];
        if (cfgDeviceLangs) {
            let ids = cfgDeviceLangs.value.split(",");
            if (ids && ids.length) {
                for (let i=0; i<ids.length; i++) {
                    let index = Util.findObjectByKey(langs, "id", ids[i]);
                    if (index>=0)       user_langs.push(langs[index]);
                }
            }
        } else {
			user_langs = langs;
		}
        this.languages.selected = default_lang;
        this.languages.datas = user_langs;
        this.translate.setDefaultLang(default_lang.code);
        this.lang_id = parseInt(default_lang.id);
    }
}
