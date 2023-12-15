import { Component } from '@angular/core';
import { AppInit } from '../../providers/app-init/app-init';

//@IonicPage()
@Component({
    selector: 'page-idle',
    templateUrl: 'idle.html',
})
export class IdlePage {
    public urlParams=null;
 
    //@ViewChild('videoIframe') videoIframe: ElementRef; 
    constructor(
        private appInit: AppInit, 
        ) {

        this.urlParams = this.appInit.urlParams;
    }
}
