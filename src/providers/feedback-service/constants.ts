/**
* Define Constant class
*/
export class CONSTANTS {
    
    /**
    Define Application status 
    */
    public static readonly _STATUS_NOT_INIT_ = 10;
    public static readonly _STATUS_NOT_LOGGED_ = 0;
    public static readonly _STATUS_LOGGED_ = 1;
    public static readonly _STATUS_ATTACHED_ = 2;
    public static readonly _STATUS_ATTACHED_FAILED_ = 3;
    public static readonly _STATUS_ACTIVE_ = 4;
    public static readonly _STATUS_INACTIVE_ = 5;
    public static readonly _STATUS_NO_SURVEY_ = 6;
    public static readonly _STATUS_AVTIVE_SURVEY_ = 7;
    public static readonly _STATUS_SEND_FEEDBACK_ = 8;
    public static readonly _STATUS_SURVEY_FINISHED_ = 9;
    public static readonly _STATUS_SURVEY_READY_ = 11;   

    /**
    Define device receivable value
    */
    public static readonly _DEVICE_NOT_RECEIVABLE_ = 0;
    public static readonly _DEVICE_RECEIVABLE_ = 1;
            
    // Interval to send messages from local storage - in mili seconds
    public static readonly APP_SENDMESSAGE_INTERVAL = 1000;
    public static readonly APP_TOAST_INTERVAL = 3000;
    public static readonly APP_RE_INIT_INTERVAL = 10000;
    public static readonly APP_LOCALSTORAGE_PREFIXKEY = "hearme";
    
    /** Define for Application */
    public static readonly APP_PAGES_DELAY_DEFAULT = 300;   // In seconds
    public static readonly APP_PROMOTIONCODE_LENGTH = 6;   // In seconds
    public static readonly APP_MAIN_COLOR = "#1DCE6C";      // Main corlor: for header, footer

    /** Define Page in tabs */
    public static readonly PAGE_INDEX_WELCOME = 0; 
    public static readonly PAGE_INDEX_THANKS = 1; 
    public static readonly PAGE_INDEX_IDLE = 2; 
    public static readonly PAGE_INDEX_COLLECTIONS = 3;
    public static readonly PAGE_INDEX_LOGIN = 4; 
    public static readonly PAGE_INDEX_SURVEY = 5; 
    public static readonly PAGE_SUPPORT_SURVEY = 6;
    
    /** Define survey type */
    public static readonly SURVEY_TYPE_CSAT = 0; 
    public static readonly SURVEY_TYPE_NPS = 1; 
    public static readonly SURVEY_TYPE_CES = 2; 
    public static readonly SURVEY_TYPE_FACTOR = 3; 
    public static readonly SURVEY_TYPE_MULTISELECTION = 4;
    public static readonly SURVEY_TYPE_SINGLESELECTION = 5;
    public static readonly SURVEY_TYPE_RATING = 6; 
    public static readonly SURVEY_TYPE_TEXT = 7; 
    public static readonly SURVEY_TYPE_MIXED = 8;
    public static readonly SURVEY_TYPE_CONTACT = 9;
    public static readonly SURVEY_TYPE_FLX = 10;
    public static readonly SURVEY_TYPE_INFO = 13;
    
    public static readonly CONFIG_ACTIVE = 0;
    public static readonly CONFIG_INACTIVE = 1;

    public static readonly WELCOMEPAGE_ACTIVE = "true";
    public static readonly WELCOMEPAGE_INACTIVE = "false";

    public static readonly THANKPAGE_STYLE_PAGE = "page";
    public static readonly THANKPAGE_STYLE_POPUP = "popup";
    public static readonly THANKPAGE_DEFAULT_DELAY = 3;
    
    public static readonly FEEDBACK_STATUS_NEW = 0;
    public static readonly FEEDBACK_STATUS_PROCESSING = 1;
    public static readonly FEEDBACK_STATUS_PROCESSED = 2;
    public static readonly FEEDBACK_STATUS_INVALID = 3;
    public static readonly FEEDBACK_STATUS_UNFINISHED = 4;

	/* Define type of device*/
	public static readonly DEVICE_CHANNEL_KIOS = 0;
	public static readonly DEVICE_CHANNEL_WEB = 1;
	public static readonly DEVICE_CHANNEL_EMAIL = 2;
	
	/* Define status of invitation*/
	public static readonly INVITATION_STATUS_ACTIVE = 0;
	public static readonly INVITATION_STATUS_FINISHED = 1;
	public static readonly INVITATION_STATUS_CANCELED = 2;
	
	/* Define status of invitation*/
	public static readonly PROVERBS_TYPE_THANKS = 0;
	public static readonly PROVERBS_TYPE_RATING_BAD = 1;
	public static readonly PROVERBS_TYPE_RATING_GOOD = 2;
	public static readonly PROVERBS_TYPE_GREATING_VALID = 3;
	public static readonly PROVERBS_TYPE_GREATING_INVALID = 4;

    public static readonly THEME_ACTIVE = 0;
    public static readonly THEME_INACTIVE = 1;

    public static readonly MESSAGEPAGE_DEFAULT_DELAY = 120;	// in 120 SECONDs - 2 minutes

    public static readonly APP_ORIENTATION_PORTAIT = "portrait";
    public static readonly APP_ORIENTATION_LANDSCAPE = "landscape";

    /* MAX upload file size IN BYTE*/
    public static readonly FILE_UPLOAD_MAX_SIZE = 300;
    public static readonly IMAGE_ENCODING_DEFAULT="image/jpeg";

    /* Image size when capture from camera */
    public static readonly IMAGE_MAX_SIZE = {
        WIDTH: 640,
        HEIGHT: 640
    };

    /* Image size when capture from camera */
    public static readonly CAPTURE_IMAGE_SIZE = {
        WIDTH: 640,
        HEIGHT: 480
    }    
}
