exports.index = function(req, res){
    if(!req.user){
        res.redirect('/login');
    }else{
        res.render('index', { user : req.user});
    }

};

exports.login = function(req, res){
    res.render('login', {error: ''});
};

exports.loginFail = function(req, res){
    res.render('login', {error: 'invalid'});
};

exports.logout = function(req, res){
    req.logout();
    res.redirect('/login');
};


exports.partial = function (req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
};