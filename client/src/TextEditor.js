import {useCallback, useEffect, useState} from 'react'
//import quill
import Quill from "quill"
//imports quill stylesheet
import "quill/dist/quill.snow.css"
//import socket io for client side
import { io } from 'socket.io-client'
import {useParams} from 'react-router-dom'

//how often the document should save in milliseconds, depending on how real time you want it to be ;) 
const SAVE_INTERVAL = 1000

export default function TextEditor() {

    //constant for the document id
    const {id: documenetId} = useParams()
    //we let the sockets use the state function
    const [socket, setSocket] = useState()
    //we let the quill use state functions
    const [quill,setQuill] = useState()
    

    //connect to socket on our servers URL (only runs once due to [] at the end)
    useEffect(()=>{
        const s = io("http://localhost:3001")
        setSocket(s)

        //disconnects when done.
        return()=>{
            s.disconnect()
        }
    },[])

    //lets the user be in seperate documents depending on document id
    useEffect(() => {
        if (socket == null || quill == null) return

        //send client to the right document
        socket.once("load-document", document =>{
            quill.setContents(document)
            quill.enable()
        })

        //load the document id
        socket.emit('get-document', documenetId)
    }, socket, quill, documenetId)

    useEffect(() => {
        if (socket == null || quill == null) return

        const interval = setInterval(() =>{
            socket.emit('save-document', quill.getContents())

        }, SAVE_INTERVAL)

        return () => {
            clearInterval(interval)
        }
    },[socket, quill])

    //recieves events to change in quill
    useEffect(()=>{
        //make sure socket and quill aren't null, else we return
        if (socket == null || quill == null) return

        const handler = (delta)=>{
            //updates the content of the quill with the received changes
            quill.updateContents(delta)
        }
        socket.on('receive-changes', handler)

        return () => {
            socket.off('receive-changes', handler)
        }
    },[socket, quill])

    //detect changes in local quill
    useEffect(()=>{
        //make sure socket and quill aren't null, else we return
        if (socket == null || quill == null) return

        const handler = (delta,oldDelta, source)=>{
            //checks if the changes are made by a user, else we do nothing
            if (source !== 'user') return
            //emit the changes to the server
            socket.emit("send-changes", delta)
        }
        quill.on('text-change', handler)

        return () => {
            quill.off('text-change', handler)
        }
    },[socket, quill])


    //run our quill, but only once, that's what the [] at the end does
    const wrapperRef = useCallback((wrapper) =>{
        //checks if the wrapper is up and running, else returns.
        if (wrapper ==null) return
        wrapper.innerHTML =''
        //makes an editor object that the quill will be insantiated on
        const editor = document.createElement('div')
        wrapper.append(editor)
        //sets the container to the theme snow from quill
        const q = new Quill(editor, {theme: "snow"})
        q.disable()
        q.setText('Loading...')
        setQuill(q)
    },[])
  return (
    //container that contains the editor
    <div className = "container" ref={wrapperRef}>

    </div>
  )
}
