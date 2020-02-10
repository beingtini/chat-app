const socket = io();

//Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = document.querySelector("button");
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locMessageTemplate = document.querySelector('#loc-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const { username, room} = Qs.parse(location.search, { ignoreQueryPrefix : true });

const autoScroll = () => {
    // new message element
    const $newMessage = $messages.lastElementChild

    //Height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of messages container
    const contentHeight = $messages.scrollHeight

    //how far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if( contentHeight - newMessageHeight <= scrollOffset ){
        $messages.scrollTop = $messages.scrollHeight

    }
}

socket.on('message',(msg) => {
    console.log( msg);
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        message : msg.text ,
        createdAt : moment(msg.createdAt).format('h:mm a')
     })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage',(loc) => {
    console.log(loc);
    const html = Mustache.render(locMessageTemplate, {
        username: loc.username,
        locMessage : loc.url,
        createdAt : moment(loc.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('room-data',({room , users }) => {
    //console.log(loc);
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

//onsole.log(div);
$messageForm.addEventListener('submit',(e) => {
    e.preventDefault();
    const msg = e.target.elements.message.value;
    //disable
    $messageFormButton.setAttribute('disabled', 'disabled')
    $messageFormInput.value=''
    $messageFormInput.focus()
    
    
    //enable

    socket.emit('sendMessage', msg ,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        if(error){
            return console.log(error)
        }
        console.log('Delivered!')
    });
})

$locationButton.addEventListener('click', ()=>{
    if( !navigator.geolocation ){
        return alert('Geolocation not supported by your browser.')
    }

    $locationButton.setAttribute('disabled','disabled')


    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation', {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        },()=>{
            console.log('Location shared!')
            $locationButton.removeAttribute('disabled')
        });
    })
})

socket.emit('join', { username, room }, (error) => {
    if(error){
        alert(error)
        location.href = '/'

    }
})
