const jwt = require('jsonwebtoken')

const createAccesToken = (user) =>{
    return jwt.sign(
        {
            id: user.id,
            name: user.name
        },
        process.env.TOKEN_SECRET,
        { expiresIn: process.env.TOKEN_LIFE }
    )
}

const createRefreshToken = (user) =>{
    return jwt.sign(
        {
        id: user.id,
        name: user.name
        },
        process.env.TOKEN_REFRESH,
        { expiresIn: process.env.REFRESH_TOKEN_LIFE }
    )
}

module.exports = { createAccesToken, createRefreshToken }