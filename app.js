var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mysql 		= require('mysql');
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',  //your username
  password : 'password',
  database : 'photoholic'         //the name of your db
});



app.get("/", function(req, res){
 var q = 'SELECT COUNT(*) as count FROM users';
 connection.query(q, function (error, results) {
 if (error) throw error;
 
 res.render("index",{results:results});
 });
});

app.get("/view1/:id", function(req, res){
connection.query("select * from view1", function(err, result){
  if(err)
    res.send("Error, please go back and do something that would work");
  else
  {
    res.render("partials/view1", {p: result, id:req.params.id});
  }
});

});


app.get("/view3", function(req, res){
connection.query("select * from new_view", function(err, result){
  if(err)
    res.send("Error, please go back and do something that would work");
  else
  {
    res.render("partials/view3", {result: result});
  }
});

});

app.get("/view2/:id", function(req, res){
connection.query("select * from view2", function(err, result){
  if(err)
    res.send("Error, please go back and do something that would work");
  else
  {
    res.render("partials/view2", {f: result, id:req.params.id});
  }
});

});

app.get("/login", function(req, res){
   res.render("partials/login");
});
app.post("/login", function(req, res){
	//console.log(req);
 
	 connection.query(
  'SELECT * FROM users WHERE user_name = ?',
  [req.body.username],
  function (err, result) {
  	console.log(result[0]);
  	var ui=result[0].user_id;
    //console.log("user id is"+ui);
  	
    if (err) console.log("o");
    if(result[0]===undefined)
    	console.log("no such user");
    else
    {
    	var k=result[0];
    	if(k.password===req.body.password)
    	{
        connection.query(
          'SELECT * FROM person WHERE userid = ?',
         [ui],
          function (err, result) {
          if (err) throw err;
          else
          {
              if(result[0]===undefined)
               {
              var routey="/page/"+ui+"/";
                res.redirect(routey);
                
           } 
              else
              {
                res.redirect("/person/"+ui+"/");
              }
          }
      });

     }
    	else
    		res.send("bhula dena mujhe");
    }
  }
);	
  });	//connection.close();
app.get("/logout", function(req, res){
   res.redirect("/");
});
// show register form
app.get("/register", function(req, res){
   res.render("partials/register"); 
});
//handle sign up logic
app.post("/register", function(req, res){
  // console.log("req",req.body);
  var today = new Date();
  var users={
    "user_name":req.body.username,
    "email_id":req.body.emailid,
    "password":req.body.password,
    "profile_pic":req.body.profilepic,
    "created_at":today
  }
  connection.query('INSERT INTO users SET ?',users, function (error, results, fields) {
  if (error) {
    console.log("error ocurred",error);
    res.send({
      "code":400,
      "failed":"error ocurred"
    })
  }else{
    //console.log('The solution is: ', req.body.page);
      //console.log('The solution is: ', req.body.user);
      if(req.body.page!=undefined)
    		res.render("partials/page",{id:results.insertId,p:[]});
    	else
    		res.render("partials/person",{id:results.insertId});
    }
  });
});
app.post("/register/page", function(req, res){
  // console.log("req",req.body);
  var pages={
    "user__id":req.body.userid,
    "purpose":req.body.purpose,
    "page_title":req.body.pagetitle
  }
  connection.query('INSERT INTO page SET ?',pages, function (error, results, fields) {
  if (error) {
    console.log("error ocurred",error);
    res.send({
      "code":400,
      "failed":"error ocurred"
    });
  }else{
  
    res.redirect("/page/"+req.body.userid);
  }
});
});

app.post("/register/person", function(req, res){
  // console.log("req",req.body);
  var person={
    "userid":req.body.userid,
    "first_name":req.body.firstname,
    "last_name":req.body.lastname
  }
  connection.query('INSERT INTO person SET ?',person, function (error, results, fields) {
  if (error) {
    console.log("error ocurred",error);
    res.send({
      "code":400,
      "failed":"error ocurred"
    });
  }else{
        res.redirect("/login");
  }
});
});

