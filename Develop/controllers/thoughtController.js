const { User, Thought } = require('../models')

const thoughtController = {
    //Get All Thoughts
    getAllThoughts(req, res){
        Thought.find({})
        .populate({ path: 'reactions', select: '-__v'})
        .select('-__v')
        .then(thoughts => res.json(thoughts))
        .catch((err) => res.status(400).json(err))
    },

    getThoughtById(req, res){
        Thought.findOne({_id: req.params.id})
        .then(thoughts => {
            if (!thoughts){
                res.status(404).json({ message: 'There are no thoughts found with this id.'});
                return;
            }
            res.json(thoughts)
        })
        .catch((err) => res.status(400).json(err))
    },
    // CREATE THOUGHT
    async createThought({ body }, res) {
      const checkUser = await User.findOne({username: body.username})
      console.log(checkUser)
      if(!checkUser){
        res.json({status: 'err'})
        return
      }
        Thought.create(body)
            .then(({ _id }) => {
                return User.findOneAndUpdate(
                    { _id : checkUser._id},
                    { $push: { thoughts: _id } },
                    { new: true }
                );
            })
            .then(thoughts => {
                res.json(thoughts);
            })
            .catch(err => res.json(err));
    },
    // UPDATE THOUGHT
    updateThought({ params, body }, res) {
        Thought.findOneAndUpdate({ _id: params.id }, body, { new: true, runValidators: true })
          .then(thoughts => {
            if (!thoughts) {
              res.status(404).json({ message: 'There are no thoughts found with this id.' });
              return;
            }
            res.json(thoughts);
          })
          .catch(err => res.json(err));
      },

      //DELETE THOUGHT
      async deleteThought({ params }, res) {
        const thought = await Thought.findOne({_id: params.id})
        if (!thought){
          res.json({status: 'err'})
          return
        }
        await Thought.findOneAndDelete({ _id: params.id })
        const deleteThoughtId = await User.findOneAndUpdate(
          { thoughts: params.id },
          { $pull: { thoughts: params.id } },
          { new: true }
        )
        console.log(thought)
        res.json(deleteThoughtId)
      },

      //CREATE REACTION
      createReaction({params, body}, res) {
        Thought.findOneAndUpdate(
          {_id: params.thoughtId}, 
          {$push: {reactions: body}}, 
          {new: true, runValidators: true})
        .populate({path: 'reactions', select: '-__v'})
        .select('-__v')
        .then(thoughts => {
            if (!thoughts) {
                res.status(404).json({message: 'No thoughts with this ID.'});
                return;
            }
            res.json(thoughts);
        })
        .catch(err => res.status(400).json(err))
    },

    //DELETE Reactions
    deleteReaction({ params }, res) {
        Thought.findOneAndUpdate(
          { _id: params.thoughtId },
          { $pull: { reactions: { reactionId: params.reactionId } } },
          { new: true }
        )
        .then((thoughts) => res.json(thoughts))
        .catch(err => res.json(err));
      }   
}

module.exports = thoughtController