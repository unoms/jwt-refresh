const output=document.getElementById('output')
const secretOutput = document.getElementById('secret')
        
        //Login
        document.getElementById('submit')
        .addEventListener('click', (e)=>{
            e.preventDefault()
            //Clean outputs
            output.textContent = ''
            secretOutput.textContent =''
            //Get values from the form
            const form = document.getElementsByTagName('form')[0]
            const name = form.elements['name'].value
            const password = form.elements['password'].value

            if( name && password){
                let url = '/login'
                fetch(url, {
                    method: 'POST',
                    body: JSON.stringify({ name, password }),
                    headers: {'Content-Type': 'application/json'}
                })
                .then( response => response.json())
                .then( data => {
                    if(data.error){
                        output.textContent = data.error
                    }
                    if(data.token){
                        //Save tokens in localStorage
                        localStorage.setItem('token', 'bearer ' + data.token)
                        output.textContent = "Now, press 'Get Secret'"
                    }
                })
                .catch(err => {
                    console.log(err)
                    output.textContent = err.message
                })
            }else{
                output.textContent ="Please, enter name and password"
            }
        })//End of login

        //Get information for only authorized users
        document.getElementById('secret-path')
            .addEventListener('click', ()=>{
                    //Clean the field with secret info
                    secretOutput.textContent = ''

                    //check if token exists
                    let token = localStorage.getItem('token')
                                
                    if(token){
                        const result = getSecret(token)
                        result.then(response => {
                            //status: 0 means - success, status: 1 means there's an error
                            if(response && !response.status){
                                //Print secret info
                                secretOutput.textContent = response.message
                            }else if(response && response.status){//Token expires              
                                //We need to renew token
                                const result = getRefreshToken()
                                result.then(data =>{
                                    if(data.token){
                                        //Save a new token in localStorage
                                        const tokenNew = 'bearer ' + data.token
                                        localStorage.setItem('token', tokenNew)
                                        //Get secret information
                                        const result = getSecret(tokenNew)
                                        result.then(response =>{
                                            if(response && !response.status){
                                                secretOutput.textContent = response.message
                                            }else{
                                                output.textContent ="Please, login again"
                                            }
                                        })
                                        .catch(e => console.log(e))
                                    }else if(data.error){
                                        output.textContent = data.error
                                    }
                                }).catch(err => console.log(err))
                            }
                        })
                        .catch(e=> console.log(e))
                    }else{
                        secretOutput.textContent = "You are not authorized!"
                    }
            })

            //Logout
            document.getElementById('logout')
                .addEventListener('click', ()=>{
                    //Remove token from localstorage
                    localStorage.removeItem('token')

                    output.textContent = ''
                    secretOutput.textContent = ''

                    //Ask our server to delete refresh token
                    fetch('/reject',{
                        method: 'POST'
                    }).then(response => response.json())
                    .then(data => output.textContent = data.message)
                    .catch(e => console.error(e))
                })