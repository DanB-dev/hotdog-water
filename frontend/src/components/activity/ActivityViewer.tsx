import React from 'react';
import { Button, Container } from '@mantine/core';
import ConnectionState from './ConnectionState';
import useSocket from '../../hooks/useStreamSocket';

function ActivityViewer() {
  const { socket, isConnected } = useSocket(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjaXRhZGVsIiwiZXhwIjoxNjk0MTYzOTYzLCJqdGkiOiIzYTczZTBjYi03MzYxLTQwYzctYmM0YS1hOTMyOTlmNGE5OTMiLCJjaGFubmVsIjoiNjRkMzU2ZmFhZTE4OGY3ODAyNDQ2ODZiIiwicm9sZSI6Im93bmVyIiwiYXV0aFRva2VuIjoiSjlubGVrT3ItQXJTSnY1TmZsUXlHUmlvQ0lSN0c2VkVpYzRlWnlXd2JRYUJyOHFLIiwidXNlciI6IjY0ZDM1NmZhYWUxODhmNzgwMjQ0Njg2YSIsInVzZXJfaWQiOiI2NjM0MDA2Zi00ZTA2LTQzYzQtOTYzZC0yYTJkYzAxODdhMTQiLCJ1c2VyX3JvbGUiOiJjcmVhdG9yIiwicHJvdmlkZXIiOiJ0d2l0Y2giLCJwcm92aWRlcl9pZCI6Ijc0MjM1NjE5IiwiY2hhbm5lbF9pZCI6ImZkYzhhY2UzLWMzMTAtNDA5Zi1iNzJjLTNkYjYxZTgxZDE1NyIsImNyZWF0b3JfaWQiOiI5OThiMzgyMy0wZjY3LTQzNmUtODg0YS0yODAzZWU0ZTkxNGMifQ.I9m8rFijnQmh9jBabVVZTTPEQhtF8kzEz5dQFNvid9w'
  );

  return (
    <>
      <Container>
        <ConnectionState isConnected={isConnected} />
        <Button
          onClick={() => {
            isConnected ? socket.disconnect() : socket.connect();
          }}
        >
          {isConnected ? 'Disconnect' : 'Connect'}
        </Button>

        <Button
          onClick={() => {
            socket.emit('test', 'test');
          }}
        >
          Emit Test Event
        </Button>
      </Container>
    </>
  );
}

export default ActivityViewer;
