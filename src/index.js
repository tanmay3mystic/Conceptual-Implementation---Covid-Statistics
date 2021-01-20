const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const port = 8080

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require('./connector');
const covidTallyModel = connection ;

app.get("/totalRecovered" , async(req,res)=>{

    const resDoc = await covidTallyModel.aggregate([
        {$group : {
            _id : "total" , 
            recovered:{$sum:"$recovered"},
            count : {$sum:1}
        }}
    ])

    res.send({data:resDoc[0]});
})

app.get("/totalActive" , async(req,res)=>{
    const resDoc = await covidTallyModel.aggregate([
        {
            $project:{
                active : {$subtract:["$infected","$recovered"]}
            }
        },
        {$group : {
            _id : "total" , 
           active: { $sum: "$active" }
        }}
    ])

    res.send({data:resDoc[0]});
})

app.get("/totalDeath" , async(req,res)=>{
    const resDoc = await covidTallyModel.aggregate([
        {$group : {
            _id : "total" , 
            death:{$sum:"$death"}
        }}
    ])

    res.send({data:resDoc[0]});
})

app.get("/hotspotStates" , async(req,res)=>{

    const resDoc = await covidTallyModel.aggregate([
        {
            $project:{
                _id:0,
                state:"$state",
                rate:{$round:[ {$divide:[ {$subtract:["$infected","$recovered"]} , "$infected"]} ,5]}
            }
        },
        {
            $match: {
                rate:{$gt:0.1}
            }
        }
    ])
    res.send({data:resDoc});
    
})

app.get("/healthyStates" , async(req,res)=>{
    const resDoc = await covidTallyModel.aggregate([
        {
            $project:{
                _id:0,
                state:"$state",
                mortality:{$round:[ {$divide:[ "$death" , "$infected"]} ,5]}
            }
        },
        {
            $match: {
                mortality:{$lt:0.005}
            }
        }
    ])
    res.send({data:resDoc});
})







app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;