var teamInfo = nysl.teamInfo;
var gameInfo = nysl.gameInfo;
var selectedMatches = [];
var app = new Vue({
    el: '#teamNames',
    data: {
        teamNames: [],
        gameInfo: [],
        upcomings: [],
        selectedMatches: [],
        search:"",
        matchDate:"",
        filteredDateArray : []
       
    
        
//        perfil: {
//            name:"",
//            photo: "",
//            email: ""
//        }

    },
     //to refer to anything in the data section you need to say this.thekeynameindata e.j. this.gameinfo[i]
    methods: {
        showMatches: function (teamName) {
             this.selectedMatches = [];  //to empthy you need to say it equals empthy BUT here you had said selectedMatches ='' which is wrong because selectedMatches is an array and you should say it equals to an empthy array
           
            for (var i = 0; i < this.gameInfo.length; i++) {
                if ((this.gameInfo[i].local == teamName) || (this.gameInfo[i].visitor == teamName)) {

                    this.selectedMatches.push(this.gameInfo[i]);
                  
                }
            }
            //so when you change the page  from one team to another reset the page from the beging
            this.matchDate = "";
            this.filteredDateArray=[];
        },
        
        filterdate: function(){
        this.filteredDateArray = [];
    
         var selectedDate = formatDate(new Date(document.getElementById("dateFilter").value));
        
        for(i=0; i<this.selectedMatches.length; i++ ) {
           

             if(selectedDate == this.selectedMatches[i].Date){
              
                this.filteredDateArray.push(this.selectedMatches[i]);
            }
//            else{
//                this.filteredDateArray = []
//            }
        }
            
           
    }
        
        /*,
        dayfilter: function(){
            var days = [];
            for(var i=1; i < 32; i++){
              var day =  i += 1;
            }
            this.days.push(day);
            return days;
        }*/
        
    },
         computed: {
        filterdteam: function () { 
           return this.teamNames.filter((teamName) => {
               return (teamName.team.toUpperCase().includes(this.search.toUpperCase()))
           });
           
        
        },
        chooseAnarray: function(){
                 if(this.filteredDateArray.length == 0 && this.matchDate == ""){
                     return this.selectedMatches
                 }
            
            else{
                     return this.filteredDateArray
                 }
             }
             
//    datefilter: function(){
//             return this.gameInfo.filter((game) => {
//               return (game.Date.includes(this.matchDate))
//           });
//         }        
    }

});
//var d = new Date(); today's date function
var d = new Date();
var mydate = formatDate(d);
var chatbtn = document.getElementById("chatbtn")

app.gameInfo = gameInfo;
app.teamNames = teamInfo;

hideAndShow("home");
upcomingMatch();
chatbtn.addEventListener("click",getPosts ); //getpost is a function in main.js that was already made for chat

function formatDate(d) {
    month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
    if (month.length < 2) {
        month = '0' + month
    };
    if (day.length < 2) {
        day = '0' + day
    };
    return [year, month, day].join('/');

} //to change my date to string to compare to json
function upcomingMatch() {
    var firstPicked = '';
    selected = [];
    for (i = 0; i < gameInfo.length; i++) {
        var matchDate = gameInfo[i].Date;

        if ((matchDate >= mydate) && (firstPicked == '')) {

            firstPicked = matchDate;

        }
        if (matchDate == firstPicked) {

            selected.push(gameInfo[i]);
        }
    }

    app.upcomings = selected;

}
function hideAndShow(id) {

    
    var x = document.querySelectorAll("div[data-div]"); //to select all the data attributes so you are selecting all the divs that hav data-div
for(var i=0; i<x.length;i++){
    x[i].style.display = "none"
}
   var div =  document.getElementById(id);
    div.style.display="block";
}

///////////////////////chat Page with firebase/////////////////////////////////////////////////////////////////

//to add eventlistener to enter key
var input = document.getElementById("textInput");
var userName;
var image;
var posts = document.getElementById("posts");

input.addEventListener("keyup", function (event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("create-post").click();
    }
});
document.getElementById("login").addEventListener("click", login);
document.getElementById("create-post").addEventListener("click", writeNewPost);
document.getElementById('logout').addEventListener("click", signout);

//tocheck if already logged in hide all the logout features and viceverca
firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        $(".advice").show();
        $("#posts").show();
        $(".inputs").show();
        $("#logout").show();
        $("#login").hide();
        $(".loginMsg").hide();
        $(".logoutmsg").show(),
        document.getElementById("chatbtn").innerHTML = "Chat";


    } else {
        $(".advice").show();
        $("#posts").show();
        $("#logout").hide();
        $(".inputs").hide();
        $("#login").show();
        $(".loginMsg").show();
        $(".logoutmsg").hide(),
document.getElementById("chatbtn").innerHTML = "sign in /sign up";



        // No user is signed in.
    }
});
function login() {

    // https://firebase.google.com/docs/auth/web/google-signin

    // Provider
    var provider = new firebase.auth.GoogleAuthProvider();

    // How to Log In
    firebase.auth().signInWithPopup(provider).then(function (result) {
        getPosts();
    });
    console.log("login");

}
function writeNewPost() {

    // https://firebase.google.com/docs/database/web/read-and-write
    
    
    
    

    // Values
    var text = document.getElementById("textInput").value;
    userName = firebase.auth().currentUser.displayName;
    image= firebase.auth().currentUser.photoURL;
    
//    app.perfil.name = userName;
//    app.perfil.photo = image;
//    app.perfil.email = email;
//    


    // A post entry

    var post = {
        name: userName,
        body: text,
        imgURL: image
        
    };

    // Get a key for a new Post.
    var newPostKey = firebase.database().ref().child('ubiqum').push().key;


    //Write data
    if (text !== '') {
        var updates = {};
        updates[newPostKey] = post;
        console.log("post sent");
        document.getElementById("textInput").value = '';
        return firebase.database().ref('ubiqum').update(updates);
    } else {
        alert("You cannot post empty messages!");
    }


}
function getPosts() {
    //to limit the messegase to the last 10 for example you add this code limitToLast()
    firebase.database().ref('ubiqum').limitToLast(10).on('value', function (data) {
        console.log("getting posts");

        //local storage of username if logged in 
        if (firebase.auth().currentUser) {
            userName = firebase.auth().currentUser.displayName;
            // Store
            localStorage.setItem("userName", userName);

      
        } else {
            //show username when logged out
            if (localStorage.getItem("userName")) {
                //get locally stored item
                userName = localStorage.getItem("userName");
            } else {
                userName = '';
            }

        }
        posts.innerHTML = "";

        var messages = data.val();

        for (var key in messages) {
            var text = document.createElement("div");
            


            //             text.setAttribute("class", "chat");

            /*text.style.padding = "5px";
            text.style.marginBottom = "13px"
            text.style.borderRadius = "15px";*/
            var element = messages[key];

            if (element.name == userName) {
                text.innerHTML = "<p class='myName'>" + element.name + "</p><p class='myMessage'>" + element.body + "</p>";
            } else {
                text.innerHTML = "<p class='name'>" + element.name + "</p><p class='message'>" + element.body + "</p>";
            }

            posts.append(text);

            //             
            //                 (element.name.style.display = "none") && (element.body.style.justifycontent = "left");
            //             }
        }

    })

    console.log("getting posts");

}
function signout() {

    firebase.auth().signOut().then(function () {
        
    
            

        getPosts();

    });
    //.catch(function(error) {
    //   An error happened.
    //});
}













