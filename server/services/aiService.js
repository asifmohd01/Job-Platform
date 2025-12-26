// AI Service scaffold - Version-0: provider-agnostic interface
// No AI logic implemented here. This module provides a switchable
// interface for future AI providers (e.g., Gemini, OpenAI).

const providers = {};

// Register a provider implementation: { name: 'openai', handler: {...} }
function registerProvider(name, impl) {
  providers[name] = impl;
}

function getProvider(name) {
  return providers[name] || null;
}

async function callAI(providerName, payload) {
  const provider = getProvider(providerName);
  if (!provider) throw new Error(`AI provider ${providerName} not registered`);
  // delegate to provider implementation
  return provider.call(payload);
}

module.exports = { registerProvider, getProvider, callAI };
