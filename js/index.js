w2utils.settings.dataType = 'JSON'
const url_setup = '/app/simulator/start.json'
const xhr = new XMLHttpRequest
top.window['orcsettings']={}
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        debugger
        orcsettings = JSON.parse(xhr.responseText)
        //overwrite serverUrlApi
        orcsettings.server.serverUrlApi = orcsettings.server.local_server_path
    }
}
xhr.onload = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        debugger
        JSON.parse(xhr.responseText)
    }
}
xhr.open('GET', url_setup, true)
xhr.send()

top.window['orctokenmanager'] = {
    keys: ['access_token', 'Bearer', 'status', 'success', 'dataresponse', 'output', ' {{Bearer}} {{access_token}}', '{{Bearer}}', '{{access_token}}', '.'],
    clientAuth: function (httpJsonResponse) {
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
    }
}
