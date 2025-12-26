// MCP (Model Context Protocol) scaffold - Version-0
// Provides placeholder functions for context registration and retrieval.

const contexts = new Map();

function registerContext(id, meta) {
  contexts.set(id, { meta, createdAt: new Date().toISOString() });
}

function getContext(id) {
  return contexts.get(id) || null;
}

module.exports = { registerContext, getContext };
