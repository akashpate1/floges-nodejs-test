//Send Bad Request Response
function badRequest(res,message){
    res.status(400).json({
        'status':400,
        'message':message
    })
}

//Send OK Response
function OK(res,message,data=false){
    if(data){
        res.status(200).json({
            'status':200,
            'message':message,
            'data' : data
        })
    }else{
        res.status(200).json({
            'status':200,
            'message':message,
        })
    }

    
}

//Send Created Response
function created(res,message){
    res.status(201).json({
        'status':201,
        'message':message
    })
}

//Send Unauthorized Response
function unauthorized(res){
    res.status(401).json({
        'status':401,
        'message':'Unauthorized'
    })
}

//Send Server Error Response
function serverError(res,message){
    res.status(500).json({
        'status':500,
        'message':message
    })
}


module.exports = {badRequest,OK,unauthorized,created,serverError}