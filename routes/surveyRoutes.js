//section 12 - 177
const _ = require('lodash');
const Path = require('path-parser');
const {URL} = require('url');

const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const requireCredits = require('../middlewares/requireCredits');
const Mailer = require('../services/Mailer');
const surveyTemplate = require('../services/emailTemplates/surveyTemplate');
const Survey = mongoose.model('surveys');

//theory 10 - 125,126
module.exports = app => {

    //section 10 - 138
    app.get('/api/surveys/thanks', (req, res) => {
        res.send('Thanks for voting!');
    });

    /* https://tkfkdgodyzofflfhwm.localtunnel.me/api/surveys/webhooks */
    app.post('/api/surveys/webhooks', (req, res) => {
        console.log(req.body);

        //section 12 - 177
        const events = _.map(req.body, ({email, url}) => {
            const pathname = new URL(url).pathname;
            console.log(pathname); ///api/surveys/598f0750d1f94004609c275e/yes
            const p = new Path('/api/surveys/:surveyId/:choice');
            console.log(p);
            const match = p.test(pathname);
            console.log(match); //{ surveyId: '598f07e690798a2e7cc09a16', choice: 'no' }
            //section 12 - 178
            if (match) {
                return {email: email, surveyId: match.surveyId, choice: match.choice};
            }
        });

        console.log(events);  //[ { email: 'h.siri1205@gmail.com',surveyId: '598f08f07156d82cc8dbaa37',choice: 'yes' } ]

        //section 12 - 179
        const compactEvents = _.compact(events);
        console.log(compactEvents);
        const uniqueEvents = _.uniqBy(compactEvents,'email','surveyId');
        console.log(uniqueEvents);

        res.send({});

    });


    app.post('/api/surveys', requireLogin, requireCredits, async (req, res) => {
        const {title, subject, body, recipients} = req.body;

        const survey = new Survey({
            title,
            subject,
            body,
            recipients: recipients.split(',').map(email => {
                return {email: email.trim()}
            }),
            _user: req.user.id,
            dateSent: Date.now()
        });

        //Great place to send an email !
        const mailer = new Mailer(survey, surveyTemplate(survey));
        try {
            await mailer.send();  //section 10 - 134

            //section 10 - 136
            await survey.save();    //save DB
            req.user.credits -= 1;
            const user = await req.user.save(); //save DB with updating user
            res.send(user);
        } catch (err) {
            res.status(422).send(err);
        }

    });
};