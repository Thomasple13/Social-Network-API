const { User, Thought } = require('../models')

const userController = {
    //Get all users from /api/users
    getAllUsers(req, res){
        User.find({})
        .then((users) => res.json(users))
        .catch((err) => res.status(400).json(err));
    },

    getUserById({params}, res){
        User.findOne({ _id: params.id })
        .then(users => {
            if (!users){
                res.status(404).json({ message: 'There are no users found with this id.'});
                return;
            }
            res.json(users)
        })
        .catch((err) => res.status(400).json(err))
    },

    //Create User
    createUser({ body }, res){
        User.create(body)
        .then(users => res.json(users))
        .catch(err => res.json(err))
    },

    //Update User
    updateUser({params, body}, res){
        User.findOneAndUpdate({_id: params.id}, body, {new: true, runValidators: true})
        .then(users => {
            if (!users){
                res.status(404).json({message: 'There are no users found with this id.'});
                return;
            }
            res.json(users)
        })
        .catch((err) => res.status(400).json(err))
    },

    //Delete User and thougts
    deleteUser({params}, res){
        Thought.deleteMany({_id: params.id})
        .then(() =>{
            User.findOneAndDelete({ _id: params.id})
            .then((users) =>
                !users
                    ? res.status(404).json({ message: 'There are no users found with this id.' })
                    : res.json({message: 'User deleted'})
                )
                .catch((err) => res.status(500).json(err))
        })
    },

    // Add and Delete Friends /api/users/:userId/friends/:friendId

    addFriend({params}, res){
        User.findOneAndUpdate(
            { _id: params.userId },
            { $push: { friends: params.friendId } },
            { new: true }
        )
        .then((users) => {
            if (!users){
                res.status(404).json({message: 'There are no users found with this id.'});
                return;
            }
            res.json(users)
        })
        .catch((err) => res.status(500).json(err))
    },

    deleteFriend({ params }, res){
        User.findOneAndUpdate(
            { _id: params.userId },
            { $pull: { friends: params.friendId } },
            { new: true }
        )
        .then((users) => {
            if (!users){
                res.status(404).json({message: 'There are no users found with this id.'});
                return;
            }
            res.json(users) 
        })
        .catch((err) => res.status(500).json(err))
    }
};

module.exports = userController

