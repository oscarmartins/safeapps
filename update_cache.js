function checkForUpdate() {
    if (window.applicationCache != undefined && window.applicationCache != null) {
        window.applicationCache.addEventListener('updateready', updateApplication);
    }
}

function updateApplication(event) {
    if (window.applicationCache.status != 4) return;
    window.applicationCache.removeEventListener('updateready', updateApplication);
    window.applicationCache.swapCache();
    window.location.reload();
}

function verificarNovaVersio (callback) {
    var sVersio = localStorage['gcf_versio'+ location.pathname] || 'v00.0.0000';
    $.ajax({
        url: "./versio.txt",
        dataType: 'text', 
        cache: false, 
        contentType: false, 
        processData: false,
        type: 'GET'
     }).done(function(sVersioFitxer) {
        console.log('Versió App: '+ sVersioFitxer +', Versió Caché: '+ sVersio);
        if (sVersio < (sVersioFitxer || 'v00.0.0000')) {
            localStorage['gcf_versio'+ location.pathname] = sVersioFitxer;
            location.reload(true);
        } else {
            callback()
        }
    }).error(function (err) {
        debugger
    });
}

function forceGet (callback) {
    verificarNovaVersio(callback)
}