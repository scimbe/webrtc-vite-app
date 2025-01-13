export class WebSocketService {
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      maxReconnectAttempts: 5,
      reconnectTimeout: 1000,
      priorityQueueSize: 100,
      ...options
    };
    
    this.ws = null;
    this.normalQueue = [];
    this.priorityQueue = [];
    this.reconnectAttempts = 0;
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
      this.handleError(error);
      this.handleReconnect();
    }
  }

  setupEventHandlers() {
    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.processMessageQueues();
      this.handlers.open.forEach(handler => handler());
    };

    this.ws.onclose = () => {
      this.handlers.close.forEach(handler => handler());
      this.handleReconnect();
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handlers.message.forEach(handler => handler(message));
      } catch (error) {
        this.handleError(new Error('Invalid message format'));
      }
    };

    this.ws.onerror = (error) => {
      this.handleError(error);
    };
  }

  handleError(error) {
    this.handlers.error.forEach(handler => handler(error));
    if (this.options.onError) {
      this.options.onError(error);
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.options.maxReconnectAttempts) {
      this.reconnectAttempts++;
      if (this.options.onReconnect) {
        this.options.onReconnect(this.reconnectAttempts);
      }
      setTimeout(
        () => this.connect(),
        this.options.reconnectTimeout * Math.pow(2, this.reconnectAttempts - 1)
      );
    }
  }

  send(message, priority = false) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        this.handleError(error);
        return false;
      }
    } else {
      if (priority) {
        if (this.priorityQueue.length < this.options.priorityQueueSize) {
          this.priorityQueue.push(message);
          return true;
        }
        return false;
      }
      this.normalQueue.push(message);
      return true;
    }
  }

  processMessageQueues() {
    while (this.priorityQueue.length > 0) {
      const message = this.priorityQueue.shift();
      this.send(message, true);
    }

    while (this.normalQueue.length > 0) {
      const message = this.normalQueue.shift();
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