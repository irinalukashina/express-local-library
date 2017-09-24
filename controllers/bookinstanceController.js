var BookInstance = require('../models/bookinstance');
var Book = require('../models/book');

// Display list of all BookInstances
exports.bookinstance_list = function(req, res, next) {

  BookInstance.find()
    .populate('book')
    .exec(function (err, list_bookinstances) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances });
    });
    
};

// Display detail page for a specific BookInstance
exports.bookinstance_detail = function(req, res, next) {

  BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function (err, bookinstance) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('bookinstance_detail', { title: 'Book:', bookinstance: bookinstance });
    });
    
};

// Display BookInstance create form on GET
exports.bookinstance_create_get = function(req, res, next) {       

    Book.find({},'title')
    .exec(function (err, books) {
      if (err) { return next(err); }
      //Successful, so render
      res.render('bookinstance_form', {title: 'Create BookInstance', book_list:books});
    });
    
};

// Handle BookInstance create on POST 
exports.bookinstance_create_post = function(req, res, next) {

    req.checkBody('book', 'Book must be specified').notEmpty(); //We won't force Alphanumeric, because book titles might have spaces.
    req.checkBody('imprint', 'Imprint must be specified').notEmpty();
    req.checkBody('due_back', 'Invalid date');
    
    req.sanitize('book').escape();
    req.sanitize('imprint').escape();
    req.sanitize('status').escape();
    req.sanitize('book').trim();
    req.sanitize('imprint').trim();   
    req.sanitize('status').trim();
    req.sanitize('due_back').toDate();
    
    var bookinstance = new BookInstance({
        book: req.body.book,
        imprint: req.body.imprint, 
        status: req.body.status,
        due_back: req.body.due_back
    });

    var errors = req.validationErrors();
    if (errors) {
        
        Book.find({},'title')
        .exec(function (err, books) {
          if (err) { return next(err); }
          //Successful, so render
          res.render('bookinstance_form', { title: 'Create BookInstance', book_list : books, selected_book : bookinstance.book.name , errors: errors, bookinstance:bookinstance });
        });
        return;
    } 
    else {
    // Data from form is valid
    
        bookinstance.save(function (err) {
            if (err) { return next(err); }
               //successful - redirect to new book-instance record.
               res.redirect(bookinstance.url);
            }); 
    }

};

// Display BookInstance delete form on GET
exports.bookinstance_delete_get = function(req,res,err) {
	 BookInstance.findById(req.params.id)
	.populate('book')
    .exec(function (err, bookinstance) {
		if (err) {
			return next(err);
		}
		res.render('bookinstance_delete', { title: bookinstance._id, bookinstance_imp: bookinstance.imprint, book: bookinstance.book.title});
		
	});  
};

// Handle BookInstance delete on POST
exports.bookinstance_delete_post = function(req, res, err) {
	BookInstance.findByIdAndRemove(req.params.id)
	.exec(function(err) {
		if (err) {
			return next(err);
		}
		res.redirect('/catalog/bookinstances');
	});
   
};

// Display BookInstance update form on GET
exports.bookinstance_update_get = function(req, res) {
	BookInstance.findById(req.params.id)
	.populate('book')
	.exec(function(err, bookInstance){
		if (err) {return next(err);}
		
		console.log('book:'+ bookInstance.book);
		console.log('bookInstance:'+ bookInstance);
		console.log('bookInstance_formatted date:'+ bookInstance.due_back_for_form);
		
    res.render('bookInstance_form_test',{title:'Update bookinstance', bookinstance: bookInstance, book: bookInstance.book, 'due': bookInstance.due_back_for_form});
	
	});
};

// Handle bookinstance update on POST
exports.bookinstance_update_post = function(req, res) {
	
	req.checkBody(req.body.book,'book must be specified').notEmpty();
	req.checkBody(req.body.imprint,'imprint must be specified').notEmpty();
	req.checkBody(req.body.status,'status must be specified').notEmpty();
	req.checkBody('due_back', 'Invalid date');
	
	console.log('due_back:'+ req.body.due_back);
	
	req.sanitize('book').escape();
    req.sanitize('imprint').escape();
    req.sanitize('status').escape();
    req.sanitize('book').trim();
    req.sanitize('imprint').trim();   
    req.sanitize('status').trim();
	req.sanitize('due_back').toDate();
	
	var bookinstance = new BookInstance({
        book: req.body.book,
        imprint: req.body.imprint, 
        status: req.body.status,
        due_back: req.body.due_back,
		_id: req.params.id
    });
	
	console.log('bookinstance_id'+bookinstance._id);
	
	console.log('bookinstance_id'+req.params.id);
	
	//var errors = req.validationErrors();
	var errors=null;
	if(errors){
		console.log('errors'+errors);
	}else{
		BookInstance.findByIdAndUpdate(req.params.id, bookinstance, function(err, bookinstance){
			
			if(err){return next(err);}
			
					res.redirect('/catalog/bookinstances');
					
		});
	};
	
	}
	
	