var config = require('config.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('projects');

var service = {};

service.pgetById = pgetById;
service.pcreate = pcreate;
service.pupdate = pupdate;
service.pdelete = pdelete;

module.exports = service;

function pgetById(_id) {
    var deferred = Q.defer();

    db.projects.findById(_id, function (err, project) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (project) {
            deferred.resolve(project);
        } else {
            // project not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function pcreate(projectParam) {
    var deferred = Q.defer();

    // validation
    db.projects.findOne(
        { projectid: projectParam.projectid },
        function (err, project) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (project) {
                // projectid already exists
                deferred.reject('Project Id "' + projectParam.projectid + '" is already taken');
            } else {
                createProject();
            }
        });

    function createProject() {
        // set project object to projectParam
        var project = projectParam

        db.projects.insert(
        		project,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function pupdate(_id, projectParam) {
    var deferred = Q.defer();

    // validation
    db.projects.findById(_id, function (err, project) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (project.projectid !== projectParam.projectid) {
            // project has changed so check if the new projectid is already taken
            db.projects.findOne(
                { projectid: projectParam.projectid },
                function (err, project) {
                    if (err) deferred.reject(err.name + ': ' + err.message);

                    if (project) {
                        // projectid already exists
                        deferred.reject('Project Id "' + req.body.projectid + '" is already taken')
                    } else {
                        updateProject();
                    }
                });
        } else {
            updateProject();
        }
    });

    function updateProject() {
        // fields to update
        var set = {
        	projectName: projectParam.projectName,
            ownerName : projectParam.ownerName,
            projectDesc : projectParam.projectDesc,
            file : projectParam.file,
        };

        db.projects.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function pdelete(_id) {
    var deferred = Q.defer();

    db.projects.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}