app.get("/person/:id",function(req,res){
	//console.log(res);
  var count=0, count2=0;
	connection.query(
  'SELECT * FROM users WHERE user_id = ?',
  [req.params.id],
  function (err, result) {
    var us= result[0];
    connection.query('select count(*) as cnt from follows where followee_user_id = ?', [req.params.id], function(err, result){
        if(result!=undefined)
        count=result[0].cnt;
    });
    connection.query('select count(*) as cnt from follows where follower_user_id = ?', [req.params.id], function(err, result){
        if(result!=undefined)
        count2=result[0].cnt;
    });
   // console.log(us);
    var ui=req.params.id;
    if (err) console.log("err");
  	 connection.query(
          'SELECT * FROM photos WHERE photo_user_id = ?',
         [ui],
          function (err, result) {
          if (err) console.log("err");
          var ress=result;
          connection.query('select * from person where userid = ?', [ui], function(err, result){
             res.render("personprofile",{u:us,p:ress, per:result[0], foll:count, folr:count2});
          });
           // console.log(result);
         
        //res.render("personprofile",{u:result[0]});
        //console.log("sent user:")
      });
     //console.log("sent user:")
  	//console.log(u);
  });	
});

app.get("/profile_view/:id", function(req, res){
  var count=0, count2=0;
  connection.query(
  'SELECT * FROM users WHERE user_id = ?',
  [req.params.id],
  function (err, result) {
    var us= result[0];
    connection.query('select count(*) as cnt from follows where followee_user_id = ?', [req.params.id], function(err, result){
        if(result!=undefined)
        count=result[0].cnt;
    });
    connection.query('select count(*) as cnt from follows where follower_user_id = ?', [req.params.id], function(err, result){
        if(result!=undefined)
        count2=result[0].cnt;
    });
   // console.log(us);
    var ui=req.params.id;
    if (err) console.log("err");
     connection.query(
          'SELECT * FROM photos WHERE photo_user_id = ?',
         [ui],
          function (err, result) {
          if (err) console.log("err");
          var ress=result;
          connection.query('select * from person where userid = ?', [ui], function(err, result){
             res.render("person_profile",{u:us,p:ress, per:result[0], foll:count, folr:count2});
          });
           // console.log(result);
         
        //res.render("personprofile",{u:result[0]});
        //console.log("sent user:")
      });
     //console.log("sent user:")
    //console.log(u);
  }); 
});

app.get("/delete/person/:perID/:id", function(req, res){
 
    connection.query("delete from likes where like_photo_id= ?",[req.params.id], function(err, result){
    if(err)
      throw err;
    connection.query("delete from comments where comment_photo_id= ?",[req.params.id], function(err, result){
    if(err)
      throw err;
    connection.query("delete from hashtags where tag_photo_id= ?",[req.params.id], function(err, result){
    if(err)
      throw err; 
     connection.query("delete from photos where photo_id = ?", [req.params.id], function(err, result){
    if(err)
      throw err;
    res.redirect("/person/"+req.params.perID);
  });
  });
  });
  });
});

app.get("/delete/page/:perID/:id", function(req, res){
 
    connection.query("delete from likes where like_photo_id= ?",[req.params.id], function(err, result){
    if(err)
      throw err;
    connection.query("delete from comments where comment_photo_id= ?",[req.params.id], function(err, result){
    if(err)
      throw err;
    connection.query("delete from hashtags where tag_photo_id= ?",[req.params.id], function(err, result){
    if(err)
      throw err; 
     connection.query("delete from photos where photo_id = ?", [req.params.id], function(err, result){
    if(err)
      throw err;
    res.redirect("/page/"+req.params.perID);
  });
  });
  });
  });
});




