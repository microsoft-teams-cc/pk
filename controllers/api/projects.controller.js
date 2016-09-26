var config = require('config.json');
var express = require('express');
var router = express.Router();
var projectService = require('services/project.service');

// routes
router.post('/add', addProject);
router.get('/currentproj', getCurrentProject);
router.put('/:_id', updateProject);
router.delete('/:_id', deleteProject);

module.exports = router;

function registerProject(req, res) {
    projectService.pcreate(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getCurrentProject(req, res) {
    projectService.pgetById(req.project.sub)
        .then(function (project) {
            if (project) {
                res.send(project);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updateProject(req, res) {
    var projectid = req.project.sub;
    if (req.params._id !== projectid) {
        // can only update own project
        return res.status(401).send('You can only update your own Project');
    }

    projectService.pupdate(projectid, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function deleteProject(req, res) {
    var projectid = req.project.sub;
    if (req.params._id !== projectid) {
        // can only delete own project
        return res.status(401).send('You can only delete your own project');
    }

    projectService.pdelete(projectid)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}