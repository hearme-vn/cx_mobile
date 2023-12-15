import { Http, Headers, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';

import { Config } from '../../app/config';
import { Util } from '../feedback-service/utils';
import { CONSTANTS } from './constants';
import { AppInit } from '../app-init/app-init';

export class BasePage {
    public appConf=null;
    public tabs=null;
    public organization=null;
	public device=null;
    public survey=null;
	public theme=null;
	public themeClass='theme_basic';
	public page_selector=null;
    
    public fbService = null;
    public urlParams = null;
    public accountConfigs = null;
    
    public show_language_Listbox = false;
    
    constructor(public appInit: AppInit) {
		this.appConf = this.appInit.conf;
        this.accountConfigs = this.appInit.configs;
        this.fbService = this.appInit.fbService;
        this.urlParams = this.appInit.urlParams;

        this.device = this.appInit.device;
        this.tabs = this.appInit.tabs;
        this.organization = this.appInit.organization;
    }
	
    // Register back button
    ionViewDidEnter() {
        this.loadPage();
    }

    ngAfterViewChecked() {
        // console.log("Update color");
        let main_color = CONSTANTS.APP_MAIN_COLOR;
        if (this.appInit && this.appInit.configs && this.appInit.configs['DEVICE_MAIN_COLOR']) {
            main_color = this.appInit.configs['DEVICE_MAIN_COLOR'].value;
        }

        Util.updateMainColor(main_color);
    }
	
    ionSelected() {
        this.loadPage();
    }
	
    ionViewWillLeave() {
        //this.unregisterBackButtonAction && this.unregisterBackButtonAction();
    }

    public loadPage() {
        this.survey = this.appInit.survey;
        this.theme = this.survey.data.theme;

        // Update language for survey
        this.survey.changeLanguage(this.appInit.lang_id);
        
        this.configurePage();
    }

    public configurePage() {
        if (this.theme && this.theme.css_class) {
            this.themeClass = 'theme_' + this.theme.css_class;
            let newClasses = "ion-page show-page " + this.themeClass;
            Util.setAttributeValue(this.page_selector, "class", newClasses);
        }

        // Configure page background color and image
        if (this.theme) {
            if (this.theme.background) {
                let url = this.appConf.img_server + this.theme.background;
                Util.setObjectBackgroundImage(this.page_selector, url);
            } else if (this.theme.type_id==1) {
                Util.setObjectBackgroundColor(this.page_selector, "white");
            } else {
                Util.clearObjectBackground(this.page_selector);
            }
        } else {
            Util.clearObjectBackground(this.page_selector);
        }
    }

 
    /**
     * APPLY FOR EACH SURVEY PAGE
     * This function is for checking data and preprocessing feedback data 
     * - Validate data
     * - Make feedback and update into survey
    */ 
    public preSendFeedback() {}
 
    /**
     * APPLY FOR EACH SURVEY PAGE
     * Call preprocessing data and then update feedback for each survey page
    */
    public sendFeedback() {
        // Processing data
        this.preSendFeedback();

        // Check if there is feedback
        if (!this.survey.is_Finished_feedback()) {
            // if (!this.survey.feedback && this.survey.data.required) {
            // Display message here
            this.showToastMessage("message.ANSWER_REQUIRED", "top", CONSTANTS.APP_TOAST_INTERVAL);
            return;
        }

        // Run next survey
        this.runNextSurvey();
    }


    /**
     * Get and run next survey. If there is not next survey, send feedback and then open thank page
    */    
    public runNextSurvey() {
        // DON'T CHECK THIS CONDITION, DUE TO FEEDBACK ANSWER IS CHECKED IN SENDING FEEDBACK
        // REQUIRED ANSWER IS AN OPTION
        // if (this.survey && !this.survey.feedback)    return;
    
        let survey = this.fbService.survey.goNext();
        if (!survey) {
            // Reach end survey, send feedback and go to thank page
			// Check captcha response code
/* 			
			if (!this.device || this.device.type!=CONSTANTS.DEVICE_CHANNEL_EMAIL) {
				let g_captcha_response = Util.extractCaptchaInfomation();
				if (g_captcha_response === undefined) {
					this.survey = this.fbService.survey.goPrevious();
					this.survey.isLast = true;
					//this.showToastMessage("message.CAPTCHA_INVALID", "Top", 500);
					return;
				} else if (g_captcha_response === '') {
					this.showToastMessage("message.CAPTCHA_INVALID", "Top", 500);
					return;
				}
			}
 */
            // Send feedback
            this.fbService.survey.feedback.status = CONSTANTS.FEEDBACK_STATUS_NEW;
            let fb_message = this.fbService.sendFeedback();
			this.appInit.postWindowMessage(CONSTANTS._STATUS_SEND_FEEDBACK_, fb_message);
            // this.fbService.survey.resetState();

            // Check and go to Thank page
            this.appInit.status = CONSTANTS._STATUS_SURVEY_FINISHED_;            
            this.openThankPage();
            return;
        }
        // Goto survey page for this survey
        // Check the last survey
        this.fbService.survey.updateLastSurvey();
        this.appInit.survey = survey;
        this.openSurveyPage(survey);
    }
 
    public runPreviousSurvey() {
        let survey = this.fbService.survey.goPrevious();
        if (!survey)   survey = this.fbService.survey.goNext();
        
        // this.setShowInfoBtnForSurvey(this.survey);
        var page = survey.page;
        this.appInit.survey = survey;
        this.appInit.navCtrl.getActiveChildNav().select(page);
    }    

    public openThankPage() {
        var thank_page_style = this.accountConfigs['THANKPAGE_STYLE'];
        if (thank_page_style && thank_page_style.status == CONSTANTS.CONFIG_ACTIVE) {
            // Run active thank page
            if (thank_page_style.value==CONSTANTS.THANKPAGE_STYLE_PAGE) {
                // Thank page style
                this.appInit.navCtrl.getActiveChildNav().select(CONSTANTS.PAGE_INDEX_THANKS);
            } else {
                // Open popup style
                let data = {};
                let opts = { enableBackdropDismiss: false, showBackdrop: false };
                let myModal = this.appInit.modalCtrl.create(this.appInit.ThanksPage, data, opts);
                myModal.present();
            }
        } else {
            // Ommit thank page in flow
            // this.runNextSurvey();
            this.appInit.finishSurvey();
        }
    }
    
    // Function to init config for survey and open appropriate page
    public openSurveyPage(survey) {
        // Go to survey page UI
        var page = survey.page;
        this.appInit.navCtrl.getActiveChildNav().select(page);        
    }
    
    // duration: time in seconds
    public showToastMessage(MSG_ID, position, duration) {
        this.appInit.util.showToastMessageByID( MSG_ID, {
            position: position,
            duration: duration
        } );
    }

    public openFactorsInfoPage() {
        // Clear current timeout hanlder
        // if (this.page_timeout_handle)       clearTimeout(this.page_timeout_handle);
        
        // Open popup style
        let data = {};
        let opts = { enableBackdropDismiss: false, showBackdrop: true };
        let myModal = this.appInit.modalCtrl.create(
            this.appInit.FactorsInfoPage, data, opts);
        myModal.present();
    }

    public goToCollectionPage() {
        // Clear current timeout hanlder
        // if (this.page_timeout_handle)       clearTimeout(this.page_timeout_handle);

        // Goto collection page       
        this.appInit.navCtrl.getActiveChildNav().select(CONSTANTS.PAGE_INDEX_COLLECTIONS);
    }
    
    public changeLanguage(langSelected) {
        if (!langSelected)      return;
            
        this.appInit.languages.selected = langSelected;
        this.appInit.lang_id = langSelected.id;
        this.appInit.translate.use(langSelected.code);
        let lang_id = langSelected.id;
        
        
        if (this.survey)    this.survey.changeLanguage(lang_id);
        
        // Update company name
        if (this.organization && this.organization.org_names && this.organization.org_names.length>1) {
            for (var i=0; i<this.organization.org_names.length; i++) {
                if (this.organization.org_names[i].lang_id == lang_id) {
                    this.organization.name = this.organization.org_names[i].value;
                    break;
                }
            }
        }
        
        // Update for tabs
		if (this.tabs && this.tabs.length) {
			this.tabs.forEach( function(tab) {
				if (tab.tab_names && tab.tab_names.length>0) {
                    let i=0;
                    for (i=0; i<tab.tab_names.length; i++) {
                        let label = tab.tab_names[i];
                       if (label.lang_id == lang_id) {
                            tab.label = label.value;
                            break;
                        }
                    }
                    if (i==tab.tab_names.length)    tab.label = null;
				}
			});
		}

        this.show_language_Listbox = false;
    }
    
    public showHideLang() {
        this.show_language_Listbox = !this.show_language_Listbox;
    }
}


/**
 * This class is for Index survey page only
*/
// export class IndexPage extends BasePage {

//     /**
//      * This function is index survey, to get rating level and send feedback
//      * - Validate data
//      * - Make feedback and update into survey
//     */
//     public getComment(rating) {
//         // Update rating
//         var feedback = {
//             rating: rating
//         }
//         this.survey.updateFeedback(feedback);
    
//         // Go next survey page
//         this.sendFeedback();
//     }
// }


export class IndexBasePage extends BasePage {

    /**
     * handle click to satisfaction level
     * input: survey is updated feecback data
    */
    indexRatingClicked(survey) {
        this.sendFeedback();
    }

}