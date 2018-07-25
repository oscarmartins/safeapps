w2utils.settings.dataType = 'JSON'
$.ajaxSetup({
    beforeSend: function (xhr) {
        const xtoken = orctokenmanager.retrieveToken()
        if (xtoken) {
            xhr.setRequestHeader('Authorization', xtoken)
        }         
        this.newUrl = top.location.hash
        if (this.newUrl.indexOf('?') >= 0) {
            this.newUrl = this.newUrl.substr(0, this.newUrl.indexOf('?'))
        }
        xhr.setRequestHeader('fromRoute', this.newUrl)       
        if (typeof orcsettings !== "undefined") {                
            xhr.setRequestHeader('severContext', orcsettings.server.context)    
        } else {
            if (w2ui && w2ui.layout)
                w2ui.layout.lock('main', 'erro ao sincronizar dados...', true);
        }
    }
})

function updateOrcSettings (_settings) {
    if (typeof orcsettings === "undefined") {
        top.window['orcsettings'] = {}
    }
    Object.assign(orcsettings,(typeof _settings === 'object' ? _settings : JSON.parse(_settings)))                
    //overwrite serverUrlApi
    if (orcsettings.server) {
        orcsettings.server.serverUrlApi = orcsettings.server.local_server_path
    }
    if (orcsettings.serverActions) {
        _serverActions = orcsettings.serverActions
        if (_serverActions.redirect && _serverActions.redirect.url) {
            top.orctokenmanager.removeToken();
            if (top.location.hash !== _serverActions.redirect.url) {
                top.location.hash = _serverActions.redirect.url 
                top.location.reload()
            }            
            return false
        }
    }
    return true 
}

function initApp () {
    orcmanager.viewController.sync(function (point) {
        if (point === 'init') {
            var pstyle = 'border: 1px solid #dfdfdf; ';
            orcmanager.w2uiGlobal.destroy('layout')
            $('#layout').w2layout({
                name: 'layout',
                panels: [
                    { type: 'main', style: pstyle, content: 'loading' },
                    { type: 'top', style: pstyle, content: '' },
                    { type: 'left', style: pstyle, content: '' },
                    { type: 'right', style: pstyle, content: '' },
                    { type: 'bottom', style: pstyle, content: '' }
                ],
                onRender: function (event) {
                    setTimeout(function (panel) {
                        panel.unlock('main');
                    }, 1200, this)
                }
            });
            w2ui['layout'].load('main', 'app/data/index.html');
            w2ui['layout'].toggle('top', window.instant);
            w2ui['layout'].toggle('left', window.instant);
            w2ui['layout'].toggle('right', window.instant);
            w2ui['layout'].toggle('bottom', window.instant);
            w2ui.layout.lock('main', 'sincronizar...', true);
        }
    }.bind(null, 'init'))
}

function refreshAll () {
    orcmanager.viewController.sync(function () {
        setTimeout(orcmanager.viewController.initToolbar, 10)
        setTimeout(orcmanager.viewController.initSidebar, 20)
    })
}

function ServerActions () {
    this.verify = function (obj) {
        if (obj && obj.action) {
            if (obj.action && typeof top[obj.action] === 'function') {
                setTimeout(top[obj.action], 1)
            }
        }
    }
}

top.window['orcmanager'] = {
    viewController: {
        url_path: '//localhost:8081/orcv2/viewController',
        sync: function (callbk) {
            const _self = this
            $.get(_self.url_path, function (rsp){
                if (updateOrcSettings(rsp)) {
                    if (typeof callbk !== 'undefined' && typeof callbk === 'function') {
                        callbk(rsp)
                    }      
                }                              
            }).error(function(e){
                alert('não foi possivel resolver o pedido, por favor tente mais tarde. Obrigado.')
                setTimeout(function() {
                    top.location.href = '/app/data/noauth.html'
                }, 800)
            })
        },
        _initApp: initApp,
        initToolbar: function() {
            this.orctoolbar = null
            if(w2ui['orc_toolbar']){
                orcmanager.w2uiGlobal.destroy('orc_toolbar');
            }
            if (typeof orcsettings === "undefined") {
                w2ui.layout.lock('main', 'toolbarLoaded() erro ao sincronizar dados...', true)
            } else {
                const cfg = orcsettings.orc_toolbar
                this.orctoolbar = $('#orc_toolbar').w2toolbar(cfg);
                w2ui.orc_toolbar.on('click', function (event) {
                    try {     
                        if (event.object.route) {
                            orcmanager.w2uiGlobal.destroy('orc_sidebar')
                            top.location.hash = event.object.route                           
                            w2ui['layout'].load('main', event.object.route)   
                        } else {
                            if (event.object.action) {
                                const serverActions = new ServerActions()
                                serverActions.verify({action: event.object.action})
                            }
                            
                        }
                                                     
                    } catch (error) {
                        alert('error', error)
                    }
                })
                w2ui.layout.content('top', w2ui.orc_toolbar)
                w2ui.layout.refresh('top')
            }
        },
        initSidebar: function () {
            this.orcsidebar = null
            if(w2ui['orc_sidebar']){
                orcmanager.w2uiGlobal.destroy('orc_sidebar')
            }
            if (typeof orcsettings === "undefined") {
                w2ui.layout.lock('main', 'sidebarLoaded() erro ao sincronizar dados...', true)
            } else {
                this.cfg = orcsettings.orc_sidebar
                this.orcsidebar = $('#orc_sidebar').w2sidebar(this.cfg)
                top.w2ui.orc_sidebar.onClick = function (event) {
                    w2ui.layout.get('main').content = ''
                    w2ui.layout.refresh('main')
                    event.onComplete = function () {
                        this.url = 'app/pages/{pageName}.html'.replace('{pageName}', event.node.id)
                        w2ui.layout.load('main', this.url, 'slide-left', function () {
                            console.log('content loaded')
                        });
                    }            
                }
                w2ui.layout.content('left', w2ui.orc_sidebar)
                w2ui.layout.refresh('left')
                w2ui.layout.show('left')
            }
        }
    },
    w2uiGlobal: {
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
        /**
        const xhr = new XMLHttpRequest
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                updateOrcSettings(xhr.responseText)
            }
        }
        xhr.onload = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                JSON.parse(xhr.responseText)
            }
        }
        xhr.open('GET', '//localhost:8081/orcv2/viewController', true)
        xhr.setRequestHeader('Authorization', orctokenmanager.retrieveToken())  
        xhr.send()
        */
       orcmanager.viewController._initApp()
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
        if (w2ui.layout) {
            w2ui.layout.set('top', {title:'.:: Safepremium Group Support ::. [ver1.1.18] :: '})
            w2ui.layout.refresh('top')
        }        
    }
}
