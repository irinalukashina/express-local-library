var Genre = require('../models/genre');
var Book = require('../models/book');
var async = require('async');

// Display list of all Genre
exports.genre_list = function(req, res) {
	
    Genre.find()
    .sort([['name', 'ascending']])
    .exec(function (err, list_genres) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('genre_list', { title: 'Genre List', genre_list: list_genres });
    });
};

// Display detail page for a specific Genre
exports.genre_detail = function(req, res, next) {

  async.parallel({
    genre: function(callback) {  
      Genre.findById(req.params.id)
        .exec(callback);
    },
        
    genre_books: function(callback) {            
      Book.find({ 'genre': req.params.id })
      .exec(callback);
    },

  }, function(err, results) {
    if (err) { return next(err); }
    //Successful, so render
    res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books } );
  });

};

// Display Genre create form on GET
exports.genre_create_get = function(req, res, next) {       
    res.render('genre_form', { title: 'Create Genre' });
};

// Handle Genre create on POST 
exports.genre_create_post = function(req, res, next) {
    
    //Check that the name field is not empty
    req.checkBody('name', 'Genre name required').notEmpty(); 
    
    //Trim and escape the name field. 
    req.sanitize('name').escape();
    req.sanitize('name').trim();
    
    //Run the validators
    var errors = req.validationErrors();

    //Create a genre object with escaped and trimmed data.
    var genre = new Genre(
      { name: req.body.name }
    );
    
    if (errors) {
        //If there are errors render the form again, passing the previously entered values and errors
        res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors});
    return;
    } 
    else {
        // Data from form is valid.
        //Check if Genre with same name already exists
        Genre.findOne({ 'name': req.body.name })
            .exec( function(err, found_genre) {
                 console.log('found_genre: ' + found_genre);
                 if (err) { return next(err); }
                 
                 if (found_genre) { 
                     //Genre exists, redirect to its detail page
                     res.redirect(found_genre.url);
                 }
                 else {
                     
                     genre.save(function (err) {
                       if (err) { return next(err); }
                       //Genre saved. Redirect to genre detail page
                       res.redirect(genre.url);
                     });
                     
                 }
                 
             });
    }

};

// Display Genre delete form on GET
exports.genre_delete_get = function(req, res) {

	async.parallel({ 
		genre: function(callback) {     
            Genre.findById(req.params.id).exec(callback);
        },
		books: function(callback){
			var genreId = req.params.id;
			Book.find({'genre': genreId}).exec(callback);
		}
	}, function(err, results) {
		if (err) { return next(err); }
		
		console.log('genre:',results.genre.name);
		console.log('bookID:', results.books.length > 0 ? results.books[0]._id : 'books empty');
		res.render('genre_delete', {"books": results.books, 'genre': results.genre});
		}
	);
};

// Handle Genre delete on POST
exports.genre_delete_post = function(req, res) {
	//req.checkBody('genreid', 'Genre ID must exist').notEmpty();
	
	console.log('genreID:', req.body.genreid);
	
	async.parallel({
		genre: function(callback){
			Genre.findById(req.body.genreid).exec(callback);
		},
		books:function(callback){
			Book.find({'genre':req.body.genreid}).exec(callback)
		} 
	},function(err,results){
		if (err) { return next(err); }
		if (results.genre.length > 0){
			res.redirect(results.genre.url);
		}else {
			Genre.findByIdAndRemove(req.body.genreid,function(err){
				if (err) { return next(err); }
				res.redirect('/catalog/genres');
				
			});
		}
		
		
	}
	);
	
    
};

// Display Genre update form on GET
exports.genre_update_get = function(req, res) {
	
	Genre.findById(req.params.id, function(err, genre){
		if (err) { return next(err); }
		res.render('genre_form',{'title': 'Genre update', 'genre': genre});
		console.log('Genre object', genre);
	});
	
    
};

// Handle Genre update on POST
exports.genre_update_post = function(req, res) {
	
	 //Check that the name field is not empty
    req.checkBody('name', 'Genre name required').notEmpty(); 
    
    //Trim and escape the name field. 
    req.sanitize('name').escape();
    req.sanitize('name').trim();
    
	console.log('Genre', +req.body.name);
	
	//New Genre
	
	var genre = new Genre(
	{
		name: req.body.name,
		_id: req.params.id
	});
	
	//Run the validators
 var errors = req.validationErrors();
	
if(errors){
		console.log('Errors');
	}else{
		Genre.findByIdAndUpdate(req.params.id, genre, function (err, genre){
			if (err) { return next(err);}
			
			console.log('Genre', +genre);
		res.redirect('/catalog/genres');
		});
	}

};