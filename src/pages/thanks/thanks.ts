import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { AppInit } from '../../providers/app-init/app-init';
import { CONSTANTS } from '../../providers/feedback-service/constants';

@Component({
    selector: 'page-thanks',
    templateUrl: 'thanks.html',
})
export class ThanksPage {
    private proverb = null;
    private style_isPopup = false;
    private promotion_code = null;
    // private promotion_prime_code  = null;
    private valTimeId: any;

    constructor(//private navCtrl: NavController, public navParams: NavParams, 
        private appInit: AppInit, public viewCtrl: ViewController) {

    }

    private loadPage() {
        // Proverb or thank words
        // Get thank message or sorry message based on feedback attitude: positive or negative
        if (!this.appInit.fbService.isPositive_feedback) {
            this.proverb = this.appInit.proverbs.getOneByType(
                CONSTANTS.PROVERBS_TYPE_RATING_BAD, this.appInit.languages.selected.id);
        }
        if (!this.proverb) {
            this.proverb = this.appInit.proverbs.getOneByType(
                CONSTANTS.PROVERBS_TYPE_THANKS, this.appInit.languages.selected.id);
        }
			
        // Thank page style
        var page_style = this.appInit.configs['THANKPAGE_STYLE'];
        if (page_style)
            this.style_isPopup = (page_style.value==CONSTANTS.THANKPAGE_STYLE_POPUP);
        
        // Promotion code
        this.promotion_code = this.appInit.fbService.promotion_code;
        // this.promotion_prime_code = null;
        // if (this.promotion_code) {
        //     let codes = this.promotion_code.split("-");
        //     if (codes && codes.length)
        //         this.promotion_prime_code = codes[1];
        // }
        
        // Set timer
        let delay_conf = this.appInit.configs['THANKPAGE_DELAY'];
        let delay_time = CONSTANTS.THANKPAGE_DEFAULT_DELAY; //Default delay time
        if (delay_conf)     delay_time = delay_conf.value;
        this.valTimeId = setTimeout(() => {
            if (this.style_isPopup)     this.viewCtrl.dismiss();
            this.appInit.finishSurvey();
        }, 1000*delay_time);// Goto homepage after 0.5 munutes in idle status

    }

    ionViewDidEnter() {
        this.loadPage();
    }
    
    ionViewDidLeave() {
        clearTimeout(this.valTimeId);
    }
    
    closeModal() {
        if (this.style_isPopup)     this.viewCtrl.dismiss();
        this.appInit.finishSurvey();
    }

}
