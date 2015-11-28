Todos = new Mongo.Collection('todos');

if (Meteor.isClient) {

	Meteor.subscribe('todos');

  Template.main.helpers({
    completedTodos: function() {
      return Todos.find({checked:true});
    }, 
    incompleteTodos: function(){
      return Todos.find({checked:false});
    },
    todos: function(){
      return Todos.find();
    }
  });

  Template.main.events({
  	"submit .new-todo": function(event){
  		var text = event.target.text.value;
  		Meteor.call("addTodo", text);
  		event.target.text.value = "";
  		return false;
  	}, 
  	"click .toggle-check": function(){
  		Meteor.call("setChecked", this._id, this.checked);
  	},
  	"click .delete-todo": function(){
      if(confirm('Are you sure?')){
        Meteor.call("deleteTodo", this._id);
      }	
  	}
  });

  Accounts.ui.config({
  	passwordSignupFields: "USERNAME_ONLY"
  })

}


if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    Meteor.publish('todos', function(){
      if(!this.userId){
        return Todos.find();
      }
    	return Todos.find({userId: this.userId});
    })
  });
}


//Meteor Methods 
Meteor.methods({
	addTodo: function(text){
		if(!Meteor.userId()){
			throw new Meteor.Error('not-authorized');
		} else {
      Todos.insert({
        text: text, 
        date: new Date(),
        userId: Meteor.userId(), 
        userName: Meteor.user().username,
        checked: false
      }); 
    }
		
	}, 
	deleteTodo: function(todoId){
    var todo = Todos.findOne(todoId);
    if(todo.userId !== Meteor.userId()){
      throw new Meteor.Error('not-authorized');
    }
  	Todos.remove(todoId);
	}, 
	setChecked: function(todoId, setChecked){
		var todo = Todos.findOne(todoId);
		if(todo.userId !== Meteor.userId()){
			console.log(todo.userId + "!=" + Meteor.userId());
			throw new Meteor.Error('not-authorized');
		}
		Todos.update(todoId, {$set: {checked: ! setChecked}});
	}
});
