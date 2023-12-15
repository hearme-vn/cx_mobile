import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { WelcomePage } from '../welcome/welcome';
import { ThanksPage } from '../thanks/thanks';
import { FactorsInfoPage } from '../factors-info/factors-info';
import { IdlePage } from '../idle/idle';
import { CollectionPage } from '../collection/collection';
import { IndexSurveyPage } from '../index-survey/index-survey';
import { SupportSurveyPage } from '../support-survey/support-survey';

import { BasePage } from '../../providers/feedback-service/basepage';

// import { Config } from '../../app/config';
import { AppInit } from '../../providers/app-init/app-init';
import { CONSTANTS } from '../../providers/feedback-service/constants';

@Component({
    selector: 'page-tabs',
    templateUrl: 'tabs.html',
})
export class TabsPage {

    // Define pages  
	private Welcome: any;
    private Thanks: any;
    private FactorsInfo: any;
    private Idle: any;
    private Collections: any;
    private Login: any;
    private IndexSurvey: any;
    private SupportSurvey: any;
    
    // Store default callback function for Back button
    private urlParams = null;
    
    constructor(
        // private config: Config, 
        private appInit: AppInit,
		private navCtrl: NavController, 
		private screenOrientation: ScreenOrientation
        ) {
			
		// Init tabs
		this.Welcome = WelcomePage;
        this.Thanks = ThanksPage;
        this.FactorsInfo = FactorsInfoPage;
        this.Idle = IdlePage;
        this.Collections = CollectionPage;
        this.IndexSurvey = IndexSurveyPage;
        this.SupportSurvey = SupportSurveyPage;
			
		// Check token for survey device
		this.urlParams = new URLSearchParams(window.location.search);
		appInit.urlParams = this.urlParams;
        
        this.appInit.navCtrl = this.navCtrl;
        this.appInit.ThanksPage = ThanksPage;
        this.appInit.FactorsInfoPage = FactorsInfoPage;
        
        // Config orientation and trigger
		let orientation = this.urlParams.get("orientation");
        if (orientation && (orientation==CONSTANTS.APP_ORIENTATION_PORTAIT
            || orientation==CONSTANTS.APP_ORIENTATION_LANDSCAPE)) {
            this.appInit.screen_orientation = orientation;                
        } else {
            // Init and detect screen orientation
            this.appInit.screen_orientation = this.getOrientation_all();
            // this.appInit.screen_orientation = this.getPageOrientation();

            // let os = this.getMobileOperatingSystem();    
            // if (os=="iOS") {
            //     window.addEventListener('resize', function() {
            //         // this.appInit.screen_orientation = this.getOrientation_all();
            //         this.appInit.screen_orientation = this.getPageOrientation();
            //     }.bind(this));
            // } else {
            //     this.screenOrientation.onChange().subscribe(
            //         () => {
            //             // this.appInit.screen_orientation = this.getOrientation_all();
            //             this.appInit.screen_orientation = this.getPageOrientation();
            //         }
            //     );
            // }

            this.screenOrientation.onChange().subscribe(
                () => {
                    this.appInit.screen_orientation = this.getOrientation_all();
                }
            );

            window.addEventListener('resize', function() {
                this.appInit.screen_orientation = this.getOrientation_all();
            }.bind(this));

		}
    }

    private getMobileOperatingSystem() {
        //let userAgent = navigator.userAgent || navigator.vendor || window.opera;
        let userAgent = navigator.userAgent || navigator.vendor;
    
          // Windows Phone must come first because its UA also contains "Android"
        if (/windows phone/i.test(userAgent)) {
            return "Windows Phone";
        }
 
        if (/Windows NT | Windows/.test(userAgent)) {
            return "Windows";
        }
   
        if (/android/i.test(userAgent)) {
            return "Android";
        }
    
        // iOS detection from: http://stackoverflow.com/a/9039885/177710
        //if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        if (/iPad|iPhone|iPod/.test(userAgent)) {
            return "iOS";
        }
    
        return "others";
    }
	
    
    private getOrientation_all() {
        let orientation = "portrait";
        let os = this.getMobileOperatingSystem();    
        if (/Windows/.test(os)) {
            orientation = this.getPageOrientation();
        } else {
            let native_type = this.screenOrientation.type;
            if (native_type) {
                if (native_type == this.screenOrientation.ORIENTATIONS.LANDSCAPE ||
                    native_type == this.screenOrientation.ORIENTATIONS.LANDSCAPE_PRIMARY ||
                    native_type == this.screenOrientation.ORIENTATIONS.LANDSCAPE_SECONDARY)
                    orientation = "landscape"
            } else {
                orientation = this.getPageOrientation();
            }
        }

        return orientation;
       
    }
   
    /**
    * Get page orientation based on page size: get page with and height
    */
    private getPageOrientation() {
        let orientation = "landscape";

        let width = window.screen.width || window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        let height = window.screen.height || window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        if (width < height)     orientation = "portrait";

        return orientation;
    }
    
    // Register back button
    ionViewDidEnter() {	
        this.appInit.initApplication();
    }
}
