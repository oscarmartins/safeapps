w2utils.settings.dataType = 'JSON'
const url_setup = orcsettings.server.serverUrlApi + '/viewController' // orcsettings.server.serverUrlApi + '/viewController'
$.ajaxSetup({
    beforeSend: function (xhr) {
        const xtoken = orctokenmanager.retrieveToken()
        if (xtoken) {
            xhr.setRequestHeader('Authorization', xtoken)
        }      
        if (typeof orcsettings !== "undefined") {                
            xhr.setRequestHeader('severContext', orcsettings.server.context)    
        } else {
            w2ui.layout.lock('main', 'erro ao sincronizar dados...', true);
        }
    }
})

function updateOrcSettings (_settings) {
    if (typeof orcsettings === "undefined") {
        top.window['orcsettings']={}
    }
    orcsettings = JSON.parse(_settings)                
    //overwrite serverUrlApi
    if (orcsettings.server) {
        orcsettings.server.serverUrlApi = orcsettings.server.local_server_path
    }
    orcsettings.w2uiGlobal = {
        destroy: (w2uiAttrObj) => {
            if (w2ui[w2uiAttrObj]) {
                w2ui[w2uiAttrObj].destroy()
                return true
            }
            return false
        }
    }
}

top.window['orctokenmanager'] = {
    keys: ['access_token', 'Bearer', 'status', 'success', 'dataresponse', 'output', ' {{Bearer}} {{access_token}}', '{{Bearer}}', '{{access_token}}', '.'],
    loadPage: function () {
        const xhr = new XMLHttpRequest
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                updateOrcSettings(xhr.responseText)
                setTimeout(function (point) {
                    if (point === 'init') {
                        var pstyle = 'border: 1px solid #dfdfdf; ';
                        $('#layout').w2layout({
                            name: 'layout',
                            panels: [
                                { type: 'main', style: pstyle, content: 'loading' },
                                { type: 'top', style: pstyle, content: '' },
                                { type: 'left', style: pstyle, content: '' },
                                { type: 'right', style: pstyle, content: '' },
                                { type: 'bottom', style: pstyle, content: '' }
                            ],
                            onRender: function(event) {
                                console.log('object '+ this.name + ' is rendered');
                                setTimeout(function(panel){
                                    panel.unlock('main');
                                }, 1200, this)
                            }    
                        });            
                        w2ui['layout'].load('main', 'app/data/index.html');
                        w2ui['layout'].toggle('top', window.instant);
                        w2ui['layout'].toggle('left', window.instant);
                        w2ui['layout'].toggle('right', window.instant);
                        w2ui['layout'].toggle('bottom', window.instant);
                        w2ui.layout.lock('main', 'sincronizar dados...', true);
                    }
                }, 1200, 'init')
            }
        }
        xhr.onload = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                JSON.parse(xhr.responseText)
            }
        }
        xhr.open('GET', url_setup, true)
        xhr.setRequestHeader('Authorization', orctokenmanager.retrieveToken())  
        xhr.send()
    }, clientAuth: function (httpJsonResponse) {
        let self = orctokenmanager
        if (httpJsonResponse && 
        httpJsonResponse.hasOwnProperty(self.keys[2]) && 
        httpJsonResponse.status === self.keys[3]){
            if (httpJsonResponse.hasOwnProperty(self.keys[4]) && 
            httpJsonResponse.dataresponse &&
            httpJsonResponse.dataresponse.status === 200){
                let dataresponse = httpJsonResponse.dataresponse
                if (dataresponse.hasOwnProperty(self.keys[5]) && 
                dataresponse.output.hasOwnProperty(self.keys[0]) && 
                dataresponse.output[self.keys[0]]) {
                    self.storeToken(dataresponse.output[self.keys[0]])
                    return true
                }
            }
        }
        return false
    },
    storeToken: function (xtoken) {
        localStorage.setItem(orctokenmanager.keys[0], xtoken)
    },
    retrieveToken: function () {
        const xstoken = localStorage.getItem(orctokenmanager.keys[0])
        return orctokenmanager.keys[6].replace(orctokenmanager.keys[7], orctokenmanager.keys[1]).replace(orctokenmanager.keys[8], xstoken ? xstoken : orctokenmanager.keys[9]) 
    },
    removeToken: function () {
        localStorage.removeItem(orctokenmanager.keys[0])
    }
}
