const express = require('express')
const path = require('path')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const tokenHelper = require('./tokenHelper')

const app = express()
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

const PORT = process.env.PORT || 3030

//Mock users
const users =[
    {
        id:1,
        name:"serge",
        password: 123
    },
    {
        id:2,
        name:"lena",
        password: 321
    }
]

//Save refresh tokens. Should be stored in Redis, for instance
let refreshTokens = []

//Midleware
app.use(express.static(path.join(__dirname, 'client')))
app.use(cookieParser())

app.post('/login', async(req, res)=>{
    const {name, password} = req.body
    //Check user's credentials in DB
    const user = users.find( u => u.name === name && u.password === Number(password))
    if(user){
        try{
            //Create token and refresh token
            const token = tokenHelper.createAccesToken(user)
            const refresh = tokenHelper.createRefreshToken(user)

            //Save refresh token in an array
            refreshTokens.push(refresh)

            //Save refresh token to Cookies
            res.set({'Set-Cookie': `refresh=${refresh};max-age=86400;HttpOnly;samesite=lax`})

            //Send token to a client
            res.status(201).json({ token })
        }catch(e){
            console.error('Error creating token', e)
            res.status(500).json({ error: 'Something went wrong' })
        }
    }else{
        res.status(401).json({ error: 'You are not allowed!' })
    }
})

app.get('/secret', verifyToken, (req, res)=>{
    //status: 0 means - success, status: 1 means there's an error
    res.json({ message: 'Some secret information', status: 0})
})

app.get('/refresh', (req, res)=>{
    //Get refresh token from cookie
    let refresh = req.headers['cookie'];
    if(refresh){
        refresh = refresh.split('=')[1]
        if(refreshTokens.includes(refresh)){
            try{
                const payload = jwt.decode(refresh)
                const token = tokenHelper.createAccesToken({id: payload.id, name: payload.name})
                res.json({ token })
            }catch(e){
                console.error('Error creating token', e)
                res.status(500).json({ error: 'Something went wrong' })
            }
        }else{
            res.status(404).json({ error: 'Refresh token is not found on the server DB'})
        }
    }else{
        res.status(404).json({ error: 'Refresh token is not found in cookie'})
    }
})

app.post('/reject', (req, res)=>{
    //Delete refresh token from DB
    let refresh = req.headers['cookie'];
    if(refresh){
        refresh = refresh.split('=')[1]
        refreshTokens = refreshTokens.filter(el => el != refresh)
        // console.log(refreshTokens)
        //Remove cookie
        res.set({'Set-Cookie': `refresh=.;path=/;expires=${new Date(0).toUTCString()}`})
        res.status(200).json({message: 'Logout'})
    }else{
        res.status(200).json({message: 'You are already logout'})
    }

})

app.listen(PORT, ()=>{
    console.log(`Server has been started on port ${PORT}`)
})

//Middleware to check a token
function verifyToken(req, res, next){
    const headerBearer = req.headers['authorization']
    if(headerBearer){
        const token = headerBearer.split(' ')[1]
        jwt.verify(token, process.env.TOKEN_SECRET, (err, decode)=>{
            //Here it's possible to filter content if users have some roles...
            if(err){ 
                return res.status(401).json({ message: 'token has expired', status: 1 })}
            next()
        })
    }else{
        res.status(403).json({ message: "You cannot get the secret. Please, login" })
    }
}