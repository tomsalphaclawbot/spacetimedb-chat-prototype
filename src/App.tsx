import React, { useState } from 'react';
import './App.css';
import { tables, reducers } from './module_bindings';
import type * as Types from './module_bindings/types';
import { useSpacetimeDB, useTable, useReducer } from 'spacetimedb/react';
import { Identity, Timestamp } from 'spacetimedb';

export type PrettyMessage = {
  senderName: string;
  senderId: Identity;
  text: string;
  sent: Timestamp;
  kind: 'system' | 'user';
};

function App() {
  const [newName, setNewName] = useState('');
  const [settingName, setSettingName] = useState(false);
  const [systemMessages, setSystemMessages] = useState([] as Types.Message[]);
  const [newMessage, setNewMessage] = useState('');
  const [showUsers, setShowUsers] = useState(false);

  const { identity, isActive: connected } = useSpacetimeDB();
  const setName = useReducer(reducers.setName);
  const sendMessage = useReducer(reducers.sendMessage);

  // Subscribe to all messages in the chat
  const [messages] = useTable(tables.message);

  // Subscribe to all online users in the chat
  const [onlineUsers] = useTable(
    tables.user.where(r => r.online.eq(true)),
    {
      onInsert: user => {
        // All users being inserted here are online
        const name = user.name || user.identity.toHexString().substring(0, 8);
        setSystemMessages(prev => [
          ...prev,
          {
            sender: Identity.zero(),
            text: `${name} has connected.`,
            sent: Timestamp.now(),
          },
        ]);
      },
      onDelete: user => {
        // All users being deleted here are offline
        const name = user.name || user.identity.toHexString().substring(0, 8);
        setSystemMessages(prev => [
          ...prev,
          {
            sender: Identity.zero(),
            text: `${name} has disconnected.`,
            sent: Timestamp.now(),
          },
        ]);
      },
    }
  );

  const [offlineUsers] = useTable(tables.user.where(r => r.online.eq(false)));
  const users = [...onlineUsers, ...offlineUsers];

  const prettyMessages: PrettyMessage[] = messages
    .concat(systemMessages)
    .sort((a, b) => (a.sent.toDate() > b.sent.toDate() ? 1 : -1))
    .map(message => {
      const user = users.find(
        u => u.identity.toHexString() === message.sender.toHexString()
      );
      return {
        senderName: user?.name || message.sender.toHexString().substring(0, 8),
        senderId: message.sender,
        text: message.text,
        sent: message.sent,
        kind: Identity.zero().isEqual(message.sender) ? 'system' : 'user',
      };
    });

  console.log('connected:', connected, 'identity:', identity?.toHexString());

  if (!connected || !identity) {
    return (
      <div className="App">
        <h1>Connecting...</h1>
      </div>
    );
  }

  const name = (() => {
    const user = users.find(u => u.identity.isEqual(identity));
    return user?.name || identity?.toHexString().substring(0, 8) || '';
  })();

  const onSubmitNewName = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSettingName(false);
    setName({ name: newName });
  };

  const onSubmitMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNewMessage('');
    sendMessage({ text: newMessage })
      .then(() => {
        console.log('Message sent.');
      })
      .catch(err => {
        console.error('Error sending message:', err);
      });
  };

  return (
    <div className="App">
      <div className="app-shell">
        <div className="profile">
          <div className="profile-title">
            <p className="eyebrow">Profile</p>
            <h1>Welcome back</h1>
          </div>
          <div className="profile-card">
            {!settingName ? (
              <>
                <div className="identity">
                  <div className="avatar">{name.substring(0, 1).toUpperCase()}</div>
                  <div>
                    <p className="identity-name">{name}</p>
                    <p className="identity-meta">
                      {identity.toHexString().substring(0, 12)} •{' '}
                      {connected ? 'Connected' : 'Offline'}
                    </p>
                  </div>
                </div>
                <button
                  className="ghost-button"
                  onClick={() => {
                    setSettingName(true);
                    setNewName(name);
                  }}
                >
                  Edit Name
                </button>
              </>
            ) : (
              <form onSubmit={onSubmitNewName} className="profile-form">
                <input
                  type="text"
                  aria-label="username input"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Choose a display name"
                />
                <button type="submit">Save</button>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => setSettingName(false)}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="chat-shell">
          <div className="message-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Chat</p>
                <h1>Messages</h1>
              </div>
              <div className="panel-meta">
                <span className="pill">{prettyMessages.length} total</span>
                <button
                  type="button"
                  className="ghost-button people-toggle"
                  aria-expanded={showUsers}
                  onClick={() => setShowUsers(true)}
                >
                  People ({onlineUsers.length})
                </button>
              </div>
            </div>

            <div className="messages-scroll">
              {prettyMessages.length < 1 && (
                <div className="empty-state">
                  <p>No messages yet.</p>
                  <span>Start the conversation below.</span>
                </div>
              )}

              <div className="messages">
                {prettyMessages.map((message, key) => {
                  const sentDate = message.sent.toDate();
                  const now = new Date();
                  const isOlderThanDay =
                    now.getFullYear() !== sentDate.getFullYear() ||
                    now.getMonth() !== sentDate.getMonth() ||
                    now.getDate() !== sentDate.getDate();

                  const timeString = sentDate.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const dateString = isOlderThanDay
                    ? sentDate.toLocaleDateString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      }) + ' '
                    : '';

                  const isSelf = message.senderId.isEqual(identity);

                  return (
                    <div
                      key={key}
                      className={`message-bubble ${message.kind} ${
                        isSelf ? 'own' : ''
                      }`}
                    >
                      <div className="message-header">
                        <p className="message-sender">
                          {message.kind === 'system'
                            ? 'System'
                            : message.senderName}
                        </p>
                        <span className="message-time">
                          {dateString}
                          {timeString}
                        </span>
                      </div>
                      <p className="message-text">{message.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="new-message">
              <form onSubmit={onSubmitMessage} className="composer">
                <div>
                  <p className="eyebrow">Compose</p>
                  <h3>New Message</h3>
                </div>
                <textarea
                  aria-label="message input"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Write something thoughtful..."
                  rows={3}
                ></textarea>
                <button type="submit" disabled={!newMessage.trim()}>
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>

        <button
          type="button"
          className={`drawer-backdrop ${showUsers ? 'visible' : ''}`}
          onClick={() => setShowUsers(false)}
          aria-hidden={!showUsers}
          tabIndex={showUsers ? 0 : -1}
        />

        <aside className={`user-drawer ${showUsers ? 'open' : ''}`}>
          <div className="panel-header">
            <div>
              <p className="eyebrow">Presence</p>
              <h1>People</h1>
            </div>
            <div className="panel-meta">
              <span className="pill success">{onlineUsers.length} live</span>
              <button
                type="button"
                className="ghost-button"
                onClick={() => setShowUsers(false)}
              >
                Close
              </button>
            </div>
          </div>

          <div className="presence-list">
            {onlineUsers.map((user, key) => (
              <div className="presence-card" key={key}>
                <div className="status-dot online-dot" />
                <div>
                  <p className="presence-name">
                    {user.name || user.identity.toHexString().substring(0, 8)}
                  </p>
                  <span className="presence-meta">Active now</span>
                </div>
              </div>
            ))}
          </div>

          {offlineUsers.length > 0 && (
            <div className="offline-block">
              <div className="panel-header">
                <div>
                  <p className="eyebrow">Away</p>
                  <h2>Offline</h2>
                </div>
                <div className="panel-meta">
                  <span className="pill muted">{offlineUsers.length}</span>
                </div>
              </div>
              <div className="presence-list">
                {offlineUsers.map((user, key) => (
                  <div className="presence-card muted" key={key}>
                    <div className="status-dot" />
                    <div>
                      <p className="presence-name">
                        {user.name || user.identity.toHexString().substring(0, 8)}
                      </p>
                      <span className="presence-meta">Offline</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default App;
