var admobid = {};

if (/(android)/i.test(navigator.userAgent)) {
    admobid = { // for Android
        banner: 'ca-app-pub-9997665567497408/4295329945',
        interstitial: 'ca-app-pub-9997665567497408/1120512745'
    };
} else if (/(ipod|iphone|ipad)/i.test(navigator.userAgent)) {
    admobid = { // for iOS
        banner: 'ca-app-pub-9997665567497408/4295329945',
        interstitial: 'ca-app-pub-9997665567497408/1120512745'
    };
} else {
    admobid = { // for Windows Phone
        banner: 'ca-app-pub-9997665567497408/4295329945',
        interstitial: 'ca-app-pub-9997665567497408/1120512745'
    };
}

if (( /(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent) )) {
    document.addEventListener('deviceready', initApp, false);
} else {
    initApp();
}

function initApp() {
    if (!AdMob) {
        console.log('admob plugin not ready');
        return;
    }

    AdMob.createBanner({
        license: '3591d315ba80772d8a05bd1bd4ef3bc9',
        adId: admobid.banner,
        isTesting: true,
        //overlap: false,
        //offsetTopBar: false,
        position: AdMob.AD_POSITION.BOTTOM_CENTER,
        autoShow: true
        //bgColor: 'black'
    });

    AdMob.prepareInterstitial({
        license: '3591d315ba80772d8a05bd1bd4ef3bc9',
        adId: admobid.interstitial,
        autoShow: false
    });
}