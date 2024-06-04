import React,{useState, useRef} from 'react'
import { useEffect } from 'react'
import Client from '../Components/Client'
import Editor from '../Components/Editor'
import toast from 'react-hot-toast'
import ACTIONS from '../Actions'

import { initSocket } from '../socket'
import { Navigate, useLocation, useNavigate , useParams} from 'react-router-dom'


const EditorPage = () => {


    const socketRef = useRef(null);
    const location = useLocation();
    const reactNavigator = useNavigate();
    const { roomId } = useParams();

    const [clients,setClients] = useState([]);

    useEffect(() => {

        const init = async () => {
       

            
            socketRef.current = await initSocket();
    
            socketRef.current.on('connect_error', handleErrors);
            socketRef.current.on('connect_fail', handleErrors);
    
            function handleErrors(err) {
                console.log('socket_error', err);
                toast.error('Socket Connection failed, try again later');
                reactNavigator('/');
            }
    
            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.username,
            });





            // Listnening for joined event i.e... if any user joined with the respective room id

            socketRef.current.on(
                
                    ACTIONS.JOINED,

                 ({ clients, username, socketId}) => {
              
                        if(username !== location.state?.username){
                            toast.success(`${username} joined the room.`)
                        }

                        setClients(clients);
                 }
        
            );



            // Listening for disconnected


            socketRef.current.on(ACTIONS.DISCONNECTED,( { socketId,username}) =>{
                toast.success(`${username} left the room.`)

                setClients((prev) =>{
                    return prev.filter( client => client.socketId !== socketId );   // this removes the username in the connected section 
                }) 
            })


       
        };

       init();

           // to clear the liseners which we used in current.on 

    return () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
        }
     };
      
   }, []);
    

    

    if(!location.state){
       return  <Navigate to="/" />
    }
    

  return (
    <div className='mainWrap'>
        <div className='aside'>
            <div className='asideInner'>
                <div className='logo'>
                    <h1>ZCoder</h1>
                </div>
                <h3>Connected</h3>
                <div className='clientsList'>
                    {
                        clients.map((client) =>(
                            <Client 
                                key={client.socketId} 
                                username={client.username} 
                            />
                        ))
                    }
                </div>
            </div>
        <button className='btn copyBtn'>Copy ROOM ID</button>
        <button className='btn leaveBtn'>Leave Room</button>
        </div>
        <div className='editorWrap'>
            <Editor socketRef = {socketRef} rommId = {roomId} />
        </div>

    </div>
  )
}

export default EditorPage

