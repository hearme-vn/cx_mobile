import { Component, ViewChild, ElementRef } from '@angular/core';
import { Config } from '../../app/config';
import { AppInit } from '../../providers/app-init/app-init';

import { Slides } from 'ionic-angular';
//@IonicPage()
@Component({
    selector: 'page-collection',
    templateUrl: 'collection.html',
})
export class CollectionPage {
    @ViewChild('videoIframe') videoIframe: ElementRef;
    @ViewChild(Slides) slides: Slides;
    
    private tabs=null;  
    public collectionPage=true;
    
    private collections:any = [];
    public linkIdle = 'assets/imgs/splash.png';
    public linkVideo = '';
    public mediaType = 0;//0: default, 1: image, 2: youtube
    public imgServer = "";
    
    constructor(//public navCtrl: NavController, public navParams: NavParams, private platform: Platform,
        private appInit: AppInit, 
        private config: Config) {
    }
    
    ionViewDidEnter() {
        this.tabs = this.appInit.tabs;    
        this.getTabsInfo();
    }
    ionViewDidLeave() {
        if(this.videoIframe)    this.stopVideo();
        //this.videoIframe.nativeElement.setAttribute("src", '');
    }

    public getMyStyles(item){
        //console.log('item', item);
        let myStyles = {
            'background-image': "url('" + this.config.img_server + item.fileName + "')"
        };
        return myStyles;
    }
    
    public getTabsInfo() {
        if (this.tabs && this.tabs.length>1) {
            let tab = this.tabs[1];
            if (tab.collection.length > 0) {//collection
                this.mediaType = 1;
                this.collections = tab.collection;
            } else {//youtube
                this.mediaType = 2;
                let videoId = this.YouTubeGetID(tab.params);
                this.linkVideo = "https://youtube.com/embed/" + videoId + "?rel=0&fs=0&controls=0&version=3&playlist=" + videoId + "&loop=1&enablejsapi=1";
                setTimeout(() => {
                    this.playVideo();
                }, 5000);
            }
        }
    }
    
    private stopVideo = function() {
        //console.log('stopVideo');
        let listaFrames = document.getElementsByTagName("iframe");
        for (var index = 0; index < listaFrames.length; index++) {
            let iframe = listaFrames[index].contentWindow;
            iframe.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
        }
        setTimeout(() => {
            //exit fullscreen if play video
            this.videoIframe.nativeElement.setAttribute("src", this.videoIframe.nativeElement.getAttribute("src"));
        }, 1000);
    }
    
    private playVideo = function() {
        //console.log('playVideo');
        let listaFrames = document.getElementsByTagName("iframe");
        for (var index = 0; index < listaFrames.length; index++) {
        let iframe = listaFrames[index].contentWindow;
        iframe.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        }
    }

    private YouTubeGetID(url){
        var ID = '';
        url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
        if(url[2] !== undefined) {
            ID = url[2].split(/[^0-9a-z_\-]/i);
            ID = ID[0];
        } else {
            ID = url.toString();
        }
        return ID;
    }
    
    // Stop autoplay and handl swipe event
    // TypeError: Cannot read property 'hasAttribute' of undefined
    public slideChanged() {
        // this.slides.stopAutoplay();
        this.slides.startAutoplay();

    }
    
}
