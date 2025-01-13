export class WebSocketService {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.messageQueue = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = 1000;
    this.handlers = {
      open: [],
      close: [],
      message: [],
      error: []
    };

    this.connect();
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.handleReconnect();
    }
  }

  setupEventHandlers() {
    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.processMessageQueue();
      this.handlers.open.forEach(handler => handler());
    };

    this.ws.onclose = () => {
      this.handlers.close.forEach(handler => handler());
      this.handleReconnect();
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handlers.message.forEach(handler => handler(message));
    };

    this.ws.onerror = (error) => {
      this.handlers.error.forEach(handler => handler(error));
    };
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), this.reconnectTimeout * this.reconnectAttempts);
    }
  }

  send(message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }

  processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  onOpen(handler) {
    this.handlers.open.push(handler);
    return () => {
      this.handlers.open = this.handlers.open.filter(h => h !== handler);
    };
  }

  onClose(handler) {
    this.handlers.close.push(handler);
    return () => {
      this.handlers.close = this.handlers.close.filter(h => h !== handler);
    };
  }

  onMessage(handler) {
    this.handlers.message.push(handler);
    return () => {
      this.handlers.message = this.handlers.message.filter(h => h !== handler);
    };
  }

  onError(handler) {
    this.handlers.error.push(handler);
    return () => {
      this.handlers.error = this.handlers.error.filter(h => h !== handler);
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}