const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('../config/keys');
const mongoose = require('mongoose');
const User = mongoose.model('users');

passport.serializeUser((user, done) => {
    console.log(user);
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id)
        .then(user => {
            done(null, user);
        });
});

passport.use(new GoogleStrategy({
        clientID: keys.googleClientID,
        clientSecret: keys.googleClientSecret,
        callbackURL: '/auth/google/callback',
        proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
        // console.log('accessToken',accessToken);
        // console.log('refreshToken',refreshToken);
        // console.log('profile : ',profile);

        const existingUser = await User.findOne({googleId: profile.id});

        if (existingUser) {
            //we already have a record with the given profile ID
            return done(null, existingUser);    //section 4 - 38
        }

        //we don't have a user's record with this ID, make a new record
        const user = await new User({googleId: profile.id}).save();
        done(null, user);

    })
);