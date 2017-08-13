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
    app.get('/api/surveys/:surveyId/:choice', (req, res) => {
        res.send('Thanks for voting!');
    });

    /* section 12 - 180 */
    app.post('/api/surveys/webhooks', (req, res) => {
        console.log(req.body);
        const p = new Path('/api/surveys/:surveyId/:choice');

        _.chain(req.body)
            .map(({email, url}) => {
                const match = p.test(new URL(url).pathname);
                if (match) {
                    return {email, surveyId: match.surveyId, choice: match.choice};
                }
            })
            .compact()
            .uniqBy('email', 'surveyId')
            .each(({surveyId, email, choice}) => {
                Survey.updateOne(
                    {
                        _id: surveyId,
                        recipients: {
                            $elemMatch: {email: email, responded: false}
                        }
                    },
                    {
                        $inc: {[choice]: 1},
                        $set: {'recipients.$.responded': true},
                        lastResponded: new Date()
                    }).exec();
            }).values();

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
}
;