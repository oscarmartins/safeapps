top.window['orctokenmanager'] = {
    keys: ['access_token', 'Bearer'],
    clientAuth: function (httpJsonResponse) {
        let self = orctokenmanager
        if (httpJsonResponse && 
            httpJsonResponse.hasOwnProperty('status') && 
            httpJsonResponse.status === 'success'){
                if (httpJsonResponse.hasOwnProperty('dataresponse') && 
                    httpJsonResponse.dataresponse &&
                    httpJsonResponse.dataresponse.status === 200){
                        let dataresponse = httpJsonResponse.dataresponse
                        if (dataresponse.hasOwnProperty('output') && 
                            dataresponse.output.hasOwnProperty(self.keys[0]) && 
                            dataresponse.output[self.keys[0]]) {
                            self.storeToken(dataresponse.output[self.keys[0]])
                        }
                }
        }
    },
    storeToken: function (xtoken) {
        localStorage.setItem(orctokenmanager.keys[0], xtoken)
    },
    retrieveToken: function () {
        const xstoken = localStorage.getItem(orctokenmanager.keys[0])
        return ' {{Bearer}} {{access_token}}'.replace('{{Bearer}}', orctokenmanager.keys[1]).replace('{{access_token}}', xstoken ? xstoken : '[no token yet]') 
    }
}
