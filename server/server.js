const mongoose = require('mongoose')
const Document = require('./document')

//connects to db through mongoose
mongoose.connect('mongodb://127.0.0.1:27017/google-docs-clone');

//imports the socket io, but as a function, and we pass it the port where we run the code
const io = require('socket.io')(3001,{
    cors:{
        //we setup what url our clients communicate from, we use port 3001 for server and 3000 for clients
        origin: 'http://localhost:3000',
        //setup what methods are allowed
        methods: ['GET','POST'],
    },
})

//default document value
const defaultValue = ""

//everytime a client connects this io.on is run
io.on("connection", socket=>{
    //gets the document
    socket.on('get-document', async documentId =>{
        const document = await findOrCreateDoc(documentId)
        //makes sure everyone with same id is in the same document
        socket.join(documentId)
        socket.emit('load-document', document.data)

        //gets the message emitted from client, and broadcast it through the socket
    socket.on('send-changes', delta => {
        socket.broadcast.to(documentId).emit("receive-changes", delta)
    })

    //saves our document with new data
    socket.on("save-document", async data =>{
        await Document.findByIdAndUpdate(documentId, {data})
    })
    })
})

//checks if the document already exists or if a new one needs to be made
async function findOrCreateDoc(id){
    if (id == null) return

    //checks document and return a document if it exists, if not creates a new one
    const document = await Document.findById(id)
    if(document) return document
    return await Document.create({_id: id, data: defaultValue})
}