app.get("/page/:id",function(req,res){
	//res.render("profile",{id:req.params.id});
  console.log(req.params.id);
	var u={}, r;
	//const r;
	var today = new Date();
	connection.query(
  'SELECT * FROM page WHERE user__id = ?',
  [req.params.id],
  function (err, result) {
    if (err || result[0]==undefined)
    {console.log("e7");
    }

    console.log("lalala");
    console.log(result[0]);
    
    u["page_title"]=result[0].page_title;
    u["purpose"]=result[0].purpose;
    u["user__id"]=req.params.id;
    r=req.params.id;
 
    connection.query(
  'SELECT * FROM users WHERE user_id = ?',
  [r],
  function (err, result) {
    if (err) console.log("e8");

 
    u["user_name"]=result[0].user_name;
    u["email_id"]=result[0].email_id;
  	u["password"]=result[0].password;
  	u["profile_pic"]=result[0].profile_pic;
  	u["created_at"]=today;
    u["user_id"]=req.params.id;

     connection.query(
          'SELECT * FROM photos WHERE photo_user_id = ?',
         [r],
          function (err, result) {
          if (err) console.log("err");
           // console.log(result);
          res.render("pageprofile",{u:u,p:result});
        //res.render("personprofile",{u:result[0]});
        //console.log("sent user:")
      });
  });	
  });	//connection.close();
	});
app.get("/person/:id/newpersonpost",function(req,res){
	res.render("partials/newpersonpost",{id:req.params.id});
	});
app.post("/person/:id/newpersonpost",function(req,res){
	var today = new Date();
  var pic={
    "image_url":req.body.imageurl,
    "caption":req.body.caption,
    "posted_at":today,
    "photo_user_id":req.params.id,
    "photo_tag_text":req.body.tags
  }
  var t=req.body.tags;
  var arr=[];
  var k=0;
  for(var i=0;i<t.length;++i)
  {
    if(t[i]==="#")
    {
      i++;
      while(t[i]!="#")
      {
        ++i;
        if(i>=t.length)
        {
          break;
        }
      }
       arr.push(t.substring(k+1, i));
      k=i;
      i--;
    }
   
  }
  var hashtags=[];
 
   connection.query('INSERT INTO photos SET ?',pic, function (error, results, fields) {
  if (error) {
    console.log("error ocurred",error);
    res.send({
      "code":400,
      "failed":"error ocurred"
    });
  }else{
  	
  	
    for(j=0;j<arr.length;++j){
      var temp=[];
      temp.push(arr[j],results.insertId,today);
      hashtags.push(temp);
    }
    console.log(hashtags);

  	 connection.query(
  'SELECT * FROM users WHERE user_id = ?',
  [req.params.id],
  function (err, result) {
      console.log("e1");
  	 var m=result[0], per;
  	 connection.query(

  				'SELECT * FROM photos WHERE photo_user_id = ?',
 				 [req.params.id],
  				function (err, result) {
    			if (err) console.log("e5");
          var pho=result;
    			//console.log("u cannot reach me");
    				//console.log(result);
            var sql = "INSERT INTO hashtags (tag_name,tag_photo_id,created_at) VALUES ?";
            connection.query(sql, [hashtags], function(err) {
               if (err) throw err;
             connection.query("select * from person where userid = ?", [req.params.id], function(err, result){
    			res.render("personprofile",{u:m,p:pho, per:result[0]});
         // res.redirect("/person/"+req.params.id+"/");
    		//res.render("personprofile",{u:result[0]});
    	});
    //console.log('The solution is: ', req.body.page);
});
   }); 		});
  }

	});
});
app.get("/page/:id/newpagepost", function(req, res){
  res.render("partials/newpagepost", {id: req.params.id});
});

