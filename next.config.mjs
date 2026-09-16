export default {
  distDir: process.env.ELYSERA_BUILD_DIR || '.next',
  allowedDevOrigins: (process.env.ELYSERA_DEV_HOSTS || '').split(',').map(host => host.trim()).filter(Boolean),
  trailingSlash: false,
  devIndicators: false,
  agentRules: false,
}
