const env = process.env.ENV || "development";
require('dotenv').config();

module.exports = {
    env,
    ...(()=>({
        development: {
            baseURL: ""
        },
        production: {
            baseURL: "/sala-de-bate-papo"
        }
    })[process.env.ENV])()
}