app.post("/page/:id/newpagepost",function(req,res){
  var today = new Date();
  var pic={
    "image_url":req.body.imageurl,
    "caption":req.body.caption,
    "posted_at":today,
    "photo_user_id":req.params.id,
    "photo_tag_text":req.body.tags
  }
  var t=req.body.tags;
  var arr=[];
  var k=0;
  for(var i=0;i<t.length;++i)
  {
    if(t[i]==="#")
    {
      i++;
      while(t[i]!="#")
      {
        ++i;
        if(i>=t.length)
        {
          break;
        }
      }
       arr.push(t.substring(k+1, i));
      k=i;
      i--;
    }
   
  }
  var hashtags=[];
 
   connection.query('INSERT INTO photos SET ?',pic, function (error, results, fields) {
  if (error) {
    console.log("error ocurred",error);
    res.send({
      "code":400,
      "failed":"error ocurred"
    })
  }else{
    
    
    for(j=0;j<arr.length;++j){
      var temp=[];
      temp.push(arr[j],results.insertId,today);
      hashtags.push(temp);
    }
    console.log(hashtags);

     connection.query(
  'SELECT * FROM users WHERE user_id = ?',
  [req.params.id],
  function (err, result) {
      console.log("e1");
     var m=result[0];
     connection.query(

          'SELECT * FROM photos WHERE photo_user_id = ?',
         [req.params.id],
          function (err, result) {
          if (err) console.log("e5");

          //console.log("u cannot reach me");
            //console.log(result);
            var sql = "INSERT INTO hashtags (tag_name,tag_photo_id,created_at) VALUES ?";
            connection.query(sql, [hashtags], function(err) {
               if (err) throw err;
              });
            console.log("yayyyy");
            console.log(m);
          res.render("pageprofile",{u:m,p:result});

         // res.redirect("/person/"+req.params.id+"/");
        //res.render("personprofile",{u:result[0]});
      });
    //console.log('The solution is: ', req.body.page);
});
        
  }

  });
});


app.get("/person/:id/follows",function(req,res){
    var id=req.params.id;
     connection.query(

          'SELECT followee_user_id FROM follows WHERE follower_user_id = ?',
         [id],
          function (err, result) {
           
            var followed=[];
            for( i=0;i<result.length;++i)
              followed.push(result[i].followee_user_id);
             //console.log(not_followed);
          if (err)  console.log("e2");
          
          connection.query(

          'SELECT user_id FROM users WHERE user_id != ?',
         [id],
          function (err, result) {
            var not_followed=[];
           // console.log(result);
            for(i=0;i<result.length;++i)
              not_followed.push(result[i].user_id);
          if (err) console.log("e3");
    console.log(JSON.stringify(followed)==JSON.stringify(not_followed));   
          
          //var diff = $(not_followed).not(followed);
          if((JSON.stringify(followed)==JSON.stringify(not_followed)))
          {
            res.send("NOBODY IN NETWORK! YOU FOLLOW EVERYBPDY IN THE NETWORK! CHEERS!!");
          }
          else{
          diff = not_followed.filter(function(x) { return followed.indexOf(x) < 0 })
          
          
          connection.query(
         'SELECT * FROM users WHERE user_id in (?)',
          [diff],
          function (err, result) {
            if(err) console.log("e3");

            res.render("follows",{f:result,id:id});
          });
          }

        });
          

      });
  });
app.post("/person/:id/:followee_id", function(req, res){
  // console.log("req",req.body);
  var today = new Date();
  var f={
    "followee_user_id":req.params.followee_id,
    "follower_user_id":req.params.id,
    "followed_at":today
  }
  console.log(f);
  connection.query('INSERT INTO follows SET ?',f, function (error, results, fields) {
  if (error) {
    console.log("error ocurred",error);
    res.send({
      "code":400,
      "failed":"error ocurred"
    })
  }else{
    console.log('The solution is: ', results);
    //res.send("hey");
    res.redirect("/profile_view/"+req.params.followee_id);
  }
});
});

