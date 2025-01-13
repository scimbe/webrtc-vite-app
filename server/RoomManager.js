export default class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(roomId, hostId) {
    if (this.rooms.has(roomId)) {
      throw new Error('Room already exists');
    }

    this.rooms.set(roomId, {
      id: roomId,
      host: hostId,
      participants: new Map(),
      settings: {
        allowChat: true,
        allowScreenShare: true,
        audioEnabled: true,
        videoEnabled: true
      }
    });

    return this.rooms.get(roomId);
  }

  joinRoom(roomId, participantInfo) {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error('Room does not exist');
    }

    if (room.participants.has(participantInfo.userId)) {
      throw new Error('User already in room');
    }

    room.participants.set(participantInfo.userId, {
      userId: participantInfo.userId,
      name: participantInfo.name,
      isHost: participantInfo.isHost || false
    });

    return room;
  }

  leaveRoom(roomId, userId) {
    const room = this.getRoom(roomId);
    if (!room) return;

    room.participants.delete(userId);

    // If host leaves, assign a new host or delete room
    if (room.host === userId) {
      const remainingParticipants = Array.from(room.participants.values());
      if (remainingParticipants.length > 0) {
        // Assign the first remaining participant as host
        room.host = remainingParticipants[0].userId;
        remainingParticipants[0].isHost = true;
      } else {
        // Remove room if no participants
        this.rooms.delete(roomId);
      }
    }
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  getRoomParticipants(roomId) {
    const room = this.getRoom(roomId);
    return room ? Array.from(room.participants.values()) : [];
  }

  updateRoomSettings(roomId, userId, newSettings) {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error('Room does not exist');
    }

    // Validate host permission
    const participant = room.participants.get(userId);
    if (!participant || !participant.isHost) {
      throw new Error('Only host can update room settings');
    }

    // Update allowed settings
    const settingsToUpdate = {
      allowChat: newSettings.allowChat,
      allowScreenShare: newSettings.allowScreenShare,
      audioEnabled: newSettings.audioEnabled,
      videoEnabled: newSettings.videoEnabled
    };

    room.settings = { ...room.settings, ...settingsToUpdate };

    return room;
  }

  kickParticipant(roomId, hostId, participantId) {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error('Room does not exist');
    }

    // Validate host permission
    const host = room.participants.get(hostId);
    if (!host || !host.isHost) {
      throw new Error('Only host can kick participants');
    }

    if (hostId === participantId) {
      throw new Error('Host cannot kick themselves');
    }

    if (!room.participants.has(participantId)) {
      throw new Error('Participant not found in room');
    }

    // Remove participant
    room.participants.delete(participantId);

    return room;
  }
}