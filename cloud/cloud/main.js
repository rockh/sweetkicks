Parse.Cloud.define("saveSweetKick", function(request, response) {
    var query = new Parse.Query('User');
    var userObjectId = request.params.user;

    query.get(userObjectId, {
        success: function(u) {
            var SweetKick = Parse.Object.extend('SweetKick');
            var sweetKick = new SweetKick();
            var userACL = new Parse.ACL();
            userACL.setWriteAccess(u, true);
            userACL.setPublicReadAccess(false);
            sweetKick.setACL(userACL);

            request.params.user = u;
            sweetKick.save(request.params, {
                success: function(sk) {
                    response.success(sk);
                },
                error: function(sk, err) {
                    response.error('Failed to save SweetKick data. Error: ' + err.code + ', ' + err.message);
                }
            });
        },
        error: function(u, err) {
            response.error('Failed to retrieve user data. Error: ' + err);
        }
    });

});
