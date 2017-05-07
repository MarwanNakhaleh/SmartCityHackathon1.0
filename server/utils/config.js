var env = process.env.NODE_ENV || 'development';
console.log(env);

if (env === 'development') {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/SmartCityHackathon';
} else if (env === 'production') {
  process.env.MONGODB_URI = 'mongodb://heroku_01vs8616:jsdf8imd5eiuuh63cltct3m6h0@ds133281.mlab.com:33281/heroku_01vs8616';
}
