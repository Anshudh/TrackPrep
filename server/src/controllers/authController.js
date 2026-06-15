// Authentication Controller

export const getMe = (req, res) => {
  if (req.user) {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        avatar_url: req.user.avatar_url
      }
    });
  }
  return res.status(401).json({
    success: false,
    message: 'Not authenticated'
  });
};

export const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    
    // Clear session cookie explicitly
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error('Session destroy error during logout:', destroyErr);
      }
      res.clearCookie('connect.sid'); // default express-session cookie name
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/login`);
    });
  });
};

export const mockLogin = (req, res, next) => {
  if (process.env.DEV_MOCK_AUTH !== 'true') {
    return res.status(403).json({
      success: false,
      message: 'Mock authentication is disabled.'
    });
  }

  const mockUser = {
    id: 9999,
    google_id: 'mock_google_id',
    name: 'Mock Developer',
    email: 'dev@trackprep.com',
    avatar_url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
  };

  req.login(mockUser, (err) => {
    if (err) {
      return next(err);
    }
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/dashboard`);
  });
};
