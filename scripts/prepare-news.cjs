// Provision the additive News schema only in the existing production deployment.
if(process.env.VERCEL_ENV==='production')require('./setup-elysera-news.cjs');
else console.log('News schema setup skipped outside Vercel production.');
