const express = require('express')
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const db = require('./database.js')
const respond = require('./responses.js')

var crypto = require('crypto');
dotenv.config();
const app = express()
const port = 8080

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Authentication
app.post('/auth', (req, res) => {

    //Check Body Parameters
    if(!req.body.username || !req.body.password){
        return respond.badRequest(res,"Please enter username & Password")
    }

    var username = req.body.username
    var password = crypto.createHash('sha256').update(req.body.password).digest('base64')
    
    //Check Password
    db.query(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        [username,password],
        function(err,results){
            if(results.length>0){

                let jwtSecretKey = process.env.JWT_SECRET_KEY;
                let data = {
                    userId: results[0].id
                }
            
                const token = jwt.sign(data, jwtSecretKey);

                return respond.OK(res,"Authentication Success",{
                    token: token
                })
            }else{
                return respond.unauthorized(res)
            }
        }
    )

})

//List Products
app.get('/product',(req,res)=>{

    //List products from database
    db.query(
        "SELECT * FROM products",
        function(err,result){

            return respond.OK(res,"Success",result)
        }
    )
})

//Add Product Route
app.post('/product',(req,res)=>{

    const token = getToken(req)
    if(!isValidJWT(token)){
        return respond.unauthorized(res)
    }

    const userID = getIdFromToken(token)

    //Check Product Parameters
    if(!req.body.product_name || !req.body.product_qty){
        return respond.badRequest(res,"Please enter name & qty")
    }

    //Insert product into database
    db.query(
        "INSERT INTO products(name,quantity,user_id) VALUES(?,?,?)",
        [req.body.product_name,req.body.product_qty,userID],
        function(err,result){
            if(result.affectedRows>0){
                return respond.created(res,"Product Created")
            }else{
                return respond.serverError(res,"Unable to create Product")
            }
        }
    )
})

//Delete Product Route
app.delete('/product/:id',(req,res)=>{

    const token = getToken(req)
    if(!isValidJWT(token)){
        return respond.unauthorized(res)
    }

    //Delete product from database
    db.query(
        "DELETE FROM products WHERE id = ?",
        [req.params.id],
        function(err,result){
            if(result.affectedRows>0){
                return respond.OK(res,"Product Deleted")
            }else{
                return respond.serverError(res,"Unable to delete Product")
            }
        }
    )    
})

//Update Stock
app.put('/product/:id/stock',(req,res)=>{
    
    const token = getToken(req)
    if(!isValidJWT(token)){
        return respond.unauthorized(res)
    }

    //Check Product Parameters
    if(!req.body.product_qty){
        return respond.badRequest(res,"Please enter qty")
    }

    //Update product stock into database
    db.query(
        "UPDATE products SET quantity = ? WHERE id = ?",
        [req.body.product_qty,req.params.id],
        function(err,result){
            if(result.affectedRows>0){
                return respond.created(res,"Stock Updated")
            }else{
                return respond.serverError(res,"Unable to update Stock")
            }
        }
    )
})





//Grab JWT From header
function getToken(req){

    const token = req.header('Authorization')

    if(token.split(' ').length > 1)
    return token.split(' ')[1]

}

//Check if JWT is valid
function isValidJWT(token){
    try{
        return jwt.verify(token,process.env.JWT_SECRET_KEY)
    }catch(e){
        return false
    }
}

//Grab user id From token
function getIdFromToken(token){

    return jwt.decode(token).userId
}

app.listen(port, () => {
  console.log(`Express Server Started at http://localhost:${port}`)
})