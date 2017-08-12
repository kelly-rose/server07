const mongoose  = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const requireCredits= require('../middlewares/requireCredits');
const Mailer = require('../services/Mailer');
const surveyTemplate = require('../services/emailTemplates/surveyTemplate');
const Survey = mongoose.model('surveys');

//theory 10 - 125,126
module.exports = app =>{

    //section 10 - 138
    app.get('/api/surveys/thanks',(req,res)=>{
        res.send('Thanks for voting!');
    });


    app.post('/api/surveys',requireLogin,requireCredits, async (req,res)=>{
        const {title, subject, body, recipients} = req.body;

        const survey = new Survey({
            title,
            subject,
            body,
            recipients : recipients.split(',').map(email => { return {email:email.trim()}}),
            _user : req.user.id,
            dateSent : Date.now()
        });

        //Great place to send an email !
        const mailer = new Mailer(survey,surveyTemplate(survey));
        try {
            await mailer.send();  //section 10 - 134

            //section 10 - 136
            await survey.save();    //save DB
            req.user.credits -= 1;
            const user = await req.user.save(); //save DB with updating user
            res.send(user);
        }catch (err){
            res.status(422).send(err);
        }

    });
};