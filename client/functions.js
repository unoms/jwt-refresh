
function getRefreshToken(){
    return new Promise(function(resolve, reject){
        fetch('/refresh')
        .then(response => response.json())
        .then(data => resolve(data))
        .catch(err => {
            reject(err)
        })
    })
}

function getSecret(t){
    let token = t
    return new Promise(function(resolve, reject){
        let url = '/secret'
        let header = new Headers()
        header.append("Authorization", token)
        let req = new Request(url,{
            headers: header,
            method: "GET"
        })

        fetch(req)
            .then(response =>  response.json())
            .then(data => resolve(data))
            .catch( e =>{
                reject(e)
            })
    })
}