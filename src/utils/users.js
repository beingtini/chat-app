const users = [];

//add user
const addUser = ({id, username, room}) => {
    //Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate data
    if( !username || !room ){
        return {
            error : 'Username and Room required'
        }
    }
    
    //Check for user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //Validate Username
    if(existingUser){
        return {
            error: 'Username already in use'
        }
    }

    //Store User
    const user = { id, username, room }
    users.push(user)
    return { user }
}
//removeUser
const removeUser = (id) => {
    const index = users.findIndex((user)=> user.id === id)

    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

//getUser
const getUser = (id) => {
    const user = users.find((user)=> user.id === id)


        return user
    
}
//getUsersInRoom
const getUsersInRoom = (room) => {
    room =room.trim().toLowerCase();
    const usersInRoom = users.filter((user)=> user.room === room )

    
        return usersInRoom
}

module.exports = {
    addUser,
    getUser,
    getUsersInRoom,
    removeUser
}


console.log(getUsersInRoom('sqlam'))
console.log(users)