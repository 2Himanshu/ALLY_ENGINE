// importing via module syntax
import { io } from 'socket.io-client';

// directly exporting initsocket method to be used in server.js
export const initSocket = async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity', //If prob accured it won't stop executing the server...that is why infinity
        timeout: 10000,
        transports: ['websocket'],
    };
    // returning io function  where the url on which the server is running will be passed and the options we mentioned above will be passed.
    return io(process.env.REACT_APP_BACKEND_URL, options);
};
