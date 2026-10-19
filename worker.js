// Static asset server for pip-midnight-nursery.
// Serves files from env.ASSETS with SPA fallback to index.html.

export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};
