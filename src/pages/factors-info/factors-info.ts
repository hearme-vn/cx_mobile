import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { AppInit } from '../../providers/app-init/app-init';
import { CONSTANTS } from '../../providers/feedback-service/constants';

@Component({
    selector: 'page-factors-info',
    templateUrl: 'factors-info.html',
})
export class FactorsInfoPage {
    public survey;
    public surveyInfo = [];

    constructor(
        private appInit: AppInit, public viewCtrl: ViewController) {

    }

    private loadPage(){
        this.survey = this.appInit.survey;
        for (let i = 0; i < this.survey.subs.length; i++) {
            if (this.survey.subs[i].description) {
                this.surveyInfo.push(this.survey.subs[i]);
            }
        }
    }

    ionViewDidEnter() {
        this.loadPage();
    }

    closeModal() {
        this.viewCtrl.dismiss();
    }

}
