import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpModule, Http } from '@angular/http';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
// import { Camera, CameraOptions } from '@ionic-native/camera';
import {File, FileEntry} from '@ionic-native/file';

import { MyApp } from './app.component';
import { Config } from './config';

import { WelcomePage } from '../pages/welcome/welcome';
import { ThanksPage } from '../pages/thanks/thanks';
import { FactorsInfoPage } from '../pages/factors-info/factors-info';
import { IdlePage } from '../pages/idle/idle';
import { CollectionPage } from '../pages/collection/collection';
import { TabsPage } from '../pages/tabs/tabs';
import { IndexSurveyPage } from '../pages/index-survey/index-survey';
import { SupportSurveyPage } from '../pages/support-survey/support-survey';
import { CameraPage } from '../pages/camera/camera';

import { AuthService } from '../providers/auth-service/auth-service';
import { AppInit } from '../providers/app-init/app-init';
//import { SqliteProvider } from '../providers/sqlite/sqlite';
import { Youtube } from '../pipes/youtube/youtube';
import { IonRating } from '../components/ion-rating/ion-rating';
//import { Toast } from '@ionic-native/toast';

import { NgxQRCodeModule } from 'ngx-qrcode2';
import { FeedbackService} from '../providers/feedback-service/feedback-service';
import { BaseService} from '../providers/feedback-service/base-service';
import { Util} from '../providers/feedback-service/utils';
import { IonfooterComponent } from '../components/ionfooter/ionfooter';
import { HeaderComponent } from '../components/header/header';
import { CSATComponent } from '../components/csat/csat';
import { CESComponent } from '../components/ces/ces';
import { NPSComponent } from '../components/nps/nps';
import { FLXComponent } from '../components/flx/flx';
import { STARSComponent } from '../components/stars/stars';
import { MULTISELECTIONComponent } from '../components/multi-selection/multi-selection';
import { SINGLESELECTIONComponent } from '../components/single-selection/single-selection';
import { TextComponent } from '../components/text/text';
import { FormBasedComponent } from '../components/form-based/form-based';
import { ContactComponent } from '../components/contact/contact';
import { UploaderComponent, ViewImagePage } from '../components/uploader/uploader';
import { INFOComponent } from '../components/info/info';

@NgModule({
    declarations: [
        MyApp,
        // HomePage,
        // LoginPage,
		WelcomePage,
//        CommentPage,
        ThanksPage,
        FactorsInfoPage,
        IdlePage,
        CollectionPage,
        TabsPage,
        // QuestionPage,
        // NpsPage,
        // CesPage,
        // FlxPage,
        Youtube,
        IonRating,
        // MultiFactorPage,
        // ExclusiveFactorPage,
        // ContactPage,
        HeaderComponent,
        IonfooterComponent,
        // MessagePage,
        // WelcomePage,
        IndexSurveyPage,
        SupportSurveyPage,
        CameraPage,
        ViewImagePage,
        IonfooterComponent,
        HeaderComponent,
        CSATComponent,
        CESComponent,
        NPSComponent,
        FLXComponent,
        STARSComponent,
        MULTISELECTIONComponent,
        SINGLESELECTIONComponent,
        TextComponent,
        FormBasedComponent,
        ContactComponent,
        UploaderComponent,
        INFOComponent
        
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(MyApp),
        HttpModule,
        NgxQRCodeModule,
        TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: (createTranslateLoader),
				deps: [Http]
			}
        })
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        // HomePage,
        // LoginPage,
        WelcomePage,
        // CommentPage,
        ThanksPage,
        FactorsInfoPage,
        IdlePage,
        CollectionPage,
        TabsPage,
        // QuestionPage,
        // NpsPage,
        // CesPage,
        // FlxPage,
        // MultiFactorPage,
        // ExclusiveFactorPage,
        // ContactPage
        IndexSurveyPage,
        SupportSurveyPage,
        CameraPage,
        ViewImagePage
    ],
    providers: [
        //StatusBar,
        //SplashScreen,
        {provide: ErrorHandler, useClass: IonicErrorHandler},
        Config,
        AuthService,
        AppInit,
        //Device,
        //AndroidFullScreen,
        //Autostart,
        ScreenOrientation,
        //Dialogs,
        //BarcodeScanner,
        // SqliteProvider,
        //Toast,
        FeedbackService,
        Util,
        // Camera,
        File,
        BaseService
    ]
})
export class AppModule {}


export function createTranslateLoader(http: Http) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
