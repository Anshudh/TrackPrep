import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { query } from './db.js';

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    if (id === 9999) {
      return done(null, {
        id: 9999,
        google_id: 'mock_google_id',
        name: 'Mock Developer',
        email: 'dev@trackprep.com',
        avatar_url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
      });
    }
    const res = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (res.rows.length > 0) {
      done(null, res.rows[0]);
    } else {
      done(null, null);
    }
  } catch (err) {
    done(err, null);
  }
});

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackURL = process.env.GOOGLE_CALLBACK_URL;

const hasGoogleCreds = clientID && clientID !== 'placeholder_client_id' && clientSecret && clientSecret !== 'placeholder_client_secret';

if (hasGoogleCreds) {
  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : '';
        const name = profile.displayName || 'Google User';
        const googleId = profile.id;
        const avatarUrl = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

        try {
          // Find user by google_id
          let userRes = await query('SELECT * FROM users WHERE google_id = $1', [googleId]);
          if (userRes.rows.length > 0) {
            return done(null, userRes.rows[0]);
          }

          // If not found by google_id, check by email to merge accounts
          let emailRes = await query('SELECT * FROM users WHERE email = $1', [email]);
          if (emailRes.rows.length > 0) {
            // Update the existing user with google_id
            const updateRes = await query(
              'UPDATE users SET google_id = $1, avatar_url = COALESCE(avatar_url, $2) WHERE id = $3 RETURNING *',
              [googleId, avatarUrl, emailRes.rows[0].id]
            );
            return done(null, updateRes.rows[0]);
          }

          // Create new user
          const insertRes = await query(
            'INSERT INTO users (google_id, name, email, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *',
            [googleId, name, email, avatarUrl]
          );
          return done(null, insertRes.rows[0]);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
  console.log('Google OAuth Passport strategy successfully initialized.');
} else {
  console.warn('Google OAuth keys missing or placeholder. Passport Google Strategy skipped.');
}

export default passport;
