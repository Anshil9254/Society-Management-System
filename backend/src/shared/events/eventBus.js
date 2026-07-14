const EventEmitter = require('events');

/**
 * Singleton EventBus used to decouple side-effects from business logic.
 * E.g., when a complaint is created, the service emits an event instead
 * of synchronously calling the notification/email service.
 */
class EventBus extends EventEmitter {}

// Create a single instance to be injected or required across the app
const eventBus = new EventBus();

module.exports = eventBus;
