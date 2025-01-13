export class ContextManager {
  static async loadContext() {
    try {
      const response = await fetch('memory_context.json');
      return await response.json();
    } catch (error) {
      console.error('Error loading context:', error);
      return { conversations: [], lastUpdate: new Date().toISOString() };
    }
  }

  static async saveContext(context) {
    try {
      const response = await fetch('memory_context.json', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...context,
          lastUpdate: new Date().toISOString()
        })
      });
      return response.ok;
    } catch (error) {
      console.error('Error saving context:', error);
      return false;
    }
  }
}
