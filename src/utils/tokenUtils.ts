const jwt = require('jsonwebtoken');

 export const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

export const signVerifyToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_VERIFY_SECRET, {
    expiresIn: process.env.JWT_VERIFY_EXPIRE,
  });
};

export const signResetToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_RESET_SECRET, {
    expiresIn: process.env.JWT_RESET_EXPIRE,
  });
};

export const signUserToken = (phoneNumber: string, producer_id: string) => {
  return jwt.sign({ phoneNumber, producer_id }, process.env.JWT_USER_SECRET, {
    expiresIn: process.env.JWT_USER_EXPIRE,
  });
}

export const signUserVerifyToken = (phoneNumber: string, producer_id: string) => {
  return jwt.sign({ phoneNumber, producer_id }, process.env.JWT_VERIFY_SECRET, {
    expiresIn: process.env.JWT_VERIFY_EXPIRE,
  });
};

