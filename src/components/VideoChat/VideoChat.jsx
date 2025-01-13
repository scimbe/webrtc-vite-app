import React, { useState, useEffect, useCallback } from 'react';
import { VideoStream } from '../VideoStream';
import { ControlPanel } from '../ControlPanel';
import { RoomInfo } from '../Room/RoomInfo';
import { RoomControls } from '../Room/RoomControls';
import { RoomChat } from '../Room/RoomChat';
import { RoomInvite } from '../Room/RoomInvite';
import { useRoomWebSocket } from '../../hooks/useRoomWebSocket';

// Rest der Komponente bleibt gleich...
