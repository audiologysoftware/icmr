import express from 'express';
const route = express.Router();


route.get("/", (req,res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json("Login from nodejs");
})

route.post("/", (req, res)=>{
    const {userid, password} = req.body;
    // console.log(userid, password, req.body);
    res.set('Access-Control-Allow-Origin', '*');

    try {        
        if(userid==="1234" && password ==="1234"){           
            res.json({
                message:"user exist",
                response:"success",
                status:"200",
            });
        }
        else{
            res.json({
                message:"user does not exist",
                response:"failed",
                status:"404",
            });
        }
            
    } catch (error) {
        res.json({
            message:"Something went wrong",
            response:"failed",
            status:"404",
        });
    }
});

export default route;