app.get("/person/:id/feeds",function(req,res){
    var id=req.params.id;
     connection.query('SELECT followee_user_id FROM follows WHERE follower_user_id = ?',
         [id],
          function (err, result) {
            if (err)  throw err;
            if(result.length == 0)
              {res.send("NOTHING IN FEEDS! PLEASE FOLLOW SOME USERS TO OBTAIN ONE!");
          }
            var followed=[];
            for( i=0;i<result.length;++i)
              followed.push(result[i].followee_user_id);
            connection.query('SELECT * FROM photos WHERE photo_user_id in (?) order by posted_at desc',
          [followed],
          function (err, result) {
            var photoarr=[];
            if (err) throw err;
            var pid=[];
            for(i=0;i<result.length;++i)
            {
              var obj={
                "image_url":result[i].image_url,
              "caption":result[i].caption,
               "photo_id":result[i].photo_id,
               "posted_at":result[i].posted_at,
              "photo_user_id":result[i].photo_user_id,
              "photo_tag_text":result[i].photo_tag_text,
              "comments":[],
              "likes":0
              }
             photoarr.push(obj);
             pid.push(result[i].photo_id);
            }
            console.log(photoarr);
             connection.query(
             'SELECT * FROM comments WHERE comment_photo_id in (?) ',
                [pid],
              function (err, result) {
                var c=result;
               // console.log(result);
                for(i=0;i<photoarr.length;++i)
                {
                  var arr;
                  for(j=0;j<c.length;++j)
                  {
                    if(c[j].comment_photo_id===photoarr[i].photo_id)
                    {
                      photoarr[i].comments.push(c[j]);
                    }
                  }
                  photoarr[i].comments.push(arr);
                }
                connection.query(
             'SELECT * FROM likes WHERE like_photo_id in (?) ',
                [pid],
              function (err, result) {
                var c=result;
               // console.log(result);
                for(i=0;i<photoarr.length;++i)
                {
                  var arr;
                  for(j=0;j<c.length;++j)
                  {
                    if(c[j].like_photo_id===photoarr[i].photo_id)
                    {
                      photoarr[i].likes++;
                    }
                  }
                 // photoarr[i].comments.push(arr);
                }
                

                console.log(photoarr);
               // res.send("please");
          
            res.render("feeds",{p:photoarr,id:id});
         
          });
        });
      });
    });
   });
app.get("/person/:id/photos/:photo_id/comment/:comment_creator/new",function(req,res){
  //console.log(req.params.photo_id);
 // console.log(req);
    res.render("partials/comment",{id:req.params.id, photo_id:req.params.photo_id,comment_creator:req.params.comment_creator});
});
app.post("/person/:id/photos/:photo_id/comment/:comment_creator/new",function(req,res){
      var today = new Date();
      console.log(req);
  var comment={
    "comment_photo_id":req.params.photo_id,
    "created_at":today,
    "comment_user_id":req.params.comment_creator,
    "comment_text":req.body.comment
  }
   connection.query('INSERT INTO comments SET ?',comment, function (error, results, fields) {
  if (error) {
    console.log("error ocurred",error);
    res.send({
      "code":400,
      "failed":"error ocurred"
    })
  }else
  {
    //console.log("results are"+results);
   // res.send("h");
    res.redirect("/person/"+req.params.comment_creator+"/feeds");
  }
  });
});
app.get("/person/:id/photos/:photo_id/like/:like_creator/new",function(req,res){
      var today = new Date();
      console.log(req);
  var like={
    "like_photo_id":req.params.photo_id,


    "like_user_id":req.params.like_creator
  }
   connection.query('INSERT INTO likes SET ?',like, function (error, results, fields) {
  if (error) {
        res.redirect("/person/"+req.params.like_creator+"/feeds");
  }else
  {
    //s("results are"+results);
   // res.send("h");
    res.redirect("/person/"+req.params.like_creator+"/feeds");
  }
  });
});
app.get("/page/profile/:id", function(req, res){
  res.render("page", {});
});

app.listen(3000, 'localhost',function(){
	console.log("server on duty, mallady");
});