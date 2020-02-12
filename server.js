var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')


mongoose.Promise = Promise
var dbUrl = 'mongodb://hejaze:kokowawa123@localhost:27017/Learning-Node'

var Message = mongoose.model('Message' , {
    name : String,
    message : String
})


app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

app.get('/messages' , (req,res)=>{
    Message.find({} , (err,messages) =>{
        res.send(messages)
        console.log(messages)
    })
})

app.post('/messages' , async (req,res)=>{
    try {
        var message = new Message(req.body)
        var savedMessage = await message.save()
        console.log('saved')
        var censored = await Message.findOne({ message:'badword'})
        if (censored){
                console.log('censored words found : ', censored)
                await Message.deleteOne({ _id:censored.id})
                } else {
                console.log(req.body)
                // emit new message to all subscribed sockets
                io.emit('message' , req.body)
                res.sendStatus(200)
                }
    } catch (error) {
        res.sendStatus(500)
        return console.error(error)
    } finally {
        console.log("This is Finally Block")
    }
    
})

/*
app.post('/messages' , (req,res)=>{
    var message = new Message(req.body)
    // using promisies to get rid of nested callbacks
    message.save()
    .then(() => {
            // check if there are any badwords and remove them
            console.log("saved")
            return Message.findOne({ message:'badword'})
    })
    .then( censored => {
        if (censored){
            console.log('censored words found : ', censored)
            return Message.deleteOne({ _id:censored.id})
            }
            console.log(req.body)
            // emit new message to all subscribed sockets
            io.emit('message' , req.body)
            res.sendStatus(200)
    })
    .catch((err) => {
            res.sendStatus(500)
            return console.error(err)
        })
    })
    */

    /*
    // without using promises
    message.save((err) => {
        if(err) {
            sendStatus(500)
            console.log(err)
        } else {
            // check if there are any badwords and remove them
            Message.findOne({ message:'badword'} , (err,censored) =>{
                if (censored){
                    console.log('censored words found : ', censored)
                    Message.deleteOne({ _id:censored.id}, (err) => {
                        console.log("removed censored message")
                    })
                }
            })
            console.log(req.body)
            // emit new message to all subscribed sockets
            io.emit('message' , req.body)
            res.sendStatus(200)
        }
    })
    */


io.on('connection' , (socket) => {
    console.log("A user Connected")
})

mongoose.connect(dbUrl , { useUnifiedTopology: true , useNewUrlParser: true } , (err) =>{
    console.log("Database Connection : " , err)
})
var server = http.listen(3000 , () => {
    console.log("Listening to port " , server.address().port